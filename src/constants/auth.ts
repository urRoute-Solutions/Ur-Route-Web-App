/** Auth-related constants shared across transport and domain. */

export const ACCESS_COOKIE = "ur_access";
export const REFRESH_COOKIE = "ur_refresh";

/** bcrypt work factor — 12 is a sane 2025 default (≈250ms/hash). */
export const BCRYPT_ROUNDS = 12;

/** JWT issuer/audience claims. */
export const JWT_ISSUER = "urroute";
export const JWT_AUDIENCE = "urroute:web";
