import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { updateTripSchema } from "@/validators/trip";
import { updateTripUseCase } from "@/usecases/trips/update-trip.usecase";
import { tripRepository } from "@/repositories/trip.repository";
import { toTripDTO } from "@/dto/trip.dto";
import { NotFoundError } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> },
) {
  try {
    const { tripId } = await params;
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError("Trip");
    return ok({ trip: toTripDTO(trip) });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; tripId: string }> },
) {
  try {
    const principal = await requireAuth();
    const { id, tripId } = await params;
    const input = updateTripSchema.parse(await req.json());
    const trip = await updateTripUseCase(id, tripId, input, principal);
    return ok({ trip });
  } catch (error) {
    return handleError(error);
  }
}
