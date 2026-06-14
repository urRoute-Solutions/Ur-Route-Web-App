import { ok, handleError } from "@/lib/http";
import { tripRepository } from "@/repositories/trip.repository";

export const runtime = "nodejs";
export const revalidate = 300; // cache for 5 minutes

export async function GET() {
  try {
    const places = await tripRepository.getPlaces();
    return ok(places);
  } catch (error) {
    return handleError(error);
  }
}
