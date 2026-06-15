import { ForbiddenError, NotFoundError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { bookingRepository } from "@/repositories/booking.repository";
import { toBookingDTO, type BookingDTO } from "@/dto/booking.dto";
import { auditService } from "@/services/audit.service";
import type { AuthPrincipal } from "@/types/auth";

interface PolicyTier {
  hoursBeforeDeparture: number;
  refundPct: number;
}

function computeRefundMinor(
  totalFareMinor: number,
  departureAt: Date,
  tiers: PolicyTier[],
): number {
  const hoursUntilDep = (departureAt.getTime() - Date.now()) / (1000 * 60 * 60);
  // Tiers are sorted desc by hoursBeforeDeparture; pick the first one the traveler still qualifies for
  const sorted = [...tiers].sort((a, b) => b.hoursBeforeDeparture - a.hoursBeforeDeparture);
  const tier = sorted.find((t) => hoursUntilDep >= t.hoursBeforeDeparture) ?? sorted[sorted.length - 1];
  return Math.round(totalFareMinor * (tier!.refundPct / 100));
}

export async function cancelBookingUseCase(
  bookingId: string,
  principal: AuthPrincipal,
): Promise<BookingDTO> {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking");

  if (principal.role === "TRAVELER" && booking.userId !== principal.userId) {
    throw new ForbiddenError();
  }
  if (principal.role === "OPERATOR" && booking.operatorId !== principal.operatorId) {
    throw new ForbiddenError();
  }

  if (booking.status === "CANCELLED") {
    throw new AppError("Booking is already cancelled", 409, "ALREADY_CANCELLED");
  }
  if (booking.status === "COMPLETED") {
    throw new AppError("Completed bookings cannot be cancelled", 409, "BOOKING_COMPLETED");
  }

  // Fetch trip departure + operator cancellation policy for refund calculation
  const [trip, cancellationPolicy] = await Promise.all([
    prisma.trip.findUnique({ where: { id: booking.tripId }, select: { departureAt: true } }),
    prisma.cancellationPolicy.findUnique({ where: { operatorId: booking.operatorId } }),
  ]);

  const defaultTiers: PolicyTier[] = [
    { hoursBeforeDeparture: 24, refundPct: 100 },
    { hoursBeforeDeparture: 4, refundPct: 50 },
    { hoursBeforeDeparture: 0, refundPct: 0 },
  ];
  const tiers = (cancellationPolicy?.tiers as PolicyTier[] | null) ?? defaultTiers;
  const refundMinor = booking.status === "CONFIRMED" && trip
    ? computeRefundMinor(booking.totalFareMinor, trip.departureAt, tiers)
    : 0;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.seat.updateMany({
      where: { bookingId: booking.id },
      data: { isBooked: false, bookingId: null },
    });

    await tx.trip.update({
      where: { id: booking.tripId },
      data: { availableSeats: { increment: booking.passengerCount } },
    });

    // Credit wallet with policy-calculated refund for CONFIRMED bookings
    if (refundMinor > 0) {
      await tx.user.update({
        where: { id: booking.userId },
        data: { walletBalanceMinor: { increment: refundMinor } },
      });
    }

    // Notify the first un-notified waitlist entry for this trip
    const firstWait = await tx.waitlist.findFirst({
      where: { tripId: booking.tripId, notifiedAt: null },
      orderBy: { createdAt: "asc" },
    });
    if (firstWait) {
      await tx.waitlist.update({ where: { id: firstWait.id }, data: { notifiedAt: new Date() } });
      await tx.notification.create({
        data: {
          user: { connect: { id: firstWait.userId } },
          channel: "IN_APP",
          type: "WAITLIST_SEAT_AVAILABLE",
          title: "A seat opened up!",
          body: "A seat on your waitlisted trip just became available. Book now before it's gone.",
          data: { tripId: booking.tripId },
          status: "SENT",
          sentAt: new Date(),
        },
      });
    }

    return tx.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
  }, { timeout: 15000 });

  auditService.record({
    action: "BOOKING_CANCELLED",
    actorId: principal.userId,
    operatorId: booking.operatorId,
    entity: "Booking",
    entityId: booking.id,
  });

  return toBookingDTO(updated);
}
