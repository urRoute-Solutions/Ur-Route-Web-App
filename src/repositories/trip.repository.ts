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

    const where: Prisma.TripWhereInput = {
      route: {
        origin:      { contains: params.origin,      mode: "insensitive" },
        destination: { contains: params.destination, mode: "insensitive" },
        isActive:    true,
        deletedAt:   null,
      },
      departureAt:    { gte: dayStart, lte: dayEnd },
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
    const origins      = [...new Set(routes.map((r) => r.origin))].sort();
    const destinations = [...new Set(routes.map((r) => r.destination))].sort();
    return { origins, destinations };
  },

  listByOperator(
    operatorId: string,
    params: { page: number; pageSize: number },
  ): Promise<[Trip[], number]> {
    const where: Prisma.TripWhereInput = { operatorId };
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
