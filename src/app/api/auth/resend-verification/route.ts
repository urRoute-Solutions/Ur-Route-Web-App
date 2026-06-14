import { type NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/auth/session";
import { userRepository } from "@/repositories/user.repository";
import { createVerificationToken } from "@/lib/auth/email-verification";
import { notificationService } from "@/services/notification.service";
import { clientIp } from "@/utils/request";
import { AppError } from "@/lib/errors";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit("auth", `resend-verify:${clientIp(req)}`);

    const { userId } = await requireAuth();
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
    if (user.emailVerified) return ok({ message: "Email already verified" });

    const verifyUrl = await createVerificationToken(userId);
    const firstName = user.fullName.split(" ")[0] ?? user.fullName;
    await notificationService.sendEmail(
      user.email,
      "Verify your urRoute email address",
      resendEmailHtml(firstName, verifyUrl),
    );

    return ok({ message: "Verification email sent" });
  } catch (err) {
    return handleError(err);
  }
}

function resendEmailHtml(firstName: string, verifyUrl: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:500px;margin:auto;padding:24px">
      <h2 style="color:#1B2D78;margin-bottom:4px">Verify your email, ${firstName}</h2>
      <p style="color:#555;margin-top:0">Click the button below to verify your urRoute email address. The link expires in 24 hours.</p>
      <a href="${verifyUrl}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#1B2D78;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px">
        Verify email address
      </a>
      <p style="color:#888;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
    </div>`;
}
