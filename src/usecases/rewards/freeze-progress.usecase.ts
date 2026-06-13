import { rewardProgressRepository } from "@/repositories/reward-progress.repository";

/**
 * When a traveler books with operatorId, freeze progress for all OTHER operators
 * and resume (or create) progress for this operator.
 */
export async function handleFreezeOnBookingUseCase(
  userId: string,
  operatorId: string,
): Promise<void> {
  // Freeze all other active progress tracks.
  await rewardProgressRepository.freezeAllExcept(userId, operatorId);

  // Resume this operator's progress if it was frozen.
  const progress = await rewardProgressRepository.findByUserAndOperator(userId, operatorId);
  if (progress?.status === "FROZEN") {
    await rewardProgressRepository.resumeForOperator(userId, operatorId);
  }
}
