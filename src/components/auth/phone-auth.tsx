"use client";

import { useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { getFirebaseClientAuth } from "@/lib/firebase-client";
import { OtpInput } from "./otp-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

/**
 * Firebase phone (SMS) auth. Sends an OTP via Firebase, confirms it client-side
 * to obtain an ID token, then exchanges that token at /api/auth/phone for our
 * own session cookies.
 */
export function PhoneAuth({
  redirectTo = "/dashboard",
}: {
  redirectTo?: string;
}) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function sendOtp() {
    if (!phone.match(/^\+91\d{10}$/)) {
      toast.error("Enter a valid Indian number: +91XXXXXXXXXX");
      return;
    }
    const auth = getFirebaseClientAuth();
    if (!auth) {
      toast.error("Phone login is not configured yet.");
      return;
    }
    setLoading(true);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          { size: "invisible" },
        );
      }
      const result = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier,
      );
      setConfirmation(result);
      setStep("otp");
      toast.success("OTP sent to " + phone);
    } catch (err) {
      toast.error("Failed to send OTP. Check the phone number.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!confirmation || otp.length !== 6) return;
    setLoading(true);
    try {
      const result = await confirmation.confirm(otp);
      const firebaseToken = await result.user.getIdToken();
      const res = await fetch("/api/auth/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseToken }),
      });
      if (res.ok) {
        toast.success("Signed in successfully!");
        router.push(redirectTo);
      } else {
        toast.error("Verification failed. Try again.");
      }
    } catch {
      toast.error("Wrong OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div id="recaptcha-container" />
      {step === "phone" ? (
        <div className="space-y-3">
          <Input
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-11"
          />
          <Button
            variant="action"
            className="w-full h-11 font-semibold"
            onClick={sendOtp}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            Enter the 6-digit code sent to {phone}
          </p>
          <OtpInput value={otp} onChange={setOtp} />
          <Button
            variant="action"
            className="w-full h-11 font-semibold"
            onClick={verifyOtp}
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
          <button
            onClick={() => setStep("phone")}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Change number
          </button>
        </div>
      )}
    </div>
  );
}
