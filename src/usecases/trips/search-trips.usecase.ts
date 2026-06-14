import { tripRepository } from "@/repositories/trip.repository";
import { prisma } from "@/lib/prisma";
import type { SearchTripsInput } from "@/validators/trip";

export interface TripOffer {
  level: string;
  title: string;
  discountType: string;
  percentage: number | null;
  flatAmountMinor: number | null;
  groupBonusPerHead: number;
  groupBonusMaxHeads: number;
}

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
  offer: TripOffer | null;
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

  // Fetch LEVEL_1 offers for all operators in one query
  const operatorIds = [...new Set(trips.map((t) => t.operatorId))];
  const offers = await prisma.offerTemplate.findMany({
    where: { operatorId: { in: operatorIds }, level: "LEVEL_1", isActive: true },
    select: {
      operatorId: true,
      level: true,
      title: true,
      discountType: true,
      percentage: true,
      flatAmountMinor: true,
      groupBonusPerHead: true,
      groupBonusMaxHeads: true,
    },
  });
  const offerByOperator = Object.fromEntries(offers.map((o) => [o.operatorId, o]));

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
    offer: offerByOperator[t.operatorId] ?? null,
  }));

  return { items, total, page: input.page, pageSize: input.pageSize };
}
