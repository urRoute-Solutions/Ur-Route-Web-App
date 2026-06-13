import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "@/config/env";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const paymentService = {
  async createOrder(amountMinor: number, currency = "INR", receipt: string) {
    const order = await razorpay.orders.create({
      amount: amountMinor,
      currency,
      receipt,
    });
    return order;
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
