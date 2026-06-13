import type { Metadata } from "next";
import Link from "next/link";
import { Bus, Route, Star, Shield } from "lucide-react";

export const metadata: Metadata = { title: "urRoute — Sign in" };

const HIGHLIGHTS = [
  { icon: Route, text: "Search buses across verified operators" },
  { icon: Star, text: "Earn loyalty rewards on every ride" },
  { icon: Shield, text: "Secure payments via Razorpay" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left — dark navy brand panel */}
      <div className="hidden lg:flex lg:w-[45%] shrink-0 bg-sidebar flex-col justify-between p-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sidebar-active flex items-center justify-center">
            <Bus className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">urRoute</span>
        </Link>

        {/* Hero copy */}
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-sidebar-active text-xs font-semibold uppercase tracking-widest">
              B2B2C Bus Loyalty Platform
            </p>
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Empowering operators.<br />
              Rewarding travellers.
            </h1>
            <p className="text-sidebar-foreground/70 text-base leading-relaxed max-w-sm">
              The smarter way to book intercity buses — earn discounts and perks with every trip you take.
            </p>
          </div>

          <div className="space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-sidebar-active" />
                </div>
                <p className="text-sidebar-foreground/80 text-sm">{text}</p>
              </div>
            ))}
          </div>

          {/* Level preview pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "L1 Welcome", color: "bg-slate-500/30 text-slate-200" },
              { label: "L2 Stay", color: "bg-blue-500/30 text-blue-200" },
              { label: "L3 Loyalty", color: "bg-purple-500/30 text-purple-200" },
              { label: "L4 Champion", color: "bg-amber-500/30 text-amber-200" },
            ].map((l) => (
              <span key={l.label} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${l.color}`}>
                {l.label}
              </span>
            ))}
          </div>
        </div>

        <p className="text-sidebar-foreground/30 text-xs">
          © {new Date().getFullYear()} urRoute. All rights reserved.
        </p>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        {/* Mobile logo — only visible on small screens */}
        <div className="w-full max-w-sm">
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bus className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-extrabold text-primary">urRoute</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
