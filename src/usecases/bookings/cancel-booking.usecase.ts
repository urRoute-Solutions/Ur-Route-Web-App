import { ForbiddenError, NotFoundError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { bookingRepository } from "@/repositories/booking.repository";
import { toBookingDTO, type BookingDTO } from "@/dto/booking.dto";
import { auditService } from "@/services/audit.service";
import type { AuthPrincipal } from "@/types/auth";

export async function cancelBookingUseCase(
  bookingId: string,
  principal: AuthPrincipal,
): Promise<BookingDTO> {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking");

  // Travelers can only cancel their own; operators/admins can cancel any in their scope.
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

  const updated = await prisma.$transaction(async (tx) => {
    // Release the seats.
    await tx.seat.updateMany({
      where: { bookingId: booking.id },
      data: { isBooked: false, bookingId: null },
    });

    await tx.trip.update({
      where: { id: booking.tripId },
      data: { availableSeats: { increment: booking.passengerCount } },
    });

    return tx.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
  });

  auditService.record({
    action: "BOOKING_CANCELLED",
    actorId: principal.userId,
    operatorId: booking.operatorId,
    entity: "Booking",
    entityId: booking.id,
  });

  return toBookingDTO(updated);
}
