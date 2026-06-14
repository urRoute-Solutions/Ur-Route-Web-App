import { tripRepository } from "@/repositories/trip.repository";
import { prisma } from "@/lib/prisma";
import type { SearchTripsInput } from "@/validators/trip";

export interface TripOffer {
  level: string;
  title: string;
  description: string | null;
  discountType: string;
  percentage: number | null;
  flatAmountMinor: number | null;
  maxCapMinor: number | null;
  groupBonusPerHead: number;
  groupBonusMaxHeads: number;
  unlockTripNumber: number;
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
  offers: TripOffer[];
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

  // Fetch all loyalty tiers for every operator in one query
  const operatorIds = [...new Set(trips.map((t) => t.operatorId))];
  const allOffers = await prisma.offerTemplate.findMany({
    where: { operatorId: { in: operatorIds }, isActive: true },
    select: {
      operatorId: true,
      level: true,
      title: true,
      description: true,
      discountType: true,
      percentage: true,
      flatAmountMinor: true,
      maxCapMinor: true,
      groupBonusPerHead: true,
      groupBonusMaxHeads: true,
      unlockTripNumber: true,
    },
    orderBy: { level: "asc" },
  });
  // Group by operatorId
  const offersByOperator: Record<string, TripOffer[]> = {};
  for (const o of allOffers) {
    if (!offersByOperator[o.operatorId]) offersByOperator[o.operatorId] = [];
    offersByOperator[o.operatorId]!.push(o);
  }

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
    offers: offersByOperator[t.operatorId] ?? [],
  }));

  return { items, total, page: input.page, pageSize: input.pageSize };
}
