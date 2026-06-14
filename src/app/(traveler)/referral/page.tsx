"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Users, Link2, Gift, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ReferralData = {
  referralCode: string;
  totalReferrals: number;
  referrals: Array<{ fullName: string; joinedAt: string }>;
};

export default function ReferralPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  useEffect(() => {
    fetch("/api/referral")
      .then((r) => r.json())
      .then((j) => setData(j.data ?? null));
  }, []);

  function copyCode() {
    if (!data) return;
    navigator.clipboard.writeText(data.referralCode);
    setCopied("code");
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(null), 2000);
  }

  function copyLink() {
    if (!data) return;
    const link = `${window.location.origin}/register?ref=${data.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied("link");
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(null), 2000);
  }

  function share() {
    if (!data) return;
    const link = `${window.location.origin}/register?ref=${data.referralCode}`;
    if (navigator.share) {
      navigator.share({ title: "Join urRoute", text: "Book buses and earn rewards on urRoute!", url: link });
    } else {
      copyLink();
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white dark:bg-card border-b border-border">
        <div className="container py-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Refer Friends</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Share urRoute and grow together</p>
        </div>
      </div>

      <div className="container py-8 max-w-xl space-y-6">
        {/* Hero card */}
        <div className="rounded-2xl bg-[#1B2D78] p-6 text-white">
          <Gift className="h-8 w-8 mb-3 text-green-400" />
          <h2 className="text-xl font-black">Invite friends to urRoute</h2>
          <p className="mt-1 text-sm text-white/70">
            Share your referral code. When they sign up and book their first trip, both of you win.
          </p>
        </div>

        {/* Code card */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your referral code</p>

          {data ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-center">
                  <p className="text-2xl font-black font-mono tracking-[0.2em] text-[#1B2D78] dark:text-blue-400">
                    {data.referralCode}
                  </p>
                </div>
                <button
                  onClick={copyCode}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted transition-colors hover:bg-primary hover:text-white hover:border-primary"
                  aria-label="Copy code"
                >
                  {copied === "code" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={copyLink}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                    copied === "link"
                      ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  <Link2 className="h-4 w-4" />
                  {copied === "link" ? "Copied!" : "Copy link"}
                </button>
                <button
                  onClick={share}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#1B2D78] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1B2D78]/90"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </>
          ) : (
            <div className="h-16 rounded-xl bg-muted animate-pulse" />
          )}
        </div>

        {/* Stats */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{data?.totalReferrals ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Friends joined via your code</p>
            </div>
          </div>
        </div>

        {/* Referred friends list */}
        {data && data.referrals.length > 0 && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">People who joined</p>
            </div>
            <div className="divide-y divide-border">
              {data.referrals.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {r.fullName[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-foreground">{r.fullName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
