import { UnauthorizedError } from "@/lib/errors";
import { hashPassword } from "@/lib/auth/password";
import { verifyResetToken } from "@/lib/auth/reset-token";
import { getRedis } from "@/lib/redis";
import { userRepository } from "@/repositories/user.repository";
import { refreshTokenRepository } from "@/repositories/refresh-token.repository";
import type { ResetPasswordInput } from "@/validators/auth";

/**
 * Complete a password reset.
 *  1. Verify the reset token (signature + expiry + audience).
 *  2. Enforce single-use via a Redis marker on the token's jti (best-effort:
 *     skipped when Redis is unavailable in local dev).
 *  3. Update the password hash and revoke ALL refresh tokens — a reset implies
 *     possible compromise, so every existing session is invalidated.
 */
export async function resetPasswordUseCase(
  input: ResetPasswordInput,
): Promise<void> {
  const { userId, jti } = await verifyResetToken(input.token).catch(() => {
    throw new UnauthorizedError("Invalid or expired reset link");
  });

  const redis = getRedis();
  if (redis) {
    const key = `pwd-reset:used:${jti}`;
    const firstUse = await redis.set(key, "1", { nx: true, ex: 1800 });
    if (firstUse === null) {
      throw new UnauthorizedError("This reset link has already been used");
    }
  }

  const user = await userRepository.findById(userId);
  if (!user || !user.isActive) {
    throw new UnauthorizedError("Account unavailable");
  }

  const passwordHash = await hashPassword(input.password);
  await userRepository.update(userId, { passwordHash });
  await refreshTokenRepository.revokeAllForUser(userId);
}
