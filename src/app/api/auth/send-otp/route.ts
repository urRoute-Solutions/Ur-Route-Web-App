import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, handleError } from "@/lib/http";
import { AppError, RateLimitError } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRedis } from "@/lib/redis";
import { notificationService } from "@/services/notification.service";
import { clientIp } from "@/utils/request";

export const runtime = "nodejs";

const bodySchema = z.object({ email: z.string().email().toLowerCase() });

const OTP_TTL_SECONDS = 10 * 60; // OTP valid for 10 minutes
const RESEND_COOLDOWN_SECONDS = 60; // throttle re-sends per email

function otpKey(email: string) {
  return `otp:email:${email}`;
}
function cooldownKey(email: string) {
  return `otp:cooldown:${email}`;
}

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit("auth", `send-otp:${clientIp(req)}`);

    const { email } = bodySchema.parse(await req.json());

    const redis = getRedis();
    if (!redis) {
      throw new AppError(
        "Email OTP is not configured",
        503,
        "AUTH_PROVIDER_UNAVAILABLE",
      );
    }

    // Per-email resend throttle. NX = only set if absent; if it already exists
    // a code was sent within the cooldown window, so reject.
    const allowed = await redis.set(cooldownKey(email), "1", {
      nx: true,
      ex: RESEND_COOLDOWN_SECONDS,
    });
    if (allowed !== "OK") {
      throw new RateLimitError(
        "An OTP was just sent. Please wait a minute before requesting another.",
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(otpKey(email), otp, { ex: OTP_TTL_SECONDS });

    await notificationService.sendEmail(
      email,
      "Your urRoute OTP",
      otpEmailHtml(otp),
    );

    return ok({ message: "OTP sent" });
  } catch (error) {
    return handleError(error);
  }
}

function otpEmailHtml(otp: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto">
      <h2 style="margin-bottom:4px">Your urRoute verification code</h2>
      <p style="color:#555;margin-top:0">Use this code to sign in. It expires in 10 minutes.</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:8px;margin:24px 0">${otp}</p>
      <p style="color:#888;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
    </div>`;
}
