import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        referrals: {
          select: { fullName: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: { select: { referrals: true } },
      },
    });

    if (!user) throw new Error("User not found");

    return ok({
      referralCode: user.referralCode,
      totalReferrals: user._count.referrals,
      referrals: user.referrals.map((r) => ({
        fullName: r.fullName,
        joinedAt: r.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}
