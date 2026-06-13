import { SignJWT, jwtVerify } from "jose";
import { getEnv } from "@/config/env";
import { JWT_ISSUER } from "@/constants/auth";
import { uuid } from "@/utils/ids";

/**
 * Password-reset tokens: short-lived (30m) signed JWTs with a distinct audience
 * so they can never be used as access/refresh tokens. Single-use is enforced by
 * recording the `jti` in Redis once consumed (best-effort; see reset use case).
 */
const RESET_AUDIENCE = "urroute:pwd-reset";
const RESET_TTL = "30m";

function secret(): Uint8Array {
  // Reuse the access secret but the unique audience domain-separates it.
  return new TextEncoder().encode(getEnv().JWT_ACCESS_SECRET);
}

export async function signResetToken(userId: string): Promise<{
  token: string;
  jti: string;
}> {
  const jti = uuid();
  const token = await new SignJWT({ purpose: "pwd-reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setJti(jti)
    .setIssuer(JWT_ISSUER)
    .setAudience(RESET_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(RESET_TTL)
    .sign(secret());
  return { token, jti };
}

export async function verifyResetToken(token: string): Promise<{
  userId: string;
  jti: string;
}> {
  const { payload } = await jwtVerify(token, secret(), {
    issuer: JWT_ISSUER,
    audience: RESET_AUDIENCE,
  });
  if (!payload.sub || !payload.jti) throw new Error("Malformed reset token");
  return { userId: payload.sub, jti: payload.jti };
}
