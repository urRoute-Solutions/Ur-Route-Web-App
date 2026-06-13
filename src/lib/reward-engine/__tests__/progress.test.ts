import { describe, it, expect } from "vitest";
import { advanceProgress, currentEligibleOffer } from "../progress";
import type { ProgressSnapshot, OfferConfig } from "../types";

const OFFERS: OfferConfig[] = [
  { id: "o1", level: "LEVEL_1", unlockTripNumber: 0, rewardTripNumber: 1, discountType: "PERCENTAGE", percentage: 5, flatAmountMinor: null, maxCapMinor: null, groupBonusPerHead: 0, groupBonusMaxHeads: 0 },
  { id: "o2", level: "LEVEL_2", unlockTripNumber: 2, rewardTripNumber: 4, discountType: "PERCENTAGE", percentage: 10, flatAmountMinor: null, maxCapMinor: null, groupBonusPerHead: 2, groupBonusMaxHeads: 3 },
  { id: "o3", level: "LEVEL_3", unlockTripNumber: 8, rewardTripNumber: 8, discountType: "FLAT", percentage: null, flatAmountMinor: 15000, maxCapMinor: 15000, groupBonusPerHead: 0, groupBonusMaxHeads: 0 },
  { id: "o4", level: "LEVEL_4", unlockTripNumber: 12, rewardTripNumber: 12, discountType: "PERCENTAGE", percentage: 15, flatAmountMinor: null, maxCapMinor: 30000, groupBonusPerHead: 3, groupBonusMaxHeads: 5 },
];

const base: ProgressSnapshot = { currentLevel: "LEVEL_1", completedTrips: 0, cycleCount: 0, status: "ACTIVE" };

describe("advanceProgress", () => {
  it("increments trip count", () => {
    const result = advanceProgress(base, OFFERS);
    expect(result.newCompletedTrips).toBe(1);
  });

  it("stays at LEVEL_1 before reaching LEVEL_2 unlock", () => {
    // LEVEL_2 unlocks at trip 2; at trip 1 we should still be LEVEL_1.
    const result = advanceProgress({ ...base, completedTrips: 0 }, OFFERS);
    expect(result.newLevel).toBe("LEVEL_1");
  });

  it("advances to LEVEL_2 at trip 2", () => {
    const snap: ProgressSnapshot = { ...base, completedTrips: 1 };
    const result = advanceProgress(snap, OFFERS);
    expect(result.newCompletedTrips).toBe(2);
  });

  it("unlocks reward at LEVEL_2 rewardTripNumber (trip 4)", () => {
    const snap: ProgressSnapshot = { ...base, currentLevel: "LEVEL_2", completedTrips: 3 };
    const result = advanceProgress(snap, OFFERS);
    expect(result.rewardUnlocked?.level).toBe("LEVEL_2");
  });

  it("does not unlock reward at non-reward trip", () => {
    const snap: ProgressSnapshot = { ...base, currentLevel: "LEVEL_2", completedTrips: 4 };
    const result = advanceProgress(snap, OFFERS);
    expect(result.rewardUnlocked).toBeNull();
  });
});

describe("currentEligibleOffer", () => {
  it("returns null for frozen progress", () => {
    const snap: ProgressSnapshot = { ...base, status: "FROZEN", completedTrips: 10 };
    expect(currentEligibleOffer(snap, OFFERS)).toBeNull();
  });

  it("returns best eligible offer", () => {
    const snap: ProgressSnapshot = { ...base, currentLevel: "LEVEL_3", completedTrips: 9 };
    const offer = currentEligibleOffer(snap, OFFERS);
    expect(offer?.level).toBe("LEVEL_3");
  });

  it("returns null for 0 trips (LEVEL_1 unlocks at 0, should return L1)", () => {
    const offer = currentEligibleOffer(base, OFFERS);
    expect(offer?.level).toBe("LEVEL_1");
  });
});
