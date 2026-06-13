import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { setAuthCookies } from "@/lib/auth/cookies";
import { loginSchema } from "@/validators/auth";
import { loginUseCase } from "@/usecases/auth/login.usecase";
import { requestMeta, clientIp } from "@/utils/request";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit("auth", `login:${clientIp(req)}`);
    const input = loginSchema.parse(await req.json());
    const { user, tokens } = await loginUseCase(input, requestMeta(req));
    await setAuthCookies(tokens.accessToken, tokens.refreshToken);
    return ok({ user });
  } catch (error) {
    return handleError(error);
  }
}
