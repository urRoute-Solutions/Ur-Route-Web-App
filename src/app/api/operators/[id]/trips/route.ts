import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { createTripSchema } from "@/validators/trip";
import { createTripUseCase } from "@/usecases/trips/create-trip.usecase";
import { tripRepository } from "@/repositories/trip.repository";
import { toTripDTO } from "@/dto/trip.dto";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const principal = await requireAuth();
    const { id } = await params;
    const input = createTripSchema.parse(await req.json());
    const trip = await createTripUseCase(id, input, principal);
    return ok({ trip }, 201);
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = req.nextUrl;
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 20);
    const routeId = searchParams.get("routeId") ?? undefined;
    const [trips, total] = await tripRepository.listByOperator(id, { page, pageSize, routeId });
    return ok({ items: trips.map(toTripDTO), total, page, pageSize });
  } catch (error) {
    return handleError(error);
  }
}
