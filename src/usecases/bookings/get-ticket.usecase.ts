import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { AuthPrincipal } from "@/types/auth";

export type TicketData = {
  id: string;
  pnr: string;
  status: string;
  passengerCount: number;
  passengers: Array<{ name: string; age: number; gender: string; seatLabel: string }>;
  boardingPoint: { name: string; time?: string } | null;
  droppingPoint: { name: string } | null;
  baseFareMinor: number;
  discountMinor: number;
  groupBonusMinor: number;
  taxMinor: number;
  totalFareMinor: number;
  appliedLevel: string | null;
  createdAt: string;
  trip: {
    busName: string;
    seatType: string;
    layout: string;
    departureAt: string;
    arrivalAt: string;
  };
  route: { origin: string; destination: string };
  operator: { name: string; contactPhone: string | null };
};

export async function getTicketUseCase(
  bookingId: string,
  principal: AuthPrincipal,
): Promise<TicketData> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      trip: { include: { route: true, operator: { select: { name: true, contactPhone: true } } } },
    },
  });

  if (!booking) throw new NotFoundError("Booking");

  if (principal.role === "TRAVELER" && booking.userId !== principal.userId) {
    throw new ForbiddenError();
  }
  if (principal.role === "OPERATOR" && booking.operatorId !== principal.operatorId) {
    throw new ForbiddenError();
  }

  const passengers = (booking.passengers as Array<{ name: string; age: number; gender: string; seatLabel: string }>) ?? [];
  const boardingPoint = booking.boardingPoint as { name: string; time?: string } | null;
  const droppingPoint = booking.droppingPoint as { name: string } | null;

  return {
    id: booking.id,
    pnr: booking.pnr,
    status: booking.status,
    passengerCount: booking.passengerCount,
    passengers,
    boardingPoint,
    droppingPoint,
    baseFareMinor: booking.baseFareMinor,
    discountMinor: booking.discountMinor,
    groupBonusMinor: booking.groupBonusMinor,
    taxMinor: booking.taxMinor,
    totalFareMinor: booking.totalFareMinor,
    appliedLevel: booking.appliedLevel,
    createdAt: booking.createdAt.toISOString(),
    trip: {
      busName: booking.trip.busName,
      seatType: booking.trip.seatType,
      layout: booking.trip.layout,
      departureAt: booking.trip.departureAt.toISOString(),
      arrivalAt: booking.trip.arrivalAt.toISOString(),
    },
    route: {
      origin: booking.trip.route.origin,
      destination: booking.trip.route.destination,
    },
    operator: {
      name: booking.trip.operator.name,
      contactPhone: booking.trip.operator.contactPhone,
    },
  };
}
