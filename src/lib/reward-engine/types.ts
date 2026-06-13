import type { LoyaltyLevel, DiscountType, ProgressStatus } from "@prisma/client";

export type { LoyaltyLevel, DiscountType, ProgressStatus };

export interface ProgressSnapshot {
  currentLevel: LoyaltyLevel;
  completedTrips: number;
  cycleCount: number;
  status: ProgressStatus;
}

export interface OfferConfig {
  id: string;
  level: LoyaltyLevel;
  unlockTripNumber: number;
  rewardTripNumber: number;
  discountType: DiscountType;
  percentage: number | null;
  flatAmountMinor: number | null;
  maxCapMinor: number | null;
  groupBonusPerHead: number;
  groupBonusMaxHeads: number;
}

export interface FareInput {
  baseFareMinor: number;
  passengerCount: number;
}

export interface ProgressResult {
  newLevel: LoyaltyLevel;
  newCompletedTrips: number;
  newCycleCount: number;
  /** Offer that just became active at this trip (null if no change). */
  rewardUnlocked: OfferConfig | null;
}

export interface DiscountResult {
  discountMinor: number;
  groupBonusMinor: number;
  totalDiscountMinor: number;
  appliedLevel: LoyaltyLevel;
}
