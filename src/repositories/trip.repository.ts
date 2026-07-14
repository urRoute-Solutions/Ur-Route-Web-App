import type { Trip, Seat, Route, Operator, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TripWithDetails = Trip & {
  seats: Seat[];
  route: Route;
  operator: Pick<Operator, "id" | "name" | "rating" | "logoUrl" | "contactPhone">;
};

export const tripRepository = {
  findById(id: string): Promise<(Trip & { seats: Seat[] }) | null> {
    return prisma.trip.findUnique({ where: { id }, include: { seats: true } });
  },

  findByIdWithDetails(id: string): Promise<TripWithDetails | null> {
    return prisma.trip.findUnique({
      where: { id },
      include: {
        seats: { orderBy: { label: "asc" } },
        route: true,
        operator: { select: { id: true, name: true, rating: true, logoUrl: true, contactPhone: true } },
      },
    }) as Promise<TripWithDetails | null>;
  },

  findByIdForOperator(id: string, operatorId: string): Promise<Trip | null> {
    return prisma.trip.findFirst({ where: { id, operatorId } });
  },

  search(params: {
    origin: string;
    destination: string;
    date: string; // YYYY-MM-DD
    minSeats: number;
    page: number;
    pageSize: number;
  }): Promise<[TripWithDetails[], number]> {
    // Use local-midnight boundaries so searching "June 15" matches trips
    // stored in any timezone offset.
    const dayStart = new Date(`${params.date}T00:00:00`);
    const dayEnd   = new Date(`${params.date}T23:59:59.999`);
    // For a same-day search, don't surface trips that have already departed
    // today — a future date's dayStart is already later than now, so this
    // only narrows the window when the searched date is today (or earlier).
    const now = new Date();
    const departureLowerBound = dayStart > now ? dayStart : now;

    const where: Prisma.TripWhereInput = {
      route: {
        origin:      { contains: params.origin,      mode: "insensitive" },
        destination: { contains: params.destination, mode: "insensitive" },
        isActive:    true,
        deletedAt:   null,
        // The route's availability window must cover the searched travel date
        // (not "now") — an operator can publish a route for future dates.
        AND: [
          { OR: [{ availableFrom: null },  { availableFrom:  { lte: dayEnd } }] },
          { OR: [{ availableUntil: null }, { availableUntil: { gte: dayStart } }] },
        ],
      },
      departureAt:    { gte: departureLowerBound, lte: dayEnd },
      availableSeats: { gte: params.minSeats },
      status:         "SCHEDULED",
    };

    return Promise.all([
      prisma.trip.findMany({
        where,
        skip:      (params.page - 1) * params.pageSize,
        take:      params.pageSize,
        orderBy:   { departureAt: "asc" },
        include: {
          route:    true,
          operator: { select: { id: true, name: true, rating: true, logoUrl: true, contactPhone: true } },
        },
      }) as Promise<TripWithDetails[]>,
      prisma.trip.count({ where }),
    ]);
  },

  async getPlaces(): Promise<{ origins: string[]; destinations: string[] }> {
    const routes = await prisma.route.findMany({
      where: { isActive: true, deletedAt: null },
      select: { origin: true, destination: true },
    });
    // Route data can carry the same city in different casings depending on
    // whether it was typed as an origin or a destination (operators type
    // freely at route-creation time). The frontend merges both lists into
    // one autocomplete set, so canonicalize casing across BOTH lists
    // together — not each list on its own — or the same city can still show
    // up twice once merged (e.g. "Coimbatore" as a destination, "coimbatore"
    // as a different route's origin).
    const canonical = canonicalCasing([
      ...routes.map((r) => r.origin),
      ...routes.map((r) => r.destination),
    ]);
    const origins      = dedupeWithCanonical(routes.map((r) => r.origin), canonical);
    const destinations = dedupeWithCanonical(routes.map((r) => r.destination), canonical);
    return { origins, destinations };
  },

  listByOperator(
    operatorId: string,
    params: { page: number; pageSize: number; routeId?: string },
  ): Promise<[Trip[], number]> {
    const where: Prisma.TripWhereInput = {
      operatorId,
      ...(params.routeId ? { routeId: params.routeId } : {}),
    };
    return Promise.all([
      prisma.trip.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { departureAt: "desc" },
      }),
      prisma.trip.count({ where }),
    ]);
  },

  create(data: Prisma.TripCreateInput): Promise<Trip> {
    return prisma.trip.create({ data });
  },

  createWithSeats(
    tripData: Prisma.TripCreateInput,
    seats: Prisma.SeatCreateManyTripInput[],
  ): Promise<Trip> {
    return prisma.trip.create({
      data: {
        ...tripData,
        seats: { createMany: { data: seats } },
      },
    });
  },

  update(id: string, data: Prisma.TripUpdateInput): Promise<Trip> {
    return prisma.trip.update({ where: { id }, data });
  },

  decrementAvailableSeats(id: string, count: number): Promise<Trip> {
    return prisma.trip.update({
      where: { id },
      data: { availableSeats: { decrement: count } },
    });
  },

  incrementAvailableSeats(id: string, count: number): Promise<Trip> {
    return prisma.trip.update({
      where: { id },
      data: { availableSeats: { increment: count } },
    });
  },
};

/** Maps each city's lowercase form to the first-seen casing across a combined pool of values. */
function canonicalCasing(values: string[]): Map<string, string> {
  const canonical = new Map<string, string>();
  for (const value of values) {
    const key = value.toLowerCase();
    if (!canonical.has(key)) canonical.set(key, value);
  }
  return canonical;
}

/** Dedup a list case-insensitively, using a shared canonical casing so the same city reads identically across separate lists. */
function dedupeWithCanonical(values: string[], canonical: Map<string, string>): string[] {
  const keys = new Set(values.map((v) => v.toLowerCase()));
  return [...keys].map((k) => canonical.get(k)!).sort((a, b) => a.localeCompare(b));
}
