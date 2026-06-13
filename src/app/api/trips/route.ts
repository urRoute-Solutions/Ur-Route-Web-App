import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { searchTripsSchema } from "@/validators/trip";
import { searchTripsUseCase } from "@/usecases/trips/search-trips.usecase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const input = searchTripsSchema.parse({
      origin: searchParams.get("origin"),
      destination: searchParams.get("destination"),
      date: searchParams.get("date"),
      passengers: searchParams.get("passengers"),
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
    });
    const result = await searchTripsUseCase(input);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
