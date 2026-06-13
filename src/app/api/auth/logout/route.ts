import { ok, handleError } from "@/lib/http";
import { readRefreshCookie, clearAuthCookies } from "@/lib/auth/cookies";
import { logoutUseCase } from "@/usecases/auth/logout.usecase";

export const runtime = "nodejs";

export async function POST() {
  try {
    const current = await readRefreshCookie();
    await logoutUseCase(current);
    await clearAuthCookies();
    return ok({ loggedOut: true });
  } catch (error) {
    return handleError(error);
  }
}
