"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loginSchema, type LoginInput } from "@/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { GoogleButton } from "@/components/auth/google-button";
import { OtpInput } from "@/components/auth/otp-input";
import { PhoneAuth } from "@/components/auth/phone-auth";

type Tab = "password" | "email-otp" | "phone";

const TABS: { id: Tab; label: string }[] = [
  { id: "password", label: "Password" },
  { id: "email-otp", label: "Email OTP" },
  { id: "phone", label: "Phone" },
];

function routeForRole(role: string): string {
  if (role === "ADMIN") return "/admin";
  if (role === "OPERATOR") return "/operator/dashboard";
  return "/dashboard";
}

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("password");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
        <p className="text-muted-foreground text-sm">
          Sign in to your urRoute account
        </p>
      </div>

      <GoogleButton redirectTo="/dashboard" />

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or continue with</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "password" && <PasswordForm />}
      {tab === "email-otp" && <EmailOtpForm />}
      {tab === "phone" && <PhoneAuth redirectTo="/dashboard" />}

      <p className="text-center text-sm text-muted-foreground">
        New to urRoute?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

function PasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error?.message ?? "Login failed");
      return;
    }
    router.push(routeForRole(json.data?.user?.role ?? "TRAVELER"));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="identifier">Email or phone</Label>
        <Input
          id="identifier"
          {...register("identifier")}
          placeholder="you@example.com"
          className="h-11"
        />
        {errors.identifier && (
          <p className="text-xs text-destructive">
            {errors.identifier.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          {...register("password")}
          placeholder="••••••••"
          className="h-11"
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="action"
        className="w-full h-11 font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

function EmailOtpForm() {
  const router = useRouter();
  const [otpStep, setOtpStep] = useState<"email" | "code">("email");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function sendOtp() {
    setError(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(otpEmail)) {
      setError("Enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? "Failed to send OTP");
        return;
      }
      setOtpStep("code");
      setCountdown(60);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setError(null);
    if (otpCode.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, otp: otpCode }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? "Verification failed");
        return;
      }
      router.push(routeForRole(json.data?.user?.role ?? "TRAVELER"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {otpStep === "email" ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="otp-email">Email</Label>
            <Input
              id="otp-email"
              type="email"
              value={otpEmail}
              onChange={(e) => setOtpEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button
            type="button"
            variant="action"
            className="w-full h-11 font-semibold"
            onClick={sendOtp}
            disabled={loading}
          >
            {loading ? "Sending…" : "Send OTP"}
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-center text-muted-foreground">
            Enter the 6-digit code sent to {otpEmail}
          </p>
          <OtpInput value={otpCode} onChange={setOtpCode} />
          {error && (
            <p className="text-xs text-center text-destructive">{error}</p>
          )}
          <Button
            type="button"
            variant="action"
            className="w-full h-11 font-semibold"
            onClick={verifyOtp}
            disabled={loading || otpCode.length !== 6}
          >
            {loading ? "Verifying…" : "Verify"}
          </Button>
          <button
            type="button"
            onClick={sendOtp}
            disabled={countdown > 0 || loading}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60"
          >
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
          </button>
        </>
      )}
    </div>
  );
}
