import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  try {
    const { userId } = await requireRole("TRAVELER");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalanceMinor: true },
    });
    return ok({ walletBalanceMinor: user?.walletBalanceMinor ?? 0 });
  } catch (error) {
    return handleError(error);
  }
}
