import { NotFoundError, ValidationError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { tripRepository } from "@/repositories/trip.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { toBookingDTO, type BookingDTO } from "@/dto/booking.dto";
import { auditService } from "@/services/audit.service";
import { generatePnr } from "@/utils/ids";
import type { CreateBookingInput } from "@/validators/booking";
import type { AuthPrincipal } from "@/types/auth";

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
  const taxMinor = Math.round(baseFareMinor * 0.05); // 5% GST placeholder
  const totalFareMinor = baseFareMinor + taxMinor;

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
        taxMinor,
        totalFareMinor,
        passengerCount: input.passengers.length,
        boardingPoint: input.boardingPoint ?? {},
        droppingPoint: input.droppingPoint ?? {},
        passengers: input.passengers,
        ...(input.appliedOfferId
          ? { appliedOffer: { connect: { id: input.appliedOfferId } } }
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
