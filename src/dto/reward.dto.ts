import type { RewardProgress, RewardHistory, OfferTemplate } from "@prisma/client";

export interface RewardProgressDTO {
  operatorId: string;
  currentLevel: RewardProgress["currentLevel"];
  completedTrips: number;
  status: RewardProgress["status"];
  cycleCount: number;
  lastTripAt: string | null;
  frozenAt: string | null;
}

export interface RewardHistoryDTO {
  id: string;
  operatorId: string;
  level: RewardHistory["level"];
  status: RewardHistory["status"];
  title: string;
  valueMinor: number;
  redeemedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface OfferTemplateDTO {
  id: string;
  operatorId: string;
  level: OfferTemplate["level"];
  title: string;
  description: string | null;
  discountType: OfferTemplate["discountType"];
  percentage: number | null;
  flatAmountMinor: number | null;
  maxCapMinor: number | null;
  groupBonusPerHead: number;
  groupBonusMaxHeads: number;
  unlockTripNumber: number;
  rewardTripNumber: number;
  isActive: boolean;
}

export function toRewardProgressDTO(p: RewardProgress): RewardProgressDTO {
  return {
    operatorId: p.operatorId,
    currentLevel: p.currentLevel,
    completedTrips: p.completedTrips,
    status: p.status,
    cycleCount: p.cycleCount,
    lastTripAt: p.lastTripAt?.toISOString() ?? null,
    frozenAt: p.frozenAt?.toISOString() ?? null,
  };
}

export function toRewardHistoryDTO(h: RewardHistory): RewardHistoryDTO {
  return {
    id: h.id,
    operatorId: h.operatorId,
    level: h.level,
    status: h.status,
    title: h.title,
    valueMinor: h.valueMinor,
    redeemedAt: h.redeemedAt?.toISOString() ?? null,
    expiresAt: h.expiresAt?.toISOString() ?? null,
    createdAt: h.createdAt.toISOString(),
  };
}

export function toOfferTemplateDTO(t: OfferTemplate): OfferTemplateDTO {
  return {
    id: t.id,
    operatorId: t.operatorId,
    level: t.level,
    title: t.title,
    description: t.description,
    discountType: t.discountType,
    percentage: t.percentage,
    flatAmountMinor: t.flatAmountMinor,
    maxCapMinor: t.maxCapMinor,
    groupBonusPerHead: t.groupBonusPerHead,
    groupBonusMaxHeads: t.groupBonusMaxHeads,
    unlockTripNumber: t.unlockTripNumber,
    rewardTripNumber: t.rewardTripNumber,
    isActive: t.isActive,
  };
}
