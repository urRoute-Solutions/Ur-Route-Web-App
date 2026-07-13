import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { setAuthCookies } from "@/lib/auth/cookies";
import { registerOperatorSchema } from "@/validators/auth";
import { registerOperatorUseCase } from "@/usecases/auth/register-operator.usecase";
import { requestMeta, clientIp } from "@/utils/request";

// bcrypt + Prisma require the Node runtime (not edge).
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit("auth", `register-operator:${clientIp(req)}`);
    const input = registerOperatorSchema.parse(await req.json());
    const { user, operator, tokens } = await registerOperatorUseCase(input, requestMeta(req));
    await setAuthCookies(tokens.accessToken, tokens.refreshToken);
    return ok({ user, operator }, 201);
  } catch (error) {
    return handleError(error);
  }
}
