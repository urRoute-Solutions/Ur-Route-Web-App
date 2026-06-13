import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { UnauthorizedError } from "@/lib/errors";
import { readRefreshCookie, setAuthCookies, clearAuthCookies } from "@/lib/auth/cookies";
import { refreshUseCase } from "@/usecases/auth/refresh.usecase";
import { requestMeta } from "@/utils/request";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const current = await readRefreshCookie();
    if (!current) throw new UnauthorizedError("No session");
    const tokens = await refreshUseCase(current, requestMeta(req));
    await setAuthCookies(tokens.accessToken, tokens.refreshToken);
    return ok({ refreshed: true });
  } catch (error) {
    // On any refresh failure, clear cookies so the client stops retrying.
    await clearAuthCookies();
    return handleError(error);
  }
}
