"use client";

import Link from "next/link";
import { useState, useRef } from "react";
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
  Zap,
  TrendingUp,
  CheckCircle,
  Award,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { cn } from "@/lib/utils";

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
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
  "Pondicherry",
  "Salem",
];

const STATS = [
  { value: "50+", label: "Bus Operators" },
  { value: "200+", label: "Routes" },
  { value: "10,000+", label: "Happy Riders" },
  { value: "4.8 / 5", label: "Avg Rating" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Search Buses",
    desc: "Enter your origin, destination, and travel date. Browse available buses in seconds.",
    icon: Search,
    color: "bg-blue-500",
  },
  {
    step: "02",
    title: "Book Your Seat",
    desc: "Choose your seat, pay securely via Razorpay, and get an instant confirmation.",
    icon: CheckCircle,
    color: "bg-action",
  },
  {
    step: "03",
    title: "Earn & Climb",
    desc: "Earn loyalty points with every trip. Unlock operator-exclusive rewards as you climb tiers.",
    icon: Award,
    color: "bg-amber-500",
  },
];

const FEATURES = [
  {
    icon: Gift,
    title: "Operator-Powered Rewards",
    desc: "Every bus operator on urRoute crafts their own exclusive loyalty offers — from percentage discounts to flat rewards and group bonuses. Your perks grow with your loyalty.",
    from: "from-purple-500",
    to: "to-indigo-500",
    softBg: "bg-purple-50 dark:bg-purple-950/40",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Instant Payments",
    desc: "Bank-grade security through Razorpay. Booking confirmation arrives before your bus does — every single time, no exceptions.",
    from: "from-blue-500",
    to: "to-cyan-500",
    softBg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    icon: Users,
    title: "Group Travel Bonuses",
    desc: "Travel with friends and family, earn even more. Operators set per-head group bonuses that stack on top of your tier rewards.",
    from: "from-emerald-500",
    to: "to-teal-500",
    softBg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
];

const LEVELS = [
  {
    number: "1",
    code: "L1",
    name: "Welcome",
    range: "Trips 1–4",
    desc: "Your first rides with an operator. Rewards kick in from day one.",
    gradient: "from-slate-400 to-slate-500",
    glow: "shadow-slate-500/20",
    textAccent: "text-slate-300",
  },
  {
    number: "2",
    code: "L2",
    name: "Stay",
    range: "Trips 5–8",
    desc: "You kept coming back. Bigger discounts and group bonuses unlock.",
    gradient: "from-blue-400 to-blue-600",
    glow: "shadow-blue-500/20",
    textAccent: "text-blue-300",
  },
  {
    number: "3",
    code: "L3",
    name: "Loyalty",
    range: "Trips 9–12",
    desc: "A verified loyal traveler. Flat rewards and priority perks are yours.",
    gradient: "from-violet-400 to-purple-600",
    glow: "shadow-purple-500/20",
    textAccent: "text-purple-300",
  },
  {
    number: "4",
    code: "L4",
    name: "Champion",
    range: "Trips 13+",
    desc: "Top tier. Maximum operator rewards. Progress never resets — ever.",
    gradient: "from-amber-400 to-orange-500",
    glow: "shadow-amber-500/20",
    textAccent: "text-amber-300",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Nair",
    role: "Frequent Traveler · Chennai",
    initials: "PN",
    avatar: "bg-gradient-to-br from-purple-500 to-indigo-600",
    quote:
      "I travel Chennai–Bangalore every month. My operator set a 12% discount at L3 and I've saved more than ₹3,000 this year without changing a thing.",
    stars: 5,
  },
  {
    name: "Karthik Sundaram",
    role: "Business Traveler · Bangalore",
    initials: "KS",
    avatar: "bg-gradient-to-br from-blue-500 to-cyan-600",
    quote:
      "Booking is fast, confirmation is instant, and my operator's Champion-tier discount genuinely changed how much I pay every single trip.",
    stars: 5,
  },
  {
    name: "Ananya Krishnan",
    role: "College Student · Coimbatore",
    initials: "AK",
    avatar: "bg-gradient-to-br from-emerald-500 to-teal-600",
    quote:
      "Group bonuses are real. My operator gives ₹60 per extra person — when 4 of us travel home on weekends it adds up fast.",
    stars: 5,
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
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* ─── Hero ─── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[hsl(228,68%,10%)] pt-16">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-action/20 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl" />

        {/* Dot-grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="container relative z-10 py-16">
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-action" />
              Trusted by 50+ operators across India
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 text-center text-5xl font-black leading-[1.04] tracking-tight text-white md:text-7xl lg:text-8xl"
          >
            Book smarter.
            <br />
            <span className="bg-gradient-to-r from-[hsl(142,71%,58%)] to-[hsl(165,70%,52%)] bg-clip-text text-transparent">
              Earn every ride.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-6 max-w-lg text-center text-lg leading-relaxed text-white/55"
          >
            Search buses across 200+ routes. Book in seconds. Earn
            operator-exclusive loyalty rewards that grow with every trip.
          </motion.p>

          {/* Search widget */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.33, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-10 max-w-4xl"
          >
            <div className="rounded-2xl border border-white/10 bg-white/8 p-2 shadow-2xl backdrop-blur-md">
              <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
                {/* From */}
                <label className="group flex flex-1 cursor-pointer items-center gap-3 rounded-xl bg-white px-4 py-4 transition-shadow hover:shadow-md">
                  <MapPin className="h-5 w-5 shrink-0 text-primary" />
                  <span className="flex flex-col text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      From
                    </span>
                    <input
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="Chennai"
                      className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/50"
                    />
                  </span>
                </label>

                {/* Swap button */}
                <button
                  type="button"
                  onClick={swap}
                  aria-label="Swap origin and destination"
                  className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full bg-white text-primary shadow-md transition-transform hover:scale-110 hover:shadow-lg active:scale-95"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </button>

                {/* To */}
                <label className="group flex flex-1 cursor-pointer items-center gap-3 rounded-xl bg-white px-4 py-4 transition-shadow hover:shadow-md">
                  <MapPin className="h-5 w-5 shrink-0 text-action" />
                  <span className="flex flex-col text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      To
                    </span>
                    <input
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="Bangalore"
                      className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/50"
                    />
                  </span>
                </label>

                {/* Date */}
                <label className="group flex cursor-pointer items-center gap-3 rounded-xl bg-white px-4 py-4 transition-shadow hover:shadow-md md:max-w-[190px]">
                  <Calendar className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="flex flex-col text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Date
                    </span>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-foreground outline-none"
                    />
                  </span>
                </label>

                {/* CTA */}
                <Button
                  variant="action"
                  size="lg"
                  className="h-auto shrink-0 rounded-xl px-7 py-4 text-base font-bold shadow-lg shadow-action/25 transition-all hover:shadow-action/40 active:scale-[0.98]"
                  asChild
                >
                  <Link href={searchHref}>
                    <Search className="h-4 w-4" />
                    Search
                  </Link>
                </Button>
              </div>
            </div>

            {/* Popular cities */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-white/35">Popular:</span>
              {POPULAR.map((city) => (
                <button
                  key={city}
                  onClick={() => (from ? setTo(city) : setFrom(city))}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/55 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  {city}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 text-center text-xs text-white/30"
          >
            Free to join · No hidden fees · Instant confirmation
          </motion.p>
        </div>

        {/* Bottom fade to page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ─── Stats strip ─── */}
      <section className="border-y border-border bg-card">
        <div className="container grid grid-cols-2 divide-border md:grid-cols-4 md:divide-x">
          {STATS.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.07}>
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <p className="text-4xl font-black tracking-tight text-foreground">
                  {s.value}
                </p>
                <p className="mt-1.5 text-sm font-medium text-muted-foreground">
                  {s.label}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="py-24 bg-muted/20">
        <div className="container">
          <FadeUp className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-action">
              Simple as 1-2-3
            </span>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-foreground md:text-5xl">
              How urRoute works
            </h2>
          </FadeUp>

          <div className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-6">
            {/* Connecting line on desktop */}
            <div className="pointer-events-none absolute top-10 left-[18%] right-[18%] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

            {HOW_IT_WORKS.map((step, i) => (
              <FadeUp key={step.step} delay={i * 0.14}>
                <div className="relative flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl shadow-xl",
                      step.color
                    )}
                  >
                    <step.icon className="h-9 w-9 text-white" />
                    <span className="absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-foreground text-[11px] font-black text-background shadow">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-7 text-xl font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="scroll-mt-20 py-24">
        <div className="container">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-action">
              Why urRoute
            </span>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-foreground md:text-5xl">
              Built for the road ahead
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every feature is designed to make your travel experience faster,
              safer, and more rewarding.
            </p>
          </FadeUp>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.1}>
                <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5">
                  {/* Gradient accent top border */}
                  <div
                    className={cn(
                      "absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r",
                      f.from,
                      f.to
                    )}
                  />

                  <div className={cn("inline-flex h-14 w-14 items-center justify-center rounded-xl", f.softBg)}>
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white",
                        f.from,
                        f.to
                      )}
                    >
                      <f.icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
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

      {/* ─── Loyalty Program ─── */}
      <section
        id="loyalty"
        className="scroll-mt-20 bg-[hsl(228,68%,10%)] py-24"
      >
        <div className="container">
          {/* Header */}
          <FadeUp className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-action">
              Loyalty Program
            </span>
            <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
              Operators craft
              <br />
              your rewards.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/55">
              Every bus operator on urRoute sets their own exclusive discounts
              and rewards for each tier. The more loyal you are, the better your
              deal — and your progress never resets.
            </p>
          </FadeUp>

          {/* Tier cards */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LEVELS.map((lvl, i) => (
              <FadeUp key={lvl.code} delay={i * 0.1}>
                <div
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/5 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/8 hover:shadow-2xl",
                    lvl.glow
                  )}
                >
                  {/* Gradient top bar */}
                  <div
                    className={cn(
                      "absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r",
                      lvl.gradient
                    )}
                  />

                  {/* Level badge + name */}
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black text-white bg-gradient-to-br shadow-lg",
                        lvl.gradient
                      )}
                    >
                      {lvl.number}
                    </div>
                    <div>
                      <p className="font-bold text-white">{lvl.name}</p>
                      <p className={cn("text-xs font-medium", lvl.textAccent)}>
                        {lvl.range}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-relaxed text-white/55">
                    {lvl.desc}
                  </p>

                  {/* Reward callout */}
                  <div className="mt-5 rounded-lg border border-white/8 bg-white/5 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      Reward
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-white/70">
                      Set by your operator
                    </p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Info note */}
          <FadeUp delay={0.45} className="mx-auto mt-8 max-w-2xl">
            <div className="flex items-start gap-3 rounded-xl border border-action/20 bg-action/8 p-4">
              <Zap className="mt-0.5 h-5 w-5 shrink-0 text-action" />
              <p className="text-sm text-white/55">
                <span className="font-semibold text-white">
                  How operator rewards work:
                </span>{" "}
                Each operator sets their own discount %, flat ₹ reward, max cap,
                and group bonus amounts for every tier. Book with an operator and
                their specific offers apply to your loyalty progress automatically.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.55} className="mt-8 text-center">
            <Button variant="action" size="lg" className="px-8 font-bold" asChild>
              <Link href="/register">
                Start earning rewards <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </FadeUp>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24">
        <div className="container">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-action">
              Reviews
            </span>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-foreground md:text-5xl">
              Loved by real travelers
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Real journeys. Actual rewards. Genuine savings.
            </p>
          </FadeUp>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.12}>
                <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5">
                  {/* Large decorative quote */}
                  <div className="absolute top-4 right-6 select-none font-black leading-none text-primary/5 text-[80px]">
                    &ldquo;
                  </div>

                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star
                        key={j}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  <p className="flex-1 text-[15px] leading-relaxed text-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                    <span
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white",
                        t.avatar
                      )}
                    >
                      {t.initials}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Dual CTA ─── */}
      <section className="border-y border-border bg-muted/20 py-20">
        <div className="container grid gap-6 md:grid-cols-2">
          {/* Traveler */}
          <FadeUp>
            <div className="flex flex-col rounded-2xl bg-primary p-10 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                <Gift className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white">
                Ready to save?
              </h3>
              <p className="mt-3 text-primary-foreground/65">
                Join thousands of travelers earning rewards on routes across
                India.
              </p>
              <Button
                size="lg"
                className="mt-7 w-full bg-white font-bold text-primary hover:bg-white/92"
                asChild
              >
                <Link href="/register">
                  Sign up free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeUp>

          {/* Operator */}
          <FadeUp delay={0.1}>
            <div className="flex flex-col rounded-2xl border-2 border-action/30 bg-action/5 p-10 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-action/10">
                <TrendingUp className="h-7 w-7 text-action" />
              </div>
              <h3 className="text-2xl font-black text-foreground">
                Running a fleet?
              </h3>
              <p className="mt-3 text-muted-foreground">
                Set your own loyalty offers for each tier. Grow retention,
                manage bookings, and track analytics — all in one dashboard.
              </p>
              <Button
                variant="action"
                size="lg"
                className="mt-7 w-full font-bold"
                asChild
              >
                <Link href="/register">
                  Register as Operator <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
