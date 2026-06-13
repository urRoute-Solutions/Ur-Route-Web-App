import type { FareInput, OfferConfig, DiscountResult } from "./types";

/**
 * Pure discount calculator. Takes an offer config + fare input, returns
 * the breakdown. No I/O — the caller is responsible for persisting results.
 */
export function calculateDiscount(
  offer: OfferConfig,
  fare: FareInput,
): DiscountResult {
  const { baseFareMinor, passengerCount } = fare;

  // Base discount.
  let discountMinor = 0;
  if (offer.discountType === "PERCENTAGE" && offer.percentage != null) {
    discountMinor = Math.round((baseFareMinor * offer.percentage) / 100);
  } else if (offer.discountType === "FLAT" && offer.flatAmountMinor != null) {
    discountMinor = offer.flatAmountMinor;
  }

  // Apply cap.
  if (offer.maxCapMinor != null) {
    discountMinor = Math.min(discountMinor, offer.maxCapMinor);
  }

  // Group bonus: extra % per additional traveler (capped at groupBonusMaxHeads).
  let groupBonusMinor = 0;
  if (offer.groupBonusPerHead > 0 && passengerCount > 1) {
    const extraHeads = Math.min(passengerCount - 1, offer.groupBonusMaxHeads);
    const bonusPct = offer.groupBonusPerHead * extraHeads;
    groupBonusMinor = Math.round((baseFareMinor * bonusPct) / 100);
  }

  // Neither discount nor bonus can exceed the base fare.
  discountMinor = Math.min(discountMinor, baseFareMinor);
  groupBonusMinor = Math.min(groupBonusMinor, baseFareMinor - discountMinor);

  return {
    discountMinor,
    groupBonusMinor,
    totalDiscountMinor: discountMinor + groupBonusMinor,
    appliedLevel: offer.level,
  };
}
