import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { getBookingUseCase } from "@/usecases/bookings/get-booking.usecase";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const principal = await requireAuth();
    const { id } = await params;
    const booking = await getBookingUseCase(id, principal);
    return ok({ booking });
  } catch (error) {
    return handleError(error);
  }
}
