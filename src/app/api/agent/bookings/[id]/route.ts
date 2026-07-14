import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAgent } from "@/lib/auth/session";
import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAgent();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { trip: { include: { route: true } } },
    });
    if (!booking) throw new NotFoundError("Booking");

    return ok({ booking });
  } catch (error) {
    return handleError(error);
  }
}
