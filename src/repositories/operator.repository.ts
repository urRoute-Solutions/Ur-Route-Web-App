import type { Operator, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const operatorRepository = {
  findById(id: string): Promise<Operator | null> {
    return prisma.operator.findUnique({ where: { id, deletedAt: null } });
  },

  findBySlug(slug: string): Promise<Operator | null> {
    return prisma.operator.findUnique({ where: { slug, deletedAt: null } });
  },

  findByUrid(urid: string): Promise<Operator | null> {
    return prisma.operator.findUnique({ where: { urid, deletedAt: null } });
  },

  findByOwnerId(ownerId: string): Promise<Operator | null> {
    return prisma.operator.findUnique({ where: { ownerId, deletedAt: null } });
  },

  list(params: {
    status?: Operator["status"];
    city?: string;
    page: number;
    pageSize: number;
  }): Promise<[Operator[], number]> {
    const where: Prisma.OperatorWhereInput = {
      deletedAt: null,
      ...(params.status ? { status: params.status } : {}),
      ...(params.city ? { city: { contains: params.city, mode: "insensitive" } } : {}),
    };
    return Promise.all([
      prisma.operator.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.operator.count({ where }),
    ]);
  },

  create(data: Prisma.OperatorCreateInput): Promise<Operator> {
    return prisma.operator.create({ data });
  },

  update(id: string, data: Prisma.OperatorUpdateInput): Promise<Operator> {
    return prisma.operator.update({ where: { id }, data });
  },

  softDelete(id: string): Promise<Operator> {
    return prisma.operator.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
