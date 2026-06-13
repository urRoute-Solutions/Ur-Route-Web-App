import { z } from "zod";
import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireRole } from "@/lib/auth/session";
import { verifyPaymentUseCase } from "@/usecases/payments/verify-payment.usecase";

export const runtime = "nodejs";

const schema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    await requireRole("TRAVELER");
    const input = schema.parse(await req.json());
    const result = await verifyPaymentUseCase(input);
    return ok({ result });
  } catch (error) {
    return handleError(error);
  }
}
