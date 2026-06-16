import crypto from "crypto";
import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { getEnv } from "@/config/env";
import { prisma } from "@/lib/prisma";
import { completeBookingRewardsUseCase } from "@/usecases/rewards/complete-booking.usecase";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";
    const secret = getEnv().RAZORPAY_WEBHOOK_SECRET;

    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    if (expected !== signature) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
    }

    const event = JSON.parse(body) as { event: string; payload: Record<string, unknown> };
    logger.info("Razorpay webhook", { event: event.event });

    if (event.event === "payment.captured") {
      const payment = event.payload as {
        payment: { entity: { order_id: string; id: string } };
      };
      const orderId = payment.payment.entity.order_id;

      const dbPayment = await prisma.payment.findUnique({
        where: { razorpayOrderId: orderId },
        include: { booking: true },
      });

      if (dbPayment && dbPayment.status !== "PAID") {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: dbPayment.id },
            data: { status: "PAID", razorpayPaymentId: payment.payment.entity.id, paidAt: new Date() },
          });
          await tx.booking.update({
            where: { id: dbPayment.bookingId },
            data: { status: "CONFIRMED" },
          });
        }, { timeout: 15000 });
      }
    }

    if (event.event === "payment.failed") {
      const payment = event.payload as { payment: { entity: { order_id: string; error_description: string } } };
      await prisma.payment.updateMany({
        where: { razorpayOrderId: payment.payment.entity.order_id },
        data: { status: "FAILED", failureReason: payment.payment.entity.error_description },
      });
    }

    return ok({ received: true });
  } catch (error) {
    return handleError(error);
  }
}
