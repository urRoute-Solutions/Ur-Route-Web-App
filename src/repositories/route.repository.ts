import type { Route, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const routeRepository = {
  findById(id: string, operatorId: string): Promise<Route | null> {
    return prisma.route.findFirst({ where: { id, operatorId, deletedAt: null } });
  },

  listByOperator(
    operatorId: string,
    params: { isActive?: boolean; page: number; pageSize: number },
  ): Promise<[Route[], number]> {
    const where: Prisma.RouteWhereInput = {
      operatorId,
      deletedAt: null,
      ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
    };
    return Promise.all([
      prisma.route.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.route.count({ where }),
    ]);
  },

  create(data: Prisma.RouteCreateInput): Promise<Route> {
    return prisma.route.create({ data });
  },

  update(id: string, operatorId: string, data: Prisma.RouteUpdateInput): Promise<Route> {
    return prisma.route.update({ where: { id }, data });
  },

  softDelete(id: string, operatorId: string): Promise<Route> {
    return prisma.route.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  },
};
