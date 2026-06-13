import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { cancelBookingUseCase } from "@/usecases/bookings/cancel-booking.usecase";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const principal = await requireAuth();
    const { id } = await params;
    const booking = await cancelBookingUseCase(id, principal);
    return ok({ booking });
  } catch (error) {
    return handleError(error);
  }
}
