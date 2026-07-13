import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAgent } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAgent();
    const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
    if (q.length < 2) return ok({ users: [] });

    const isUrid = q.toUpperCase().startsWith("USR-");
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        role: "TRAVELER",
        ...(isUrid
          ? { urid: { startsWith: q.toUpperCase() } }
          : {
              OR: [
                { fullName: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { phone: { contains: q } },
              ],
            }),
      },
      select: { id: true, fullName: true, email: true, phone: true, urid: true },
      take: 8,
      orderBy: { fullName: "asc" },
    });

    return ok({ users });
  } catch (err) {
    return handleError(err);
  }
}
