import { NotFoundError, ValidationError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { tripRepository } from "@/repositories/trip.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { offerTemplateRepository } from "@/repositories/offer-template.repository";
import { rewardProgressRepository } from "@/repositories/reward-progress.repository";
import { handleFreezeOnBookingUseCase } from "@/usecases/rewards/freeze-progress.usecase";
import { toBookingDTO, type BookingDTO } from "@/dto/booking.dto";
import { auditService } from "@/services/audit.service";
import { generatePnr } from "@/utils/ids";
import type { CreateBookingInput } from "@/validators/booking";
import type { AuthPrincipal } from "@/types/auth";
import type { OfferTemplate } from "@prisma/client";


export async function createBookingUseCase(
  input: CreateBookingInput,
  principal: AuthPrincipal,
): Promise<BookingDTO> {
  const trip = await tripRepository.findById(input.tripId);
  if (!trip) throw new NotFoundError("Trip");

  if (trip.status !== "SCHEDULED") {
    throw new AppError("This trip is no longer bookable", 409, "TRIP_NOT_BOOKABLE");
  }

  // Validate requested seats belong to this trip and are available.
  const requestedSeats = trip.seats.filter((s) => input.seatIds.includes(s.id));
  if (requestedSeats.length !== input.seatIds.length) {
    throw new NotFoundError("One or more seats");
  }
  const alreadyBooked = requestedSeats.filter((s) => s.isBooked);
  if (alreadyBooked.length > 0) {
    throw new ValidationError(
      { seatIds: alreadyBooked.map((s) => s.label) },
      "Some selected seats are already booked",
    );
  }

  if (input.passengers.length !== input.seatIds.length) {
    throw new ValidationError(
      {},
      "Number of passengers must match number of seats",
    );
  }

  // Fare calculation (seats can have individual prices; base is fallback).
  const baseFareMinor = requestedSeats.reduce((sum, s) => sum + s.priceMinor, 0);

  // Loyalty discount — check if traveler has an eligible reward for this operator.
  await handleFreezeOnBookingUseCase(principal.userId, trip.operatorId);
  const [progress, offers] = await Promise.all([
    rewardProgressRepository.findByUserAndOperator(principal.userId, trip.operatorId),
    offerTemplateRepository.listByOperator(trip.operatorId),
  ]);

  let discountMinor = 0;
  let groupBonusMinor = 0;
  let appliedOfferId: string | undefined;

  if (offers.length > 0) {
    // Use the traveler's current level directly (matches UI logic).
    // Fall back to LEVEL_1 for first-ever bookings where no progress record exists yet.
    const userLevel = progress?.currentLevel ?? "LEVEL_1";
    const eligibleOffer = offers.find((o) => o.level === userLevel) ?? offers[0];

    if (eligibleOffer) {
      // Apply primary discount to ONE seat only (not the total fare).
      const pricePerSeat = requestedSeats.length > 0
        ? Math.round(baseFareMinor / requestedSeats.length)
        : baseFareMinor;
      const guestCount = Math.max(0, input.passengers.length - 1);

      if (eligibleOffer.discountType === "PERCENTAGE" && eligibleOffer.percentage != null) {
        discountMinor = Math.round(pricePerSeat * eligibleOffer.percentage / 100);
      } else if (eligibleOffer.discountType === "FLAT" && eligibleOffer.flatAmountMinor != null) {
        discountMinor = eligibleOffer.flatAmountMinor;
      }

      // Colleague bonus: 2% (or groupBonusPerHead) per extra passenger seat.
      if (guestCount > 0) {
        const colleagueRate = eligibleOffer.groupBonusPerHead > 0 ? eligibleOffer.groupBonusPerHead : 2;
        const heads = eligibleOffer.groupBonusMaxHeads > 0
          ? Math.min(guestCount, eligibleOffer.groupBonusMaxHeads)
          : guestCount;
        groupBonusMinor = Math.round(pricePerSeat * (colleagueRate / 100) * heads);
      }

      // Apply max cap to total discount (protects operators).
      if (eligibleOffer.maxCapMinor != null) {
        const rawTotal = discountMinor + groupBonusMinor;
        if (rawTotal > eligibleOffer.maxCapMinor) {
          discountMinor = Math.round(discountMinor * (eligibleOffer.maxCapMinor / rawTotal));
          groupBonusMinor = eligibleOffer.maxCapMinor - discountMinor;
        }
      }

      appliedOfferId = eligibleOffer.id;
    }
  }

  const taxMinor = Math.round((baseFareMinor - discountMinor - groupBonusMinor) * 0.05);
  const totalFareMinor = baseFareMinor - discountMinor - groupBonusMinor + taxMinor;

  const pnr = generatePnr();

  const booking = await prisma.$transaction(async (tx) => {
    // Lock and mark seats as booked.
    await tx.seat.updateMany({
      where: { id: { in: input.seatIds }, isBooked: false },
      data: { isBooked: true },
    });

    // Confirm all were actually locked (race-condition guard).
    const locked = await tx.seat.count({
      where: { id: { in: input.seatIds }, isBooked: true },
    });
    if (locked !== input.seatIds.length) {
      throw new AppError("Seat contention — please retry", 409, "SEAT_CONFLICT");
    }

    const newBooking = await tx.booking.create({
      data: {
        operator: { connect: { id: trip.operatorId } },
        user: { connect: { id: principal.userId } },
        trip: { connect: { id: trip.id } },
        pnr,
        status: "PENDING",
        baseFareMinor,
        discountMinor,
        groupBonusMinor,
        taxMinor,
        totalFareMinor,
        passengerCount: input.passengers.length,
        boardingPoint: input.boardingPoint ?? {},
        droppingPoint: input.droppingPoint ?? {},
        passengers: input.passengers,
        ...(appliedOfferId
          ? { appliedOffer: { connect: { id: appliedOfferId } } }
          : {}),
        seats: { connect: input.seatIds.map((id) => ({ id })) },
      },
    });

    await tx.trip.update({
      where: { id: trip.id },
      data: { availableSeats: { decrement: input.seatIds.length } },
    });

    return newBooking;
  });

  auditService.record({
    action: "BOOKING_CREATED",
    actorId: principal.userId,
    operatorId: trip.operatorId,
    entity: "Booking",
    entityId: booking.id,
    metadata: { pnr },
  });

  return toBookingDTO(booking);
}
