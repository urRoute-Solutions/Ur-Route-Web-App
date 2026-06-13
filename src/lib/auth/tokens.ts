import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { getEnv } from "@/config/env";
import { JWT_AUDIENCE, JWT_ISSUER } from "@/constants/auth";
import type {
  AccessTokenClaims,
  AuthPrincipal,
  RefreshTokenClaims,
} from "@/types/auth";

/**
 * JWT signing/verification with `jose`.
 *
 * Why jose (not jsonwebtoken): jose uses the Web Crypto API, so the SAME code
 * verifies tokens in the edge middleware AND in Node route handlers. We sign
 * short-lived access tokens and long-lived refresh tokens with SEPARATE secrets
 * so a leaked access secret can't mint refresh tokens.
 */

function secret(raw: string): Uint8Array {
  return new TextEncoder().encode(raw);
}

function accessSecret() {
  return secret(getEnv().JWT_ACCESS_SECRET);
}
function refreshSecret() {
  return secret(getEnv().JWT_REFRESH_SECRET);
}

export async function signAccessToken(principal: AuthPrincipal): Promise<string> {
  const env = getEnv();
  return new SignJWT({
    role: principal.role,
    operatorId: principal.operatorId ?? null,
    type: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(principal.userId)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${env.JWT_ACCESS_TTL}s`)
    .sign(accessSecret());
}

export async function signRefreshToken(input: {
  userId: string;
  jti: string;
  familyId: string;
}): Promise<string> {
  const env = getEnv();
  return new SignJWT({ familyId: input.familyId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.userId)
    .setJti(input.jti)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${env.JWT_REFRESH_TTL}s`)
    .sign(refreshSecret());
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenClaims> {
  const { payload } = await jwtVerify(token, accessSecret(), {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
  return claimsFromAccess(payload);
}

export async function verifyRefreshToken(
  token: string,
): Promise<RefreshTokenClaims> {
  const { payload } = await jwtVerify(token, refreshSecret(), {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
  if (payload.type !== "refresh" || !payload.sub || !payload.jti) {
    throw new Error("Malformed refresh token");
  }
  return {
    userId: payload.sub,
    jti: payload.jti,
    familyId: String(payload.familyId),
    type: "refresh",
  };
}

function claimsFromAccess(payload: JWTPayload): AccessTokenClaims {
  if (payload.type !== "access" || !payload.sub) {
    throw new Error("Malformed access token");
  }
  return {
    userId: payload.sub,
    role: payload.role as AccessTokenClaims["role"],
    operatorId: (payload.operatorId as string | null) ?? null,
    type: "access",
  };
}
