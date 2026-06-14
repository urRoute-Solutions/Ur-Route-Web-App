import { type NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { NotFoundError } from "@/lib/errors";
import { tripRepository } from "@/repositories/trip.repository";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const trip = await tripRepository.findByIdWithDetails(id);
    if (!trip) throw new NotFoundError("Trip");
    return ok({ trip });
  } catch (error) {
    return handleError(error);
  }
}
