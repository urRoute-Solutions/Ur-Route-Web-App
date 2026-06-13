import { ok, handleError } from "@/lib/http";
import { getPrincipal } from "@/lib/auth/session";
import { getProfileUseCase } from "@/usecases/profile/get-profile.usecase";

export const runtime = "nodejs";

/**
 * Lightweight "who am I" endpoint for the client to hydrate auth state.
 * Returns `{ user: null }` (200) when anonymous so the frontend can branch
 * without treating it as an error.
 */
export async function GET() {
  try {
    const principal = await getPrincipal();
    if (!principal) return ok({ user: null });
    return ok({ user: await getProfileUseCase(principal.userId) });
  } catch (error) {
    return handleError(error);
  }
}
