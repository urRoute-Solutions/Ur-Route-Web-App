import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { createBookingSchema } from "@/validators/booking";
import { createBookingUseCase } from "@/usecases/bookings/create-booking.usecase";
import { listBookingsUseCase } from "@/usecases/bookings/list-bookings.usecase";
import type { Booking } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const principal = await requireAuth();
    const input = createBookingSchema.parse(await req.json());
    const booking = await createBookingUseCase(input, principal);
    return ok({ booking }, 201);
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const principal = await requireAuth();
    const { searchParams } = req.nextUrl;
    const result = await listBookingsUseCase(principal, {
      status: (searchParams.get("status") as Booking["status"] | null) ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
    });
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
