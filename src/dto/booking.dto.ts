import type { Booking } from "@prisma/client";

export interface BookingDTO {
  id: string;
  operatorId: string;
  userId: string;
  tripId: string;
  pnr: string;
  status: Booking["status"];
  baseFareMinor: number;
  discountMinor: number;
  groupBonusMinor: number;
  taxMinor: number;
  totalFareMinor: number;
  appliedLevel: Booking["appliedLevel"];
  appliedOfferId: string | null;
  passengerCount: number;
  boardingPoint: unknown;
  droppingPoint: unknown;
  passengers: unknown;
  cancelledAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export function toBookingDTO(booking: Booking): BookingDTO {
  return {
    id: booking.id,
    operatorId: booking.operatorId,
    userId: booking.userId,
    tripId: booking.tripId,
    pnr: booking.pnr,
    status: booking.status,
    baseFareMinor: booking.baseFareMinor,
    discountMinor: booking.discountMinor,
    groupBonusMinor: booking.groupBonusMinor,
    taxMinor: booking.taxMinor,
    totalFareMinor: booking.totalFareMinor,
    appliedLevel: booking.appliedLevel,
    appliedOfferId: booking.appliedOfferId,
    passengerCount: booking.passengerCount,
    boardingPoint: booking.boardingPoint,
    droppingPoint: booking.droppingPoint,
    passengers: booking.passengers,
    cancelledAt: booking.cancelledAt?.toISOString() ?? null,
    completedAt: booking.completedAt?.toISOString() ?? null,
    createdAt: booking.createdAt.toISOString(),
  };
}
