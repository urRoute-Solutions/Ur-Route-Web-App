import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "@/config/env";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const RAZORPAY_CONFIGURED =
  env.RAZORPAY_KEY_ID !== "rzp_test_placeholder" &&
  env.RAZORPAY_KEY_SECRET !== "placeholder";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const paymentService = {
  async createOrder(amountMinor: number, currency = "INR", receipt: string) {
    if (!RAZORPAY_CONFIGURED) {
      throw new AppError(
        "Online payments aren't set up yet. Please contact support to complete this booking.",
        503,
        "PAYMENT_GATEWAY_NOT_CONFIGURED",
      );
    }
    try {
      return await razorpay.orders.create({ amount: amountMinor, currency, receipt });
    } catch (err) {
      logger.error("Razorpay order creation failed", { err });
      throw new AppError("Could not start payment. Please try again in a moment.", 502, "PAYMENT_GATEWAY_ERROR");
    }
  },

  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const body = `${orderId}|${paymentId}`;
    const expected = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
    return expected === signature;
  },
};
