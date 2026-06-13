import type { Metadata } from "next";
import Link from "next/link";
import { Bus, CheckCircle } from "lucide-react";

export const metadata: Metadata = { title: "urRoute — Sign in" };

const HIGHLIGHTS = [
  "Search 200+ verified routes across India",
  "Earn loyalty rewards on every single trip",
  "Unlock bigger discounts as you ride more",
  "Secure payments — powered by Razorpay",
];

const LEVELS = [
  { code: "L1", name: "Welcome", color: "bg-slate-500/30 text-slate-200 border border-slate-500/30" },
  { code: "L2", name: "Stay",    color: "bg-blue-500/30 text-blue-200 border border-blue-500/30" },
  { code: "L3", name: "Loyalty", color: "bg-purple-500/30 text-purple-200 border border-purple-500/30" },
  { code: "L4", name: "Champion",color: "bg-amber-500/30 text-amber-200 border border-amber-500/30" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: dark navy brand ──────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] shrink-0 bg-sidebar flex-col justify-between p-10">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-sidebar-active flex items-center justify-center transition-transform group-hover:scale-105">
            <Bus className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">urRoute</span>
        </Link>

        {/* Center content */}
        <div className="space-y-10">
          {/* Heading */}
          <div className="space-y-3">
            <p className="text-sidebar-active text-[10px] font-bold uppercase tracking-[0.2em]">
              B2B2C Bus Loyalty Platform
            </p>
            <h1 className="text-3xl font-extrabold text-white leading-snug">
              Book smarter.<br />
              <span className="text-sidebar-active">Earn every mile.</span>
            </h1>
            <p className="text-sidebar-foreground/60 text-sm leading-relaxed max-w-xs">
              Join thousands of travelers who earn loyalty rewards and unlock exclusive discounts with every journey.
            </p>
          </div>

          {/* Highlights */}
          <ul className="space-y-3">
            {HIGHLIGHTS.map((text) => (
              <li key={text} className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-sidebar-active mt-0.5 shrink-0" />
                <span className="text-sidebar-foreground/75 text-sm">{text}</span>
              </li>
            ))}
          </ul>

          {/* Level pills */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40 mb-3">
              Loyalty Levels
            </p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <span
                  key={l.code}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full ${l.color}`}
                >
                  {l.code} · {l.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="text-sidebar-foreground/25 text-xs">
          © {new Date().getFullYear()} urRoute. All rights reserved.
        </p>
      </div>

      {/* ── Right panel: form ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bus className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-extrabold text-primary">urRoute</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
