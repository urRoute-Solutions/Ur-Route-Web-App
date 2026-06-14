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
  Promise.all([
    sendVerificationEmail(user.id, user.email, user.fullName),
    sendWelcomeEmail(user.email, user.fullName, user.referralCode),
  ]).catch((err) =>
    logger.error("Failed to send registration emails", { userId: user.id, err }),
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

async function sendWelcomeEmail(email: string, fullName: string, referralCode: string) {
  await notificationService.sendEmail(
    email,
    "Welcome to urRoute 🎉",
    welcomeEmailHtml(fullName, referralCode),
  );
}

function verificationEmailHtml(name: string, verifyUrl: string): string {
  const first = name.split(" ")[0];
  return `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:0">
      <div style="background:#1B2D78;padding:28px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px">urRoute</h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px">Affordable bus travel, reimagined</p>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
        <h2 style="color:#111;margin:0 0 8px;font-size:20px">Verify your email, ${first} 👋</h2>
        <p style="color:#555;margin:0 0 24px;font-size:15px;line-height:1.6">
          Thanks for joining urRoute! One quick step — click the button below to confirm your email address. The link expires in 24 hours.
        </p>
        <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background:#1B2D78;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">
          Verify email address →
        </a>
        <p style="color:#aaa;font-size:12px;margin:24px 0 0">
          If you didn't create an urRoute account, you can safely ignore this email.
        </p>
      </div>
    </div>`;
}

function welcomeEmailHtml(name: string, referralCode: string): string {
  const first = name.split(" ")[0];
  return `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:0">
      <div style="background:#1B2D78;padding:28px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px">urRoute</h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px">Affordable bus travel, reimagined</p>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
        <h2 style="color:#111;margin:0 0 8px;font-size:20px">Welcome aboard, ${first}! 🎉</h2>
        <p style="color:#555;margin:0 0 20px;font-size:15px;line-height:1.6">
          Your urRoute account is ready. Book affordable bus tickets, earn loyalty rewards, and enjoy group discounts — all in one place.
        </p>

        <div style="background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:24px">
          <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px;font-weight:600">Your referral code</p>
          <p style="color:#1B2D78;font-size:24px;font-weight:800;margin:0;letter-spacing:2px">${referralCode}</p>
          <p style="color:#666;font-size:13px;margin:6px 0 0">Share this with friends — both of you earn bonus points when they sign up.</p>
        </div>

        <div style="margin-bottom:24px">
          <p style="color:#111;font-weight:700;margin:0 0 12px;font-size:14px">Get started in 3 steps:</p>
          <div style="display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;align-items:flex-start;gap:10px">
              <span style="background:#e0e7ff;color:#1B2D78;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">1</span>
              <p style="color:#555;font-size:14px;margin:0;padding-top:3px">Verify your email (check the other email we just sent you)</p>
            </div>
            <div style="display:flex;align-items:flex-start;gap:10px">
              <span style="background:#e0e7ff;color:#1B2D78;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">2</span>
              <p style="color:#555;font-size:14px;margin:0;padding-top:3px">Search for a bus route and book your first ticket</p>
            </div>
            <div style="display:flex;align-items:flex-start;gap:10px">
              <span style="background:#e0e7ff;color:#1B2D78;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">3</span>
              <p style="color:#555;font-size:14px;margin:0;padding-top:3px">Earn loyalty points and unlock rewards with every journey</p>
            </div>
          </div>
        </div>

        <a href="https://urroute.app/dashboard" style="display:inline-block;padding:14px 32px;background:#1B2D78;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">
          Go to dashboard →
        </a>
        <p style="color:#aaa;font-size:12px;margin:24px 0 0">
          urRoute · Affordable bus travel across India · <a href="https://urroute.app" style="color:#aaa">urroute.app</a>
        </p>
      </div>
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
