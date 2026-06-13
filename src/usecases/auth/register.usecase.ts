import { ConflictError } from "@/lib/errors";
import { hashPassword } from "@/lib/auth/password";
import { userRepository } from "@/repositories/user.repository";
import { tokenService, type IssuedTokens } from "@/services/token.service";
import { auditService } from "@/services/audit.service";
import { toUserDTO, type UserDTO } from "@/dto/user.dto";
import { generateReferralCode } from "@/utils/ids";
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

  return { user: toUserDTO(user), tokens };
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
