import { z } from "zod";
import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await requireRole("TRAVELER");

    const favorites = await prisma.favoriteRoute.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return ok({ favorites });
  } catch (error) {
    return handleError(error);
  }
}

const schema = z.object({
  origin: z.string().min(1).max(100),
  destination: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireRole("TRAVELER");
    const { origin, destination } = schema.parse(await req.json());

    if (origin.toLowerCase() === destination.toLowerCase()) {
      throw new AppError("Origin and destination must differ", 400, "SAME_ROUTE");
    }

    const existing = await prisma.favoriteRoute.count({ where: { userId } });
    if (existing >= 20) {
      throw new AppError("Maximum 20 favourite routes allowed", 400, "LIMIT_EXCEEDED");
    }

    const favorite = await prisma.favoriteRoute.upsert({
      where: { userId_origin_destination: { userId, origin, destination } },
      create: { userId, origin, destination },
      update: {},
    });

    return ok({ favorite }, 201);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await requireRole("TRAVELER");
    const { searchParams } = req.nextUrl;
    const origin = searchParams.get("origin") ?? "";
    const destination = searchParams.get("destination") ?? "";

    await prisma.favoriteRoute.deleteMany({
      where: { userId, origin, destination },
    });

    return ok({ removed: true });
  } catch (error) {
    return handleError(error);
  }
}
