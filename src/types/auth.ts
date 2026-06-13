import type { Role } from "@prisma/client";

/** Minimal identity carried in the access token + request context. */
export interface AuthPrincipal {
  userId: string;
  role: Role;
  /** Present only for OPERATOR-role principals; their tenant. */
  operatorId?: string | null;
}

/** Access-token JWT claims (what we sign). */
export interface AccessTokenClaims extends AuthPrincipal {
  type: "access";
}

/** Refresh-token JWT claims. `jti`+`familyId` enable rotation & reuse detection. */
export interface RefreshTokenClaims {
  userId: string;
  jti: string;
  familyId: string;
  type: "refresh";
}
