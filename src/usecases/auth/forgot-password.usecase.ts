import { logger } from "@/lib/logger";
import { signResetToken } from "@/lib/auth/reset-token";
import { userRepository } from "@/repositories/user.repository";
import type { ForgotPasswordInput } from "@/validators/auth";

/**
 * Begin a password reset.
 *
 * IMPORTANT: returns void regardless of whether the email exists, so the
 * endpoint cannot be used to enumerate registered accounts. When the user does
 * exist we mint a reset token and (in M5) hand it to the email queue. Until the
 * email pipeline lands, we log it in dev so the flow is testable.
 */
export async function forgotPasswordUseCase(
  input: ForgotPasswordInput,
): Promise<void> {
  const user = await userRepository.findByEmail(input.email);
  if (!user || !user.isActive) return;

  const { token } = await signResetToken(user.id);

  // TODO(M5): enqueue EmailSent job → Resend with the reset link.
  logger.info("Password reset requested", {
    userId: user.id,
    // Never log the token in production. Dev-only convenience.
    ...(process.env.NODE_ENV !== "production" ? { resetToken: token } : {}),
  });
}
