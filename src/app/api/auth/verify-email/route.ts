import { type NextRequest, NextResponse } from "next/server";
import { consumeVerificationToken } from "@/lib/auth/email-verification";
import { userRepository } from "@/repositories/user.repository";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/verify-email?error=missing", req.url));
  }

  const userId = await consumeVerificationToken(token);
  if (!userId) {
    return NextResponse.redirect(new URL("/verify-email?error=expired", req.url));
  }

  await userRepository.setEmailVerified(userId);
  return NextResponse.redirect(new URL("/verify-email?success=1", req.url));
}
