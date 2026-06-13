import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, handleError } from "@/lib/http";
import { AppError, UnauthorizedError } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { setAuthCookies } from "@/lib/auth/cookies";
import { getRedis } from "@/lib/redis";
import { resolveExternalLoginUseCase } from "@/usecases/auth/oauth.usecase";
import { requestMeta, clientIp } from "@/utils/request";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email().toLowerCase(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
  role: z.enum(["TRAVELER", "OPERATOR"]).optional(),
});

function otpKey(email: string) {
  return `otp:email:${email}`;
}

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit("auth", `verify-otp:${clientIp(req)}`);

    const { email, otp, role } = bodySchema.parse(await req.json());

    const redis = getRedis();
    if (!redis) {
      throw new AppError(
        "Email OTP is not configured",
        503,
        "AUTH_PROVIDER_UNAVAILABLE",
      );
    }

    const stored = await redis.get<string>(otpKey(email));
    if (stored === null || stored === undefined) {
      // Missing or expired — distinct from a wrong code so the UI can prompt
      // the user to request a new one.
      throw new AppError("OTP expired or not found", 410, "OTP_EXPIRED");
    }

    if (String(stored) !== otp) {
      throw new UnauthorizedError("Incorrect OTP");
    }

    // Single-use: consume the code so it can't be replayed.
    await redis.del(otpKey(email));

    const { user, tokens } = await resolveExternalLoginUseCase(
      {
        email,
        emailVerified: true,
        role: role ?? "TRAVELER",
      },
      requestMeta(req),
    );

    await setAuthCookies(tokens.accessToken, tokens.refreshToken);
    return ok({ user });
  } catch (error) {
    return handleError(error);
  }
}
