import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/validators/auth";
import { forgotPasswordUseCase } from "@/usecases/auth/forgot-password.usecase";
import { clientIp } from "@/utils/request";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit("auth", `forgot:${clientIp(req)}`);
    const input = forgotPasswordSchema.parse(await req.json());
    await forgotPasswordUseCase(input);
    // Generic response — never reveal whether the email exists.
    return ok({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (error) {
    return handleError(error);
  }
}
