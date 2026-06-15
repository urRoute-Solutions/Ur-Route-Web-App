import { z } from "zod";
import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireRole } from "@/lib/auth/session";
import { AppError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Join or update waitlist entry
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await requireRole("TRAVELER");
    const { id: tripId } = await params;
    const { seats } = z.object({ seats: z.number().int().min(1).max(10).default(1) }).parse(await req.json());

    const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { id: true, availableSeats: true } });
    if (!trip) throw new NotFoundError("Trip");
    if (trip.availableSeats > 0) {
      throw new AppError("Seats are available — book directly instead", 400, "SEATS_AVAILABLE");
    }

    const entry = await prisma.waitlist.upsert({
      where: { userId_tripId: { userId, tripId } },
      create: { userId, tripId, seats },
      update: { seats },
    });

    return ok({ entry }, 201);
  } catch (error) {
    return handleError(error);
  }
}

// Remove from waitlist
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await requireRole("TRAVELER");
    const { id: tripId } = await params;

    await prisma.waitlist.deleteMany({ where: { userId, tripId } });
    return ok({ removed: true });
  } catch (error) {
    return handleError(error);
  }
}

// Check waitlist status for current user
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await requireRole("TRAVELER");
    const { id: tripId } = await params;

    const entry = await prisma.waitlist.findUnique({
      where: { userId_tripId: { userId, tripId } },
    });
    const total = await prisma.waitlist.count({ where: { tripId } });

    return ok({ entry, totalWaiting: total });
  } catch (error) {
    return handleError(error);
  }
}
