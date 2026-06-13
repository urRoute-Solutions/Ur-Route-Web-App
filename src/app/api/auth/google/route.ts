import type { NextRequest } from "next/server";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import { ok, handleError } from "@/lib/http";
import { AppError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { setAuthCookies } from "@/lib/auth/cookies";
import { resolveExternalLoginUseCase } from "@/usecases/auth/oauth.usecase";
import { requestMeta, clientIp } from "@/utils/request";
import { getEnv } from "@/config/env";

// google-auth-library + Prisma require the Node runtime (not edge).
export const runtime = "nodejs";

const bodySchema = z.object({ credential: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit("auth", `google:${clientIp(req)}`);

    const env = getEnv();
    if (!env.GOOGLE_CLIENT_ID) {
      throw new AppError(
        "Google sign-in is not configured",
        503,
        "AUTH_PROVIDER_UNAVAILABLE",
      );
    }

    const { credential } = bodySchema.parse(await req.json());

    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedError("Invalid Google token");
    }

    if (!payload?.email) {
      throw new ValidationError(undefined, "No email present in Google token");
    }

    const { user, tokens } = await resolveExternalLoginUseCase(
      {
        email: payload.email.toLowerCase(),
        fullName: payload.name ?? null,
        emailVerified: payload.email_verified ?? true,
        role: "TRAVELER",
      },
      requestMeta(req),
    );

    await setAuthCookies(tokens.accessToken, tokens.refreshToken);
    return ok({ user });
  } catch (error) {
    return handleError(error);
  }
}
