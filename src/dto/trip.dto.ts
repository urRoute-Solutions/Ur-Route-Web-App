import type { Trip, Seat } from "@prisma/client";

export interface SeatDTO {
  id: string;
  label: string;
  deck: Seat["deck"];
  priceMinor: number;
  isBooked: boolean;
  isLadies: boolean;
}

export interface TripDTO {
  id: string;
  operatorId: string;
  routeId: string;
  busName: string;
  seatType: Trip["seatType"];
  layout: string;
  totalSeats: number;
  availableSeats: number;
  basePriceMinor: number;
  departureAt: string;
  arrivalAt: string;
  amenities: unknown;
  status: Trip["status"];
  seats?: SeatDTO[];
  createdAt: string;
}

export function toSeatDTO(seat: Seat): SeatDTO {
  return {
    id: seat.id,
    label: seat.label,
    deck: seat.deck,
    priceMinor: seat.priceMinor,
    isBooked: seat.isBooked,
    isLadies: seat.isLadies,
  };
}

export function toTripDTO(trip: Trip & { seats?: Seat[] }): TripDTO {
  return {
    id: trip.id,
    operatorId: trip.operatorId,
    routeId: trip.routeId,
    busName: trip.busName,
    seatType: trip.seatType,
    layout: trip.layout,
    totalSeats: trip.totalSeats,
    availableSeats: trip.availableSeats,
    basePriceMinor: trip.basePriceMinor,
    departureAt: trip.departureAt.toISOString(),
    arrivalAt: trip.arrivalAt.toISOString(),
    amenities: trip.amenities,
    status: trip.status,
    seats: trip.seats?.map(toSeatDTO),
    createdAt: trip.createdAt.toISOString(),
  };
}
