import { rewardProgressRepository } from "@/repositories/reward-progress.repository";
import { rewardHistoryRepository } from "@/repositories/reward-history.repository";
import { toRewardProgressDTO, toRewardHistoryDTO } from "@/dto/reward.dto";
import type { RewardProgressDTO, RewardHistoryDTO } from "@/dto/reward.dto";

export async function getRewardProgressUseCase(
  userId: string,
  operatorId?: string,
): Promise<RewardProgressDTO[]> {
  if (operatorId) {
    const p = await rewardProgressRepository.findByUserAndOperator(userId, operatorId);
    return p ? [toRewardProgressDTO(p)] : [];
  }
  const all = await rewardProgressRepository.listByUser(userId);
  return all.map(toRewardProgressDTO);
}

export async function getRewardHistoryUseCase(
  userId: string,
  params: { page?: number; pageSize?: number },
): Promise<{ items: RewardHistoryDTO[]; total: number }> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const [items, total] = await rewardHistoryRepository.listByUser(userId, { page, pageSize });
  return { items: items.map(toRewardHistoryDTO), total };
}
