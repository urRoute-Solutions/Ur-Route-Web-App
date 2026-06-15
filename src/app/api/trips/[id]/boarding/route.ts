import { z } from "zod";
import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function assertOperatorOfTrip(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { operator: { select: { ownerId: true } } },
  });
  if (!trip) throw new NotFoundError("Trip");
  if (trip.operator.ownerId !== userId) throw new ForbiddenError();
  return trip;
}

// GET /api/trips/[id]/boarding — returns all boarding entries for a trip
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId, role } = await requireAuth();
    const { id: tripId } = await params;
    if (role !== "ADMIN") await assertOperatorOfTrip(tripId, userId);

    const entries = await prisma.boardingEntry.findMany({
      where: { tripId },
      orderBy: { boardedAt: "asc" },
    });

    return ok({ entries, totalBoarded: entries.length });
  } catch (error) {
    return handleError(error);
  }
}

const toggleSchema = z.object({
  pnr: z.string(),
  seatLabel: z.string(),
  boarded: z.boolean(),
});

// POST /api/trips/[id]/boarding — mark/unmark a passenger as boarded
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await requireAuth();
    const { id: tripId } = await params;
    await assertOperatorOfTrip(tripId, userId);

    const { pnr, seatLabel, boarded } = toggleSchema.parse(await req.json());

    if (boarded) {
      await prisma.boardingEntry.upsert({
        where: { tripId_seatLabel: { tripId, seatLabel } },
        create: { tripId, pnr, seatLabel },
        update: { boardedAt: new Date() },
      });
    } else {
      await prisma.boardingEntry.deleteMany({ where: { tripId, seatLabel } });
    }

    const totalBoarded = await prisma.boardingEntry.count({ where: { tripId } });
    return ok({ boarded, seatLabel, totalBoarded });
  } catch (error) {
    return handleError(error);
  }
}
