import { z } from "zod";
import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { getBookingUseCase } from "@/usecases/bookings/get-booking.usecase";
import { AppError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const principal = await requireAuth();
    const { id } = await params;
    const booking = await getBookingUseCase(id, principal);
    return ok({ booking });
  } catch (error) {
    return handleError(error);
  }
}

const passengerSchema = z.object({
  name: z.string().min(2).max(100),
  age: z.number().int().min(1).max(120),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  seatLabel: z.string().min(1).max(10),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
});

const patchSchema = z.object({
  passengers: z.array(passengerSchema).min(1).max(10),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { trip: { select: { departureAt: true, status: true } } },
    });
    if (!booking) throw new NotFoundError("Booking");
    if (booking.userId !== userId) throw new ForbiddenError();
    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
      throw new AppError("Cannot modify a cancelled or completed booking", 409, "BOOKING_NOT_MODIFIABLE");
    }
    if (booking.trip.status !== "SCHEDULED") {
      throw new AppError("Trip has already departed", 409, "TRIP_DEPARTED");
    }

    // Disallow changes within 2 hours of departure
    const hoursUntilDep = (new Date(booking.trip.departureAt).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilDep < 2) {
      throw new AppError("Passenger details can only be changed up to 2 hours before departure", 409, "EDIT_WINDOW_CLOSED");
    }

    const body = patchSchema.parse(await req.json());

    if (body.passengers.length !== booking.passengerCount) {
      throw new AppError(
        `Must provide exactly ${booking.passengerCount} passenger(s)`,
        400,
        "PASSENGER_COUNT_MISMATCH",
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { passengers: body.passengers },
    });

    return ok({ booking: { id: updated.id, pnr: updated.pnr, passengers: updated.passengers } });
  } catch (error) {
    return handleError(error);
  }
}
