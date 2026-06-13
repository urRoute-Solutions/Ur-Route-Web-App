import type { RewardProgress, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const rewardProgressRepository = {
  findByUserAndOperator(userId: string, operatorId: string): Promise<RewardProgress | null> {
    return prisma.rewardProgress.findUnique({ where: { userId_operatorId: { userId, operatorId } } });
  },

  listByUser(userId: string): Promise<RewardProgress[]> {
    return prisma.rewardProgress.findMany({ where: { userId } });
  },

  upsert(
    userId: string,
    operatorId: string,
    data: Pick<Prisma.RewardProgressCreateInput, "currentLevel" | "completedTrips" | "status">,
  ): Promise<RewardProgress> {
    return prisma.rewardProgress.upsert({
      where: { userId_operatorId: { userId, operatorId } },
      create: {
        user: { connect: { id: userId } },
        operator: { connect: { id: operatorId } },
        ...data,
      },
      update: data,
    });
  },

  freezeAllExcept(userId: string, keepOperatorId: string): Promise<Prisma.BatchPayload> {
    return prisma.rewardProgress.updateMany({
      where: { userId, operatorId: { not: keepOperatorId }, status: "ACTIVE" },
      data: { status: "FROZEN", frozenAt: new Date() },
    });
  },

  resumeForOperator(userId: string, operatorId: string): Promise<RewardProgress | null> {
    return prisma.rewardProgress.update({
      where: { userId_operatorId: { userId, operatorId } },
      data: { status: "ACTIVE", resumedAt: new Date(), frozenAt: null },
    });
  },
};
