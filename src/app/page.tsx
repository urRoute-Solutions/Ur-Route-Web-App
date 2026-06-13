"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bus, ArrowRight, ArrowLeftRight, MapPin, Calendar,
  Star, CheckCircle, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const LEVELS = [
  {
    code: "L1", name: "Welcome", trips: "Trips 1–4",
    bar: "bg-slate-400",
    card: "border-slate-200 dark:border-slate-700",
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    perk: "Flat 11% off every ride",
  },
  {
    code: "L2", name: "Stay", trips: "Trips 4–8",
    bar: "bg-blue-500",
    card: "border-blue-100 dark:border-blue-900",
    badge: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
    perk: "10% off + group bonuses",
  },
  {
    code: "L3", name: "Loyalty", trips: "Trips 8–12",
    bar: "bg-purple-500",
    card: "border-purple-100 dark:border-purple-900",
    badge: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300",
    perk: "₹150 flat reward per trip",
  },
  {
    code: "L4", name: "Champion", trips: "Trips 12+",
    bar: "bg-amber-500",
    card: "border-amber-100 dark:border-amber-900",
    badge: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    perk: "15% off + priority perks",
  },
];

const POPULAR_CITIES = ["Chennai", "Bangalore", "Coimbatore", "Madurai", "Trichy", "Salem"];

const STATS = [
  { value: "50+", label: "Operators" },
  { value: "200+", label: "Routes" },
  { value: "₹4.2Cr", label: "Saved" },
  { value: "4.8★", label: "Rating" },
];

const HOW_STEPS = [
  { n: "1", title: "Search buses", desc: "Enter your origin, destination and travel date to find available buses." },
  { n: "2", title: "Choose your seat", desc: "Pick your preferred seat type — AC Sleeper, AC Seater, or Non-AC." },
  { n: "3", title: "Earn loyalty rewards", desc: "Every trip moves you up a loyalty level. Discounts compound as you travel more." },
];

export default function HomePage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ origin, destination, date });
    window.location.href = `/search?${params}`;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Sticky white header ───────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bus className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-primary text-lg tracking-tight">urRoute</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#loyalty" className="hover:text-foreground transition-colors">Loyalty</Link>
            <Link href="#operators" className="hover:text-foreground transition-colors">Operators</Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="action" size="sm" className="font-semibold">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Dark navy hero with search card ──────────────────── */}
      <section className="bg-sidebar py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left: heading */}
            <div className="text-white space-y-5">
              <p className="text-sidebar-active text-xs font-semibold uppercase tracking-widest">
                India&apos;s smartest bus booking
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                Book your bus,<br />
                <span className="text-sidebar-active">Earn every mile.</span>
              </h1>
              <p className="text-white/60 text-base leading-relaxed max-w-sm">
                Search buses across 50+ verified operators. Earn loyalty rewards on every booking and unlock bigger discounts as you ride.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {["Free to join", "No hidden fees", "Instant confirmation"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-xs text-white/60">
                    <CheckCircle className="h-3.5 w-3.5 text-sidebar-active" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: search card */}
            <div className="bg-white dark:bg-card rounded-2xl shadow-2xl p-6 space-y-5">
              <h2 className="text-base font-bold text-foreground">Find your bus</h2>
              <form onSubmit={handleSearch} className="space-y-4">
                {/* From / To with swap */}
                <div className="relative space-y-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input
                      placeholder="From — Origin city"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="pl-9 h-12 text-sm font-medium"
                      required
                    />
                  </div>

                  {/* Swap button */}
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                  </button>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="To — Destination city"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="pl-9 h-12 text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-9 h-12 text-sm font-medium"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="action"
                  className="w-full h-12 text-base font-bold gap-2"
                >
                  Search Buses <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              {/* Popular cities */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Popular</p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_CITIES.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setOrigin(city)}
                      className="text-xs px-2.5 py-1 rounded-full border border-border bg-muted/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors font-medium"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats row ─────────────────────────────────────────── */}
      <section className="bg-white dark:bg-card border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center py-6 gap-1">
                <p className="text-2xl font-extrabold text-primary">{value}</p>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section id="features" className="py-20 bg-muted/40">
        <div className="container space-y-12">
          <div className="text-center space-y-3">
            <p className="text-action text-xs font-semibold uppercase tracking-widest">Simple process</p>
            <h2 className="text-3xl font-extrabold">How It Works</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              From search to seat in under 2 minutes. Rewards applied automatically.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {HOW_STEPS.map(({ n, title, desc }) => (
              <div
                key={n}
                className="bg-white dark:bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow space-y-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-base shrink-0">
                  {n}
                </div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Loyalty Levels ────────────────────────────────────── */}
      <section id="loyalty" className="py-20 bg-white dark:bg-background">
        <div className="container space-y-12">
          <div className="text-center space-y-3">
            <p className="text-action text-xs font-semibold uppercase tracking-widest">Loyalty Journey</p>
            <h2 className="text-3xl font-extrabold">Four levels. One continuous cycle.</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              Progress freezes when you ride another operator — and resumes the moment you return. No full resets.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LEVELS.map((l) => (
              <div
                key={l.name}
                className={`border rounded-xl overflow-hidden bg-white dark:bg-card ${l.card}`}
              >
                <div className={`h-1.5 w-full ${l.bar}`} />
                <div className="p-5 space-y-3">
                  <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${l.badge}`}>
                    {l.code} · {l.name}
                  </span>
                  <p className="text-[11px] text-muted-foreground">{l.trips}</p>
                  <p className="text-sm font-semibold">{l.perk}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Progress freezes after inactivity — not deleted. Riders pick up where they left off.</span>
          </div>
        </div>
      </section>

      {/* ── Operator CTA ──────────────────────────────────────── */}
      <section id="operators" className="py-20 bg-action">
        <div className="container text-center space-y-6 text-white">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">For Operators</p>
          <h2 className="text-3xl font-extrabold">Join urRoute as an Operator</h2>
          <p className="text-white/75 max-w-md mx-auto text-sm leading-relaxed">
            Register your fleet, configure loyalty offers, and watch repeat bookings climb — all from one powerful dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="font-semibold bg-white text-action hover:bg-white/90 hover:text-action"
              >
                Register as Operator
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white hover:border-white/60"
              >
                Sign in
              </Button>
            </Link>
          </div>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/60 pt-2">
            {["Free to start", "No setup fee", "Cancel anytime"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-white/80" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-sidebar text-sidebar-foreground">
        <div className="container py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sidebar-active flex items-center justify-center">
                  <Bus className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-extrabold text-white text-lg tracking-tight">urRoute</span>
              </div>
              <p className="text-xs text-sidebar-foreground/50 max-w-[200px]">
                India&apos;s smartest bus booking platform with loyalty rewards.
              </p>
            </div>

            <nav className="flex flex-wrap gap-6 text-sm text-sidebar-foreground/60">
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              <Link href="#loyalty" className="hover:text-white transition-colors">Loyalty</Link>
              <Link href="#operators" className="hover:text-white transition-colors">Operators</Link>
              <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
              <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            </nav>
          </div>

          <div className="mt-8 pt-6 border-t border-sidebar-border text-xs text-sidebar-foreground/30 flex flex-col sm:flex-row justify-between gap-2">
            <span>© 2026 urRoute. All rights reserved.</span>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-sidebar-foreground/60 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-sidebar-foreground/60 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
