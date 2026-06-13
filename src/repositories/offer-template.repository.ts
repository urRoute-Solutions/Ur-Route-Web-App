import type { OfferTemplate, Prisma, LoyaltyLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const offerTemplateRepository = {
  findById(id: string): Promise<OfferTemplate | null> {
    return prisma.offerTemplate.findUnique({ where: { id } });
  },

  findByOperatorAndLevel(operatorId: string, level: LoyaltyLevel): Promise<OfferTemplate | null> {
    return prisma.offerTemplate.findUnique({
      where: { operatorId_level: { operatorId, level } },
    });
  },

  listByOperator(operatorId: string): Promise<OfferTemplate[]> {
    return prisma.offerTemplate.findMany({
      where: { operatorId, isActive: true },
      orderBy: { level: "asc" },
    });
  },

  create(data: Prisma.OfferTemplateCreateInput): Promise<OfferTemplate> {
    return prisma.offerTemplate.create({ data });
  },

  update(id: string, data: Prisma.OfferTemplateUpdateInput): Promise<OfferTemplate> {
    return prisma.offerTemplate.update({ where: { id }, data });
  },
};
