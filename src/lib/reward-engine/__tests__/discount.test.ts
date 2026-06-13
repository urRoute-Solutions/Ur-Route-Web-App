import { describe, it, expect } from "vitest";
import { calculateDiscount } from "../discount";
import type { OfferConfig } from "../types";

const pctOffer: OfferConfig = {
  id: "o1", level: "LEVEL_2", unlockTripNumber: 2, rewardTripNumber: 4,
  discountType: "PERCENTAGE", percentage: 10, flatAmountMinor: null, maxCapMinor: null,
  groupBonusPerHead: 2, groupBonusMaxHeads: 3,
};

const flatOffer: OfferConfig = {
  id: "o2", level: "LEVEL_3", unlockTripNumber: 8, rewardTripNumber: 8,
  discountType: "FLAT", percentage: null, flatAmountMinor: 15000, maxCapMinor: 15000,
  groupBonusPerHead: 0, groupBonusMaxHeads: 0,
};

describe("calculateDiscount", () => {
  it("calculates percentage discount", () => {
    const result = calculateDiscount(pctOffer, { baseFareMinor: 100000, passengerCount: 1 });
    expect(result.discountMinor).toBe(10000);
  });

  it("applies max cap", () => {
    const capped = { ...pctOffer, maxCapMinor: 5000 };
    const result = calculateDiscount(capped, { baseFareMinor: 100000, passengerCount: 1 });
    expect(result.discountMinor).toBe(5000);
  });

  it("calculates flat discount", () => {
    const result = calculateDiscount(flatOffer, { baseFareMinor: 50000, passengerCount: 1 });
    expect(result.discountMinor).toBe(15000);
  });

  it("calculates group bonus for extra passengers", () => {
    const result = calculateDiscount(pctOffer, { baseFareMinor: 100000, passengerCount: 3 });
    // 2 extra heads × 2% = 4% group bonus
    expect(result.groupBonusMinor).toBe(4000);
  });

  it("caps group bonus at groupBonusMaxHeads", () => {
    const result = calculateDiscount(pctOffer, { baseFareMinor: 100000, passengerCount: 10 });
    // max 3 extra heads × 2% = 6%
    expect(result.groupBonusMinor).toBe(6000);
  });

  it("does not exceed base fare", () => {
    const massiveOffer = { ...pctOffer, percentage: 200 };
    const result = calculateDiscount(massiveOffer, { baseFareMinor: 10000, passengerCount: 1 });
    expect(result.discountMinor).toBeLessThanOrEqual(10000);
  });

  it("returns correct totalDiscountMinor", () => {
    const result = calculateDiscount(pctOffer, { baseFareMinor: 100000, passengerCount: 2 });
    expect(result.totalDiscountMinor).toBe(result.discountMinor + result.groupBonusMinor);
  });
});
