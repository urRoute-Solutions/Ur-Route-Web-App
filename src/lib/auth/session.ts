import { cookies } from "next/headers";
import type { Role } from "@prisma/client";
import { ACCESS_COOKIE } from "@/constants/auth";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { verifyAccessToken } from "@/lib/auth/tokens";
import type { AuthPrincipal } from "@/types/auth";

/**
 * Server-side auth context for Route Handlers, Server Actions, and RSC.
 *
 * `getPrincipal` is non-throwing (returns null) for optional-auth surfaces.
 * `requireAuth` / `requireRole` / `requireOperator` are the guards used by
 * protected endpoints — they centralize the 401/403 decisions so handlers stay
 * declarative: `const { operatorId } = await requireOperator();`
 */
export async function getPrincipal(): Promise<AuthPrincipal | null> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  try {
    const claims = await verifyAccessToken(token);
    return {
      userId: claims.userId,
      role: claims.role,
      operatorId: claims.operatorId ?? null,
    };
  } catch {
    return null; // expired/invalid → treated as anonymous; client should refresh
  }
}

export async function requireAuth(): Promise<AuthPrincipal> {
  const principal = await getPrincipal();
  if (!principal) throw new UnauthorizedError();
  return principal;
}

export async function requireRole(...roles: Role[]): Promise<AuthPrincipal> {
  const principal = await requireAuth();
  if (!roles.includes(principal.role)) {
    throw new ForbiddenError();
  }
  return principal;
}

/**
 * Require an OPERATOR principal and return a guaranteed `operatorId`. This is
 * the single choke point that turns "an operator is logged in" into "this is
 * the tenant whose data they may touch" — pass the result to TenantRepository.
 */
export async function requireOperator(): Promise<
  AuthPrincipal & { operatorId: string }
> {
  const principal = await requireRole("OPERATOR");
  if (!principal.operatorId) {
    throw new ForbiddenError("No operator profile is linked to this account");
  }
  return principal as AuthPrincipal & { operatorId: string };
}

export async function requireAdmin(): Promise<AuthPrincipal> {
  return requireRole("ADMIN");
}
