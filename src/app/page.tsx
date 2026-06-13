"use client";

import Link from "next/link";
import { useState } from "react";
import { Bus, ArrowRight, ArrowLeftRight, MapPin, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const POPULAR = ["Chennai", "Bangalore", "Coimbatore", "Madurai", "Trichy", "Hyderabad"];

const LEVELS = [
  {
    code: "L1", name: "Welcome", trips: "Trips 1–4",
    border: "border-slate-300 dark:border-slate-600",
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    perk: "11% off every ride",
  },
  {
    code: "L2", name: "Stay", trips: "Trips 4–8",
    border: "border-blue-300 dark:border-blue-700",
    badge: "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300",
    perk: "10% off + group bonuses",
  },
  {
    code: "L3", name: "Loyalty", trips: "Trips 8–12",
    border: "border-purple-300 dark:border-purple-700",
    badge: "bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300",
    perk: "₹150 flat reward",
  },
  {
    code: "L4", name: "Champion", trips: "Trips 12+",
    border: "border-amber-300 dark:border-amber-600",
    badge: "bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300",
    perk: "15% off + priority perks",
  },
];

export default function HomePage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  function swap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function search(e: React.FormEvent) {
    e.preventDefault();
    window.location.href = `/search?${new URLSearchParams({ origin, destination, date })}`;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-background">

      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/90 dark:bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between gap-4" style={{ height: 60 }}>
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Bus className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-black text-primary text-base tracking-tight">urRoute</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <Link href="#how"       className="hover:text-foreground transition-colors">How it works</Link>
            <Link href="#loyalty"   className="hover:text-foreground transition-colors">Loyalty</Link>
            <Link href="#operators" className="hover:text-foreground transition-colors">Operators</Link>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="action" size="sm" className="font-semibold text-sm px-4">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-36 pb-24 px-5">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.08] text-foreground">
            Book your bus.<br />
            <span className="text-primary">Earn every mile.</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
            Search across 50+ verified operators. Every trip earns loyalty rewards and unlocks bigger discounts.
          </p>
        </div>

        {/* Search card */}
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] dark:shadow-none p-4">
            <form onSubmit={search} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input
                  placeholder="From city"
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  className="pl-9 h-11 border-0 bg-muted/60 dark:bg-muted/30 rounded-xl text-sm"
                  required
                />
              </div>

              <button
                type="button"
                onClick={swap}
                className="hidden sm:flex h-11 w-11 shrink-0 rounded-xl bg-muted/60 dark:bg-muted/30 items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </button>

              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="To city"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="pl-9 h-11 border-0 bg-muted/60 dark:bg-muted/30 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="pl-9 h-11 border-0 bg-muted/60 dark:bg-muted/30 rounded-xl text-sm"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="action"
                className="h-11 px-5 font-bold shrink-0 gap-2 rounded-xl text-sm"
              >
                Search <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Popular cities */}
          <div className="flex flex-wrap gap-2 justify-center mt-5 items-center">
            <span className="text-xs text-muted-foreground">Popular:</span>
            {POPULAR.map(city => (
              <button
                key={city}
                type="button"
                onClick={() => setOrigin(city)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-white dark:bg-card hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors font-medium"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5">
        <div className="border-t border-border" />
      </div>

      {/* How it works */}
      <section id="how" className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 space-y-2">
            <p className="text-xs font-bold text-action uppercase tracking-[0.15em]">Simple</p>
            <h2 className="text-3xl font-black tracking-tight">Three steps to your seat.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                n: "01",
                title: "Search buses",
                desc: "Enter your origin, destination and date. See available buses with real-time seats and pricing.",
              },
              {
                n: "02",
                title: "Choose and book",
                desc: "Pick your preferred bus, pay securely with Razorpay. Get instant booking confirmation.",
              },
              {
                n: "03",
                title: "Earn rewards",
                desc: "Every completed trip advances your loyalty level. Discounts apply automatically — no codes needed.",
              },
            ].map(({ n, title, desc }) => (
              <div key={n} className="space-y-4 group">
                <div className="text-5xl font-black text-border group-hover:text-primary/20 transition-colors select-none">
                  {n}
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loyalty levels */}
      <section id="loyalty" className="py-24 px-5 bg-muted/30 dark:bg-muted/10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 space-y-2">
            <p className="text-xs font-bold text-action uppercase tracking-[0.15em]">Rewards</p>
            <h2 className="text-3xl font-black tracking-tight">Four levels. Permanent progress.</h2>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mt-1">
              Progress freezes when you pause and resumes when you return. Never lost.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LEVELS.map(l => (
              <div
                key={l.code}
                className={cn("bg-white dark:bg-card border-t-4 rounded-xl p-5 space-y-3", l.border)}
              >
                <span className={cn("inline-block text-xs font-bold px-2.5 py-1 rounded-full", l.badge)}>
                  {l.code} · {l.name}
                </span>
                <p className="text-[11px] text-muted-foreground">{l.trips}</p>
                <p className="text-sm font-semibold leading-snug">{l.perk}</p>
              </div>
            ))}
          </div>

          <p className="flex items-center gap-2 text-xs text-muted-foreground mt-8">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            Progress pauses on inactivity — not deleted. Pick up right where you left off.
          </p>
        </div>
      </section>

      {/* Operator CTA */}
      <section id="operators" className="py-24 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border p-10 md:p-14 text-center space-y-5">
            <p className="text-xs font-bold text-action uppercase tracking-[0.15em]">For operators</p>
            <h2 className="text-3xl font-black tracking-tight">Running a bus service?</h2>
            <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
              Register your fleet, configure loyalty rewards, and watch repeat bookings grow — all from one dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/register">
                <Button variant="action" size="lg" className="font-bold px-8">Register as Operator</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="px-8">Sign in</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Bus className="h-4 w-4 text-primary" />
            <span className="font-bold text-foreground">urRoute</span>
            <span>· © 2026</span>
          </div>
          <nav className="flex gap-6">
            <Link href="/login"    className="hover:text-foreground transition-colors">Login</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            <Link href="/search"   className="hover:text-foreground transition-colors">Search</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
