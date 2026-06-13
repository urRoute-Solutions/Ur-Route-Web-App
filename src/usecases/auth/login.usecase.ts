import { UnauthorizedError } from "@/lib/errors";
import { verifyPassword } from "@/lib/auth/password";
import { userRepository } from "@/repositories/user.repository";
import { tokenService, type IssuedTokens } from "@/services/token.service";
import { auditService } from "@/services/audit.service";
import { toUserDTO, type UserDTO } from "@/dto/user.dto";
import type { LoginInput } from "@/validators/auth";
import type { AuthPrincipal } from "@/types/auth";

interface RequestMeta {
  userAgent?: string | null;
  ip?: string | null;
}

/**
 * Authenticate by email/phone identifier + password.
 *
 * Security: identical error for "no such user" and "wrong password" so the
 * endpoint can't be used to enumerate accounts. Password verification still
 * runs even when the user is missing would be ideal to equalize timing — we
 * accept the minor asymmetry here and rely on rate limiting (P4) as the guard.
 */
export async function loginUseCase(
  input: LoginInput,
  meta: RequestMeta,
): Promise<{ user: UserDTO; tokens: IssuedTokens }> {
  const user = await userRepository.findByIdentifier(input.identifier);

  const invalid = new UnauthorizedError("Invalid credentials");
  if (!user || !user.isActive) throw invalid;

  const passwordOk = await verifyPassword(input.password, user.passwordHash);
  if (!passwordOk) throw invalid;

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
    action: "USER_LOGIN",
    actorId: user.id,
    operatorId,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return { user: toUserDTO(user), tokens };
}
