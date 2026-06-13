/** Small ID/code generators that don't warrant a dependency. */

const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars

/** Human-friendly referral code, e.g. "P101S". */
export function generateReferralCode(length = 6): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (let i = 0; i < length; i++) {
    out += REFERRAL_ALPHABET[bytes[i]! % REFERRAL_ALPHABET.length];
  }
  return out;
}

/** A PNR for bookings, e.g. "UR8F3K2Q". */
export function generatePnr(): string {
  return "UR" + generateReferralCode(8);
}

/** RFC4122-ish unique id for token jti / family ids. */
export function uuid(): string {
  return crypto.randomUUID();
}
