import type { Booking, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const bookingRepository = {
  findById(id: string): Promise<Booking | null> {
    return prisma.booking.findUnique({ where: { id } });
  },

  findByIdForUser(id: string, userId: string): Promise<Booking | null> {
    return prisma.booking.findFirst({ where: { id, userId } });
  },

  findByPnr(pnr: string): Promise<Booking | null> {
    return prisma.booking.findUnique({ where: { pnr } });
  },

  listByUser(
    userId: string,
    params: { status?: Booking["status"]; page: number; pageSize: number },
  ): Promise<[Booking[], number]> {
    const where: Prisma.BookingWhereInput = {
      userId,
      ...(params.status ? { status: params.status } : {}),
    };
    return Promise.all([
      prisma.booking.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: "desc" },
        include: { trip: { include: { route: true } } },
      }),
      prisma.booking.count({ where }),
    ]);
  },

  listByOperator(
    operatorId: string,
    params: { status?: Booking["status"]; page: number; pageSize: number },
  ): Promise<[Booking[], number]> {
    const where: Prisma.BookingWhereInput = {
      operatorId,
      ...(params.status ? { status: params.status } : {}),
    };
    return Promise.all([
      prisma.booking.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.count({ where }),
    ]);
  },

  create(data: Prisma.BookingCreateInput): Promise<Booking> {
    return prisma.booking.create({ data });
  },

  update(id: string, data: Prisma.BookingUpdateInput): Promise<Booking> {
    return prisma.booking.update({ where: { id }, data });
  },

  countCompletedForUser(userId: string, operatorId: string): Promise<number> {
    return prisma.booking.count({
      where: { userId, operatorId, status: "COMPLETED" },
    });
  },
};
