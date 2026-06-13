import type { LoyaltyLevel } from "@prisma/client";
import type { ProgressSnapshot, OfferConfig, ProgressResult } from "./types";

// Progression order. L4 cycles back to L3 (never resets to L1/L2).
const LEVEL_ORDER: LoyaltyLevel[] = ["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4"];

function nextAfterLevel4(): LoyaltyLevel {
  return "LEVEL_3";
}

function advanceLevel(
  current: LoyaltyLevel,
  cycleCount: number,
): { level: LoyaltyLevel; cycleCount: number } {
  if (current === "LEVEL_4") {
    return { level: nextAfterLevel4(), cycleCount: cycleCount + 1 };
  }
  const idx = LEVEL_ORDER.indexOf(current);
  return { level: LEVEL_ORDER[idx + 1] ?? current, cycleCount };
}

/**
 * Pure function: given a progress snapshot and operator offer configs,
 * compute the state after one more completed trip.
 *
 * No I/O. No side effects. Safe to unit-test in isolation.
 */
export function advanceProgress(
  snapshot: ProgressSnapshot,
  offers: OfferConfig[],
): ProgressResult {
  const newCompletedTrips = snapshot.completedTrips + 1;
  let level = snapshot.currentLevel;
  let cycleCount = snapshot.cycleCount;
  let rewardUnlocked: OfferConfig | null = null;

  // Find offer for current level to check if we should advance.
  const currentOffer = offers.find((o) => o.level === level);

  if (currentOffer) {
    // Cross the unlock threshold → advance to next level.
    if (newCompletedTrips >= currentOffer.unlockTripNumber && level !== "LEVEL_4") {
      // Check if the NEXT level's unlock is triggered.
      const nextLevelKey = LEVEL_ORDER[LEVEL_ORDER.indexOf(level) + 1];
      if (nextLevelKey) {
        const nextOffer = offers.find((o) => o.level === nextLevelKey);
        if (nextOffer && newCompletedTrips >= nextOffer.unlockTripNumber) {
          ({ level, cycleCount } = advanceLevel(level, cycleCount));
        }
      }
    }

    // After potential level change, check rewardTripNumber for the new level.
    const activeOffer = offers.find((o) => o.level === level);
    if (activeOffer && newCompletedTrips === activeOffer.rewardTripNumber) {
      rewardUnlocked = activeOffer;
    }

    // L4 cycle check.
    if (level === "LEVEL_4" && newCompletedTrips >= currentOffer.rewardTripNumber) {
      const l4Offer = offers.find((o) => o.level === "LEVEL_4");
      if (l4Offer && newCompletedTrips > l4Offer.rewardTripNumber) {
        const cycleBase = l4Offer.rewardTripNumber;
        const cycleLen = l4Offer.rewardTripNumber - (offers.find((o) => o.level === "LEVEL_3")?.rewardTripNumber ?? 8);
        if (cycleLen > 0 && (newCompletedTrips - cycleBase) % cycleLen === 0) {
          ({ level, cycleCount } = advanceLevel(level, cycleCount));
          const cycledOffer = offers.find((o) => o.level === level);
          if (cycledOffer) rewardUnlocked = cycledOffer;
        }
      }
    }
  }

  return { newLevel: level, newCompletedTrips, newCycleCount: cycleCount, rewardUnlocked };
}

/**
 * Simpler, direct level calculator used at booking creation to determine
 * which level's discount the traveler is entitled to.
 */
export function currentEligibleOffer(
  snapshot: ProgressSnapshot,
  offers: OfferConfig[],
): OfferConfig | null {
  if (snapshot.status === "FROZEN") return null;
  // Find the highest level the traveler has unlocked (completedTrips >= unlockTripNumber).
  const eligible = offers
    .filter((o) => snapshot.completedTrips >= o.unlockTripNumber)
    .sort((a, b) => LEVEL_ORDER.indexOf(b.level) - LEVEL_ORDER.indexOf(a.level));
  return eligible[0] ?? null;
}
