import { tripRepository } from "@/repositories/trip.repository";
import type { SearchTripsInput } from "@/validators/trip";

export interface TripSearchItem {
  id: string;
  busName: string;
  seatType: string;
  layout: string;
  totalSeats: number;
  availableSeats: number;
  basePriceMinor: number;
  departureAt: string;
  arrivalAt: string;
  amenities: unknown;
  status: string;
  route: { origin: string; destination: string; distanceKm: number | null; durationMin: number | null; boardingPoints: unknown; droppingPoints: unknown };
  operator: { id: string; name: string; rating: number; logoUrl: string | null };
}

export async function searchTripsUseCase(
  input: SearchTripsInput,
): Promise<{ items: TripSearchItem[]; total: number; page: number; pageSize: number }> {
  const [trips, total] = await tripRepository.search({
    origin: input.origin,
    destination: input.destination,
    date: input.date,
    minSeats: input.passengers,
    page: input.page,
    pageSize: input.pageSize,
  });

  const items: TripSearchItem[] = trips.map((t) => ({
    id:             t.id,
    busName:        t.busName,
    seatType:       t.seatType,
    layout:         t.layout,
    totalSeats:     t.totalSeats,
    availableSeats: t.availableSeats,
    basePriceMinor: t.basePriceMinor,
    departureAt:    t.departureAt.toISOString(),
    arrivalAt:      t.arrivalAt.toISOString(),
    amenities:      t.amenities,
    status:         t.status,
    route: {
      origin:         t.route.origin,
      destination:    t.route.destination,
      distanceKm:     t.route.distanceKm,
      durationMin:    t.route.durationMin,
      boardingPoints: t.route.boardingPoints,
      droppingPoints: t.route.droppingPoints,
    },
    operator: {
      id:      t.operator.id,
      name:    t.operator.name,
      rating:  t.operator.rating,
      logoUrl: t.operator.logoUrl,
    },
  }));

  return { items, total, page: input.page, pageSize: input.pageSize };
}
