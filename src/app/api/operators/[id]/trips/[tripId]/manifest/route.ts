import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; tripId: string }> },
) {
  try {
    const principal = await requireAuth();
    const { id: operatorId, tripId } = await params;

    // Only the operator owner or an admin can access the manifest
    if (principal.role === "OPERATOR") {
      const op = await prisma.operator.findUnique({ where: { id: operatorId }, select: { ownerId: true } });
      if (!op) throw new NotFoundError("Operator");
      if (op.ownerId !== principal.userId) throw new ForbiddenError();
    } else if (principal.role !== "ADMIN") {
      throw new ForbiddenError();
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        route: true,
        operator: { select: { name: true, contactEmail: true, contactPhone: true } },
        bookings: {
          where: { status: { in: ["PENDING", "CONFIRMED"] } },
          select: {
            pnr: true,
            status: true,
            passengerCount: true,
            passengers: true,
            seats: { select: { label: true } },
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!trip) throw new NotFoundError("Trip");

    const passengers = trip.bookings.flatMap((b) => {
      const ps = b.passengers as Array<{ name: string; age: number; gender: string; seatLabel: string; phone?: string }>;
      return ps.map((p) => ({
        pnr: b.pnr,
        bookingStatus: b.status,
        seatLabel: p.seatLabel,
        name: p.name,
        age: p.age,
        gender: p.gender,
        phone: p.phone ?? "-",
      }));
    });

    return ok({
      trip: {
        id: trip.id,
        busName: trip.busName,
        origin: trip.route.origin,
        destination: trip.route.destination,
        departureAt: trip.departureAt.toISOString(),
        arrivalAt: trip.arrivalAt.toISOString(),
        totalSeats: trip.totalSeats,
        availableSeats: trip.availableSeats,
        operator: trip.operator,
      },
      passengers,
      totalPassengers: passengers.length,
    });
  } catch (error) {
    return handleError(error);
  }
}
