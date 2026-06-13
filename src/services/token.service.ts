import { getEnv } from "@/config/env";
import { sha256 } from "@/lib/auth/hash";
import { signAccessToken, signRefreshToken } from "@/lib/auth/tokens";
import { refreshTokenRepository } from "@/repositories/refresh-token.repository";
import type { AuthPrincipal } from "@/types/auth";
import { uuid } from "@/utils/ids";

interface RequestMeta {
  userAgent?: string | null;
  ip?: string | null;
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Mints access + refresh tokens and persists the refresh token HASHED, tagged
 * with a rotation `familyId`. On rotation we reuse the family so reuse of a
 * revoked token can be traced to (and kill) the whole lineage.
 */
async function issue(
  principal: AuthPrincipal,
  familyId: string,
  meta: RequestMeta,
): Promise<IssuedTokens> {
  const env = getEnv();
  const jti = uuid();

  const accessToken = await signAccessToken(principal);
  const refreshToken = await signRefreshToken({
    userId: principal.userId,
    jti,
    familyId,
  });

  await refreshTokenRepository.create({
    userId: principal.userId,
    tokenHash: await sha256(refreshToken),
    familyId,
    expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL * 1000),
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  return { accessToken, refreshToken };
}

export const tokenService = {
  /** First login/registration — starts a fresh rotation family. */
  issueForNewSession(principal: AuthPrincipal, meta: RequestMeta) {
    return issue(principal, uuid(), meta);
  },

  /** Continue an existing rotation family (used during refresh). */
  issueWithinFamily(
    principal: AuthPrincipal,
    familyId: string,
    meta: RequestMeta,
  ) {
    return issue(principal, familyId, meta);
  },

  hash: sha256,
};
