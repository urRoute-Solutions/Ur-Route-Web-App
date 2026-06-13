import { UnauthorizedError } from "@/lib/errors";
import { sha256 } from "@/lib/auth/hash";
import { verifyRefreshToken } from "@/lib/auth/tokens";
import { logger } from "@/lib/logger";
import { userRepository } from "@/repositories/user.repository";
import { refreshTokenRepository } from "@/repositories/refresh-token.repository";
import { tokenService, type IssuedTokens } from "@/services/token.service";
import type { AuthPrincipal } from "@/types/auth";

interface RequestMeta {
  userAgent?: string | null;
  ip?: string | null;
}

/**
 * Rotate a refresh token.
 *
 * Steps:
 *  1. Verify the JWT signature/expiry (cryptographic gate).
 *  2. Look up its stored hash.
 *  3. REUSE DETECTION: if the stored token is already revoked, the cookie was
 *     replayed (likely stolen). Revoke the entire family and reject.
 *  4. Otherwise revoke the presented token and issue a fresh pair in the SAME
 *     family, linking old→new via `replacedById`.
 */
export async function refreshUseCase(
  refreshToken: string,
  meta: RequestMeta,
): Promise<IssuedTokens> {
  const claims = await verifyRefreshToken(refreshToken).catch(() => {
    throw new UnauthorizedError("Invalid refresh token");
  });

  const stored = await refreshTokenRepository.findByHash(
    await sha256(refreshToken),
  );
  if (!stored) throw new UnauthorizedError("Session not found");

  if (stored.revokedAt) {
    // Replay of a revoked token → assume compromise, kill the lineage.
    await refreshTokenRepository.revokeFamily(stored.familyId);
    logger.warn("Refresh token reuse detected — family revoked", {
      userId: stored.userId,
      familyId: stored.familyId,
    });
    throw new UnauthorizedError("Session expired, please log in again");
  }

  if (stored.expiresAt < new Date()) {
    throw new UnauthorizedError("Session expired, please log in again");
  }

  const user = await userRepository.findById(claims.userId);
  if (!user || !user.isActive) {
    throw new UnauthorizedError("Account unavailable");
  }

  const operatorId =
    user.role === "OPERATOR"
      ? await userRepository.getManagedOperatorId(user.id)
      : null;

  const principal: AuthPrincipal = {
    userId: user.id,
    role: user.role,
    operatorId,
  };

  // Issue the replacement BEFORE revoking, so we can link them.
  const tokens = await tokenService.issueWithinFamily(
    principal,
    stored.familyId,
    meta,
  );
  const replacement = await refreshTokenRepository.findByHash(
    await sha256(tokens.refreshToken),
  );
  await refreshTokenRepository.revoke(stored.id, replacement?.id);

  return tokens;
}
