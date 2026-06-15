import { z } from "zod";
import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(10),
  platform: z.enum(["web", "android", "ios"]).default("web"),
});

// POST — register or refresh an FCM token
export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const { token, platform } = schema.parse(await req.json());

    await prisma.fcmToken.upsert({
      where: { token },
      create: { userId, token, platform },
      update: { userId, platform, updatedAt: new Date() },
    });

    return ok({ registered: true });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE — unregister an FCM token (on logout / permission revoked)
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = req.nextUrl;
    const token = searchParams.get("token");

    if (!token) {
      // Remove all tokens for this user (e.g. on full logout)
      await prisma.fcmToken.deleteMany({ where: { userId } });
    } else {
      await prisma.fcmToken.deleteMany({ where: { token, userId } });
    }

    return ok({ removed: true });
  } catch (error) {
    return handleError(error);
  }
}
