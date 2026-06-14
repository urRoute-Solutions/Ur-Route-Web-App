"use client";

import { useState } from "react";
import { MailWarning, X } from "lucide-react";
import { toast } from "sonner";

export function VerifyEmailBanner({ email }: { email: string }) {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  if (dismissed) return null;

  async function resend() {
    setSending(true);
    const res = await fetch("/api/auth/resend-verification", { method: "POST" });
    setSending(false);
    if (res.ok) {
      toast.success(`Verification email sent to ${email}`);
    } else {
      toast.error("Failed to send. Please try again in a minute.");
    }
  }

  return (
    <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-300">
      <MailWarning className="h-4 w-4 shrink-0" />
      <p className="flex-1">
        Please verify your email address.{" "}
        <button
          onClick={resend}
          disabled={sending}
          className="font-semibold underline underline-offset-2 hover:no-underline disabled:opacity-50"
        >
          {sending ? "Sending..." : "Resend verification email"}
        </button>
      </p>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="shrink-0 rounded p-0.5 hover:bg-amber-200/50 dark:hover:bg-amber-800/50 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
