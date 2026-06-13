import { z } from "zod";
import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireRole } from "@/lib/auth/session";
import { createPaymentOrderUseCase } from "@/usecases/payments/create-order.usecase";

export const runtime = "nodejs";

const schema = z.object({ bookingId: z.string().cuid() });

export async function POST(req: NextRequest) {
  try {
    const principal = await requireRole("TRAVELER");
    const { bookingId } = schema.parse(await req.json());
    const order = await createPaymentOrderUseCase(bookingId, principal);
    return ok({ order }, 201);
  } catch (error) {
    return handleError(error);
  }
}
