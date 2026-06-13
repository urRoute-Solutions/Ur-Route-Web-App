"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function PayButton({ bookingId, amountMinor }: { bookingId: string; amountMinor: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    const loaded = await loadRazorpayScript();
    if (!loaded) { toast.error("Failed to load payment gateway"); setLoading(false); return; }

    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
    const json = await res.json();
    if (!res.ok) { toast.error(json.error?.message ?? "Could not create order"); setLoading(false); return; }

    const { orderId } = json.data.order;

    const rzp = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amountMinor,
      currency: "INR",
      order_id: orderId,
      name: "urRoute",
      description: "Bus ticket payment",
      theme: { color: "#2563EB" },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        });
        if (verifyRes.ok) {
          toast.success("Payment successful! Booking confirmed.");
          router.refresh();
        } else {
          toast.error("Payment verification failed. Contact support.");
        }
      },
    });
    rzp.open();
    setLoading(false);
  }

  return (
    <Button onClick={handlePay} disabled={loading} className="gap-2 bg-action hover:bg-action/90 text-action-foreground">
      <CreditCard className="h-4 w-4" />
      {loading ? "Loading…" : `Pay ₹${(amountMinor / 100).toFixed(0)}`}
    </Button>
  );
}
