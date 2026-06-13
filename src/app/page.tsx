"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowLeftRight,
  MapPin,
  Calendar,
  Search,
  Gift,
  ShieldCheck,
  Users,
  Star,
  Sparkles,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { cn } from "@/lib/utils";

function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const POPULAR = [
  "Chennai",
  "Bangalore",
  "Coimbatore",
  "Madurai",
  "Trichy",
  "Hyderabad",
];

const STATS = [
  { value: "50+", label: "Operators" },
  { value: "200+", label: "Routes" },
  { value: "10,000+", label: "Rides" },
  { value: "4.8★", label: "Rating" },
];

const FEATURES = [
  {
    icon: Gift,
    title: "Loyalty Rewards",
    desc: "Earn rewards on every trip. Climb four levels, unlock bigger discounts, and never lose your progress.",
    iconBg: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    desc: "Bank-grade payments via Razorpay with instant confirmation and a clear receipt every single time.",
    iconBg: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300",
  },
  {
    icon: Users,
    title: "Group Travel",
    desc: "Book multiple seats together and earn bonus rewards when you travel with friends and family.",
    iconBg: "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300",
  },
];

const LEVELS = [
  {
    code: "L1",
    name: "Welcome",
    perk: "11% off every ride",
    range: "Trips 1–4",
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    fill: "30%",
  },
  {
    code: "L2",
    name: "Stay",
    perk: "10% off + group bonus",
    range: "Trips 4–8",
    badge: "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300",
    fill: "55%",
  },
  {
    code: "L3",
    name: "Loyalty",
    perk: "₹150 flat reward",
    range: "Trips 8–12",
    badge: "bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300",
    fill: "80%",
  },
  {
    code: "L4",
    name: "Champion",
    perk: "15% off + priority perks",
    range: "Trips 12+",
    badge: "bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300",
    fill: "100%",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Nair",
    role: "Frequent Traveler",
    initials: "PN",
    color: "bg-purple-500",
    quote:
      "I travel between Chennai and Bangalore every month. The rewards actually add up — I've saved thousands without changing anything about how I book.",
  },
  {
    name: "Karthik Sundaram",
    role: "Business Traveler",
    initials: "KS",
    color: "bg-blue-500",
    quote:
      "Booking is fast, confirmation is instant, and reaching Champion level genuinely changed how much I pay. It just works.",
  },
  {
    name: "Ananya Krishnan",
    role: "College Student",
    initials: "AK",
    color: "bg-action",
    quote:
      "As a student every rupee counts. Group travel bonuses with my friends make weekend trips home so much cheaper.",
  },
];

export default function HomePage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  function swap() {
    setFrom(to);
    setTo(from);
  }

  const searchHref = `/search?${new URLSearchParams({
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    ...(date ? { date } : {}),
  }).toString()}`;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* ───────────── Hero ───────────── */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background pt-16">
        {/* ambient glows */}
        <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-action/10 blur-3xl" />

        <div className="container relative w-full py-16">
          <div className="mx-auto max-w-3xl text-center">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-action" />
              Trusted by 50+ operators across India
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-6xl font-black leading-[1.05] tracking-tight text-foreground md:text-7xl"
            >
              Your journey,
              <br />
              <span className="text-primary">rewarded.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
            >
              Search buses, book seats, earn loyalty rewards — all in one place.
            </motion.p>
          </div>

          {/* Search widget */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-10 max-w-4xl rounded-2xl border border-border bg-card p-3 shadow-2xl shadow-primary/5"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
              {/* From */}
              <label className="group flex flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-muted/60">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <span className="flex flex-col text-left">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    From
                  </span>
                  <input
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="Chennai"
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/60"
                  />
                </span>
              </label>

              {/* Swap */}
              <button
                type="button"
                onClick={swap}
                aria-label="Swap origin and destination"
                className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>

              {/* To */}
              <label className="group flex flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-muted/60">
                <MapPin className="h-5 w-5 shrink-0 text-action" />
                <span className="flex flex-col text-left">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    To
                  </span>
                  <input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Bangalore"
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/60"
                  />
                </span>
              </label>

              {/* Date */}
              <label className="group flex flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-muted/60 md:max-w-[180px]">
                <Calendar className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="flex flex-col text-left">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Date
                  </span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium outline-none"
                  />
                </span>
              </label>

              {/* CTA */}
              <Button
                variant="action"
                size="lg"
                className="h-auto shrink-0 px-6 py-4 text-base"
                asChild
              >
                <Link href={searchHref}>
                  <Search className="h-4 w-4" />
                  Search Buses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Popular chips */}
          <div className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Popular:
            </span>
            {POPULAR.map((city) => (
              <button
                key={city}
                onClick={() => (from ? setTo(city) : setFrom(city))}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {city}
              </button>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Free to join · No hidden fees · Instant confirmation
          </p>
        </div>
      </section>

      {/* ───────────── Stats strip ───────────── */}
      <section className="border-y border-border bg-card">
        <div className="container grid grid-cols-2 divide-y divide-border md:grid-cols-4 md:divide-x md:divide-y-0">
          {STATS.map((s) => (
            <div key={s.label} className="px-6 py-8 text-center">
              <p className="text-3xl font-black tracking-tight text-foreground">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── Features ───────────── */}
      <section id="features" className="scroll-mt-20 py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
              Everything you need
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              One platform for booking, paying, and being rewarded for every
              mile you travel.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.1}>
              <div
                className="group rounded-2xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    f.iconBg
                  )}
                >
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all group-hover:gap-2.5">
                  Learn more <ArrowRight className="h-4 w-4" />
                </span>
              </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Loyalty ───────────── */}
      <section
        id="loyalty"
        className="scroll-mt-20 border-y border-border bg-muted/30 py-24"
      >
        <div className="container grid items-center gap-14 lg:grid-cols-2">
          {/* Left */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-action">
              Loyalty Program
            </span>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
              Four levels.
              <br />
              One endless journey.
            </h2>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              The more you ride, the more you save. Climb from Welcome to
              Champion — and the best part? Your progress never resets. It
              freezes when you pause and resumes when you&apos;re back.
            </p>
            <Button variant="action" size="lg" className="mt-8" asChild>
              <Link href="/register">
                Start earning <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Right — stacked level rows */}
          <div className="space-y-3">
            {LEVELS.map((lvl) => (
              <div
                key={lvl.code}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold",
                        lvl.badge
                      )}
                    >
                      {lvl.code}
                    </span>
                    <div>
                      <p className="font-bold text-foreground">{lvl.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {lvl.perk}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {lvl.range}
                  </span>
                </div>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-action transition-all duration-700"
                    style={{ width: lvl.fill }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Testimonials ───────────── */}
      <section className="py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
              Loved by travelers
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Real journeys, real rewards, real savings.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.12}>
              <div
                className="flex flex-col rounded-2xl border border-border bg-card p-8"
              >
                <div className="mb-4 flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white",
                      t.color
                    )}
                  >
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Operator CTA ───────────── */}
      <section id="operator" className="scroll-mt-20 bg-primary py-20">
        <div className="container text-center">
          <h2 className="mx-auto max-w-2xl text-4xl font-black tracking-tight text-primary-foreground md:text-5xl">
            Power your fleet with urRoute
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-primary-foreground/80">
            Join 50+ operators growing traveler retention with loyalty rewards,
            real-time analytics, and effortless booking management.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/register">
                Register as Operator <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-primary-foreground hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
