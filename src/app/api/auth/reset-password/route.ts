import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/validators/auth";
import { resetPasswordUseCase } from "@/usecases/auth/reset-password.usecase";
import { clientIp } from "@/utils/request";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit("auth", `reset:${clientIp(req)}`);
    const input = resetPasswordSchema.parse(await req.json());
    await resetPasswordUseCase(input);
    return ok({ message: "Password updated. Please log in." });
  } catch (error) {
    return handleError(error);
  }
}
