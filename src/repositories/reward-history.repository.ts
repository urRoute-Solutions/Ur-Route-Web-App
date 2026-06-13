import type { RewardHistory, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const rewardHistoryRepository = {
  listByUser(
    userId: string,
    params: { page: number; pageSize: number },
  ): Promise<[RewardHistory[], number]> {
    const where: Prisma.RewardHistoryWhereInput = { userId };
    return Promise.all([
      prisma.rewardHistory.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.rewardHistory.count({ where }),
    ]);
  },

  create(data: Prisma.RewardHistoryCreateInput): Promise<RewardHistory> {
    return prisma.rewardHistory.create({ data });
  },
};
