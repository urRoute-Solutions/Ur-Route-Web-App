import type { Role, User } from "@prisma/client";
import { userRepository } from "@/repositories/user.repository";
import { tokenService, type IssuedTokens } from "@/services/token.service";
import { auditService } from "@/services/audit.service";
import { toUserDTO, type UserDTO } from "@/dto/user.dto";
import { generateReferralCode, generateUrid } from "@/utils/ids";
import type { AuthPrincipal } from "@/types/auth";

interface RequestMeta {
  userAgent?: string | null;
  ip?: string | null;
}

/** Identity resolved from an external provider (Google, email OTP, phone). */
interface ExternalIdentity {
  /** Lookup key. Always present; for phone-only logins we synthesise one. */
  email: string;
  phone?: string | null;
  fullName?: string | null;
  /** Mark the email as verified (Google/email-OTP) vs. unverified (phone). */
  emailVerified?: boolean;
  /** Role to assign on first creation. Existing users keep their role. */
  role?: Role;
}

/**
 * Find-or-create a user authenticated by an external/passwordless provider,
 * then mint a session — mirroring login/register so cookies, token rotation
 * and audit logging stay identical across every auth method.
 *
 * Passwordless users carry an empty `passwordHash`; the password login path
 * still rejects them because `verifyPassword("", ...)` can never match a real
 * bcrypt hash, and bcrypt verification of an empty stored hash returns false.
 */
export async function resolveExternalLoginUseCase(
  identity: ExternalIdentity,
  meta: RequestMeta,
): Promise<{ user: UserDTO; tokens: IssuedTokens }> {
  // Match an existing account by phone first (phone logins), then by email.
  // findByIdentifier checks both email and phone and skips soft-deleted rows.
  let user: User | null = identity.phone
    ? await userRepository.findByIdentifier(identity.phone)
    : null;
  if (!user) user = await userRepository.findByEmail(identity.email);
  let created = false;

  if (!user) {
    const role = identity.role ?? "TRAVELER";
    user = await userRepository.create({
      fullName: identity.fullName?.trim() || identity.email.split("@")[0]!,
      email: identity.email,
      phone: identity.phone ?? undefined,
      passwordHash: "", // passwordless account — cannot log in with a password
      referralCode: await uniqueReferralCode(),
      urid: role === "TRAVELER" ? await uniqueUrid() : undefined,
      emailVerified: identity.emailVerified ?? false,
      role,
    });
    created = true;
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
  const tokens = await tokenService.issueForNewSession(principal, meta);
  await userRepository.touchLastLogin(user.id);

  auditService.record({
    action: created ? "USER_REGISTERED" : "USER_LOGIN",
    actorId: user.id,
    operatorId,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return { user: toUserDTO(user), tokens };
}

/** Retry referral-code generation on the (rare) unique collision. */
async function uniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();
    if (!(await userRepository.findByReferralCode(code))) return code;
  }
  return generateReferralCode(10);
}

/** Retry URID generation on the (rare) unique collision. */
async function uniqueUrid(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const urid = generateUrid("USR");
    if (!(await userRepository.findByUrid(urid))) return urid;
  }
  return generateUrid("USR", 9);
}
