import { sha256 } from "@/lib/auth/hash";
import { refreshTokenRepository } from "@/repositories/refresh-token.repository";

/**
 * Log out. Revokes the presented refresh token's entire family so the device's
 * session can't be rotated forward. Best-effort: an unknown/expired token is a
 * no-op (the user is effectively logged out either way).
 */
export async function logoutUseCase(refreshToken?: string): Promise<void> {
  if (!refreshToken) return;
  const stored = await refreshTokenRepository.findByHash(
    await sha256(refreshToken),
  );
  if (stored) {
    await refreshTokenRepository.revokeFamily(stored.familyId);
  }
}
