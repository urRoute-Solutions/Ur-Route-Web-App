import { ConflictError } from "@/lib/errors";
import { hashPassword } from "@/lib/auth/password";
import { userRepository } from "@/repositories/user.repository";
import { tokenService, type IssuedTokens } from "@/services/token.service";
import { auditService } from "@/services/audit.service";
import { notificationService } from "@/services/notification.service";
import { createVerificationToken } from "@/lib/auth/email-verification";
import { toUserDTO, type UserDTO } from "@/dto/user.dto";
import { generateReferralCode } from "@/utils/ids";
import { logger } from "@/lib/logger";
import type { RegisterInput } from "@/validators/auth";
import type { AuthPrincipal } from "@/types/auth";

interface RequestMeta {
  userAgent?: string | null;
  ip?: string | null;
}

/**
 * Register a traveler.
 *
 * Orchestration only: enforce uniqueness, resolve referral, hash password,
 * persist, then mint a session. Each step delegates to a repository/service —
 * the use case owns the *sequence*, not the mechanics.
 */
export async function registerUseCase(
  input: RegisterInput,
  meta: RequestMeta,
): Promise<{ user: UserDTO; tokens: IssuedTokens }> {
  if (await userRepository.findByEmail(input.email)) {
    throw new ConflictError("An account with this email already exists");
  }

  // Resolve referrer (best-effort: an invalid code simply isn't credited).
  let referredById: string | undefined;
  if (input.referralCode) {
    const referrer = await userRepository.findByReferralCode(
      input.referralCode,
    );
    referredById = referrer?.id;
  }

  const passwordHash = await hashPassword(input.password);
  const referralCode = await uniqueReferralCode();

  const user = await userRepository.create({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    passwordHash,
    referralCode,
    role: "TRAVELER",
    ...(referredById ? { referredBy: { connect: { id: referredById } } } : {}),
  });

  const principal: AuthPrincipal = {
    userId: user.id,
    role: user.role,
    operatorId: null,
  };
  const tokens = await tokenService.issueForNewSession(principal, meta);

  auditService.record({
    action: "USER_REGISTERED",
    actorId: user.id,
    ip: meta.ip,
    userAgent: meta.userAgent,
    metadata: { referredById: referredById ?? null },
  });

  // Best-effort — don't fail registration if email sending fails.
  sendVerificationEmail(user.id, user.email, user.fullName).catch((err) =>
    logger.error("Failed to send verification email", { userId: user.id, err }),
  );

  return { user: toUserDTO(user), tokens };
}

async function sendVerificationEmail(userId: string, email: string, fullName: string) {
  const verifyUrl = await createVerificationToken(userId);
  await notificationService.sendEmail(
    email,
    "Verify your urRoute email address",
    verificationEmailHtml(fullName, verifyUrl),
  );
}

function verificationEmailHtml(name: string, verifyUrl: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:500px;margin:auto;padding:24px">
      <h2 style="color:#1B2D78;margin-bottom:4px">Verify your email, ${name.split(" ")[0]}</h2>
      <p style="color:#555;margin-top:0">Thanks for joining urRoute. Click the button below to confirm your email address. The link expires in 24 hours.</p>
      <a href="${verifyUrl}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#1B2D78;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px">
        Verify email address
      </a>
      <p style="color:#888;font-size:13px">If you didn't create an urRoute account, you can safely ignore this email.</p>
    </div>`;
}

/** Retry referral-code generation on the (rare) unique collision. */
async function uniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();
    if (!(await userRepository.findByReferralCode(code))) return code;
  }
  // Fall back to a longer code — collision probability becomes negligible.
  return generateReferralCode(10);
}
