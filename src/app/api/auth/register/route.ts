import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { setAuthCookies } from "@/lib/auth/cookies";
import { registerSchema } from "@/validators/auth";
import { registerUseCase } from "@/usecases/auth/register.usecase";
import { requestMeta, clientIp } from "@/utils/request";

// bcrypt + Prisma require the Node runtime (not edge).
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit("auth", `register:${clientIp(req)}`);
    const input = registerSchema.parse(await req.json());
    const { user, tokens } = await registerUseCase(input, requestMeta(req));
    await setAuthCookies(tokens.accessToken, tokens.refreshToken);
    return ok({ user }, 201);
  } catch (error) {
    return handleError(error);
  }
}
