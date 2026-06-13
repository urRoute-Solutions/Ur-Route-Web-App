import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, handleError } from "@/lib/http";
import { AppError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { setAuthCookies } from "@/lib/auth/cookies";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { resolveExternalLoginUseCase } from "@/usecases/auth/oauth.usecase";
import { requestMeta, clientIp } from "@/utils/request";

// firebase-admin + Prisma require the Node runtime (not edge).
export const runtime = "nodejs";

const bodySchema = z.object({
  firebaseToken: z.string().min(1),
  fullName: z.string().min(2).max(120).optional(),
  role: z.enum(["TRAVELER", "OPERATOR"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit("auth", `phone:${clientIp(req)}`);

    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) {
      throw new AppError(
        "Phone sign-in is not configured",
        503,
        "AUTH_PROVIDER_UNAVAILABLE",
      );
    }

    const { firebaseToken, fullName, role } = bodySchema.parse(await req.json());

    let phoneNumber: string | undefined;
    try {
      const decoded = await firebaseAdmin.verifyIdToken(firebaseToken);
      phoneNumber = decoded.phone_number;
    } catch {
      throw new UnauthorizedError("Invalid phone verification token");
    }

    if (!phoneNumber) {
      throw new ValidationError(undefined, "No phone number in token");
    }

    // The User schema requires a unique email. Phone-only accounts get a
    // deterministic synthetic email so repeat logins resolve to the same user.
    const syntheticEmail = `phone_${phoneNumber.replace("+", "")}@urroute.phone`;

    const { user, tokens } = await resolveExternalLoginUseCase(
      {
        email: syntheticEmail,
        phone: phoneNumber,
        fullName: fullName ?? null,
        emailVerified: false,
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
