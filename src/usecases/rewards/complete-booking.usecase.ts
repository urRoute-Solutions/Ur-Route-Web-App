import { prisma } from "@/lib/prisma";
import { rewardProgressRepository } from "@/repositories/reward-progress.repository";
import { rewardHistoryRepository } from "@/repositories/reward-history.repository";
import { offerTemplateRepository } from "@/repositories/offer-template.repository";
import { advanceProgress } from "@/lib/reward-engine";
import type { OfferConfig } from "@/lib/reward-engine";
import type { OfferTemplate } from "@prisma/client";

function toOfferConfig(t: OfferTemplate): OfferConfig {
  return {
    id: t.id,
    level: t.level,
    unlockTripNumber: t.unlockTripNumber,
    rewardTripNumber: t.rewardTripNumber,
    discountType: t.discountType,
    percentage: t.percentage,
    flatAmountMinor: t.flatAmountMinor,
    maxCapMinor: t.maxCapMinor,
    groupBonusPerHead: t.groupBonusPerHead,
    groupBonusMaxHeads: t.groupBonusMaxHeads,
  };
}

/**
 * Called when a booking transitions to COMPLETED (trip finished).
 * Advances the traveler's loyalty progress for this operator and records
 * any newly unlocked reward in RewardHistory.
 */
export async function completeBookingRewardsUseCase(
  bookingId: string,
  userId: string,
  operatorId: string,
): Promise<void> {
  const offers = await offerTemplateRepository.listByOperator(operatorId);
  if (offers.length === 0) return; // operator hasn't set up loyalty yet

  const offerConfigs = offers.map(toOfferConfig);

  // Get or initialise progress.
  let progress = await rewardProgressRepository.findByUserAndOperator(userId, operatorId);
  if (!progress) {
    progress = await rewardProgressRepository.upsert(userId, operatorId, {
      currentLevel: "LEVEL_1",
      completedTrips: 0,
      status: "ACTIVE",
    });
  }

  const result = advanceProgress(
    {
      currentLevel: progress.currentLevel,
      completedTrips: progress.completedTrips,
      cycleCount: progress.cycleCount,
      status: progress.status,
    },
    offerConfigs,
  );

  await prisma.$transaction(async (tx) => {
    await tx.rewardProgress.update({
      where: { userId_operatorId: { userId, operatorId } },
      data: {
        currentLevel: result.newLevel,
        completedTrips: result.newCompletedTrips,
        cycleCount: result.newCycleCount,
        lastTripAt: new Date(),
        status: "ACTIVE",
      },
    });

    if (result.rewardUnlocked) {
      await tx.rewardHistory.create({
        data: {
          user: { connect: { id: userId } },
          operator: { connect: { id: operatorId } },
          booking: { connect: { id: bookingId } },
          level: result.rewardUnlocked.level,
          status: "UNLOCKED",
          title: offers.find((o) => o.level === result.rewardUnlocked!.level)?.title ?? "Reward unlocked",
          valueMinor: 0,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90-day expiry
        },
      });
    }
  }, { timeout: 15000 });
}
