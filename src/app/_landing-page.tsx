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
  TrendingUp,
  CheckCircle,
  Award,
  Zap,
  Clock,
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
  const inView = useInView(ref, { once: true, margin: "-50px" });
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

/* ── Inline bus SVG illustration ── */
function BusIllustration({ className }: { className?: string }) {
  const lugBolts = [0, 72, 144, 216, 288];
  return (
    <svg
      viewBox="0 0 620 310"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EFF6FF" />
          <stop offset="100%" stopColor="#DBEAFE" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="620" height="310" fill="url(#skyGrad)" rx="16" />

      {/* Back buildings */}
      <rect x="0" y="70" width="55" height="210" rx="4" fill="#E2E8F0" />
      {[88, 108, 128, 148, 168, 188, 208].map((y) => (
        <g key={y}>
          <rect x="8" y={y} width="16" height="10" rx="1" fill="#93C5FD" opacity="0.8" />
          <rect x="30" y={y} width="16" height="10" rx="1" fill="#93C5FD" opacity="0.8" />
        </g>
      ))}

      <rect x="555" y="45" width="65" height="235" rx="4" fill="#E2E8F0" />
      {[60, 82, 104, 126, 148, 170, 192, 214].map((y) => (
        <g key={y}>
          <rect x="562" y={y} width="20" height="13" rx="1" fill="#93C5FD" opacity="0.7" />
          <rect x="591" y={y} width="20" height="13" rx="1" fill="#93C5FD" opacity="0.7" />
        </g>
      ))}

      {/* Mid buildings */}
      <rect x="55" y="130" width="38" height="150" rx="3" fill="#F1F5F9" />
      {[140, 158, 176, 194, 212, 230, 248].map((y) => (
        <rect key={y} x="62" y={y} width="24" height="10" rx="1" fill="#BAE6FD" opacity="0.7" />
      ))}

      <rect x="528" y="120" width="38" height="160" rx="3" fill="#F1F5F9" />
      {[130, 148, 166, 184, 202, 220, 238].map((y) => (
        <rect key={y} x="535" y={y} width="24" height="10" rx="1" fill="#BAE6FD" opacity="0.7" />
      ))}

      {/* Trees */}
      <ellipse cx="62" cy="242" rx="22" ry="20" fill="#86EFAC" />
      <ellipse cx="74" cy="235" rx="16" ry="15" fill="#4ADE80" />
      <rect x="59" y="256" width="7" height="22" rx="2" fill="#92400E" />

      <ellipse cx="550" cy="243" rx="21" ry="19" fill="#86EFAC" />
      <ellipse cx="562" cy="237" rx="15" ry="14" fill="#4ADE80" />
      <rect x="547" y="256" width="7" height="22" rx="2" fill="#92400E" />

      {/* Road surface */}
      <rect x="0" y="262" width="620" height="48" rx="0" fill="#CBD5E1" />
      <rect x="0" y="266" width="620" height="3" fill="#94A3B8" opacity="0.6" />
      {/* Road dashes */}
      {[0, 110, 220, 330, 440, 550].map((x) => (
        <rect key={x} x={x} y="283" width="75" height="5" rx="2.5" fill="white" opacity="0.45" />
      ))}

      {/* === BUS BODY === */}
      {/* Main shell */}
      <rect x="88" y="148" width="415" height="118" rx="12" fill="#1B2D78" />

      {/* Front face */}
      <rect x="463" y="148" width="52" height="118" rx="12" fill="#152261" />
      <rect x="463" y="148" width="14" height="118" fill="#1B2D78" />

      {/* Windshield */}
      <rect x="472" y="162" width="34" height="52" rx="6" fill="#BFDBFE" />
      <rect x="474" y="164" width="11" height="18" rx="3" fill="white" opacity="0.28" />

      {/* Rear cap */}
      <rect x="85" y="148" width="16" height="118" rx="12" fill="#132058" />
      <rect x="93" y="148" width="14" height="118" fill="#1B2D78" />

      {/* Side windows (5) */}
      {[108, 167, 226, 285, 344].map((x, i) => (
        <g key={i}>
          <rect x={x} y="163" width="48" height="38" rx="6" fill="#BFDBFE" />
          <rect x={x} y="163" width="48" height="38" rx="6" stroke="#0F1845" strokeWidth="1.5" fill="none" />
          <rect x={x + 3} y="165" width="14" height="12" rx="2" fill="white" opacity="0.25" />
        </g>
      ))}

      {/* Green brand stripe */}
      <rect x="88" y="214" width="415" height="9" fill="#16A34A" />

      {/* Destination board */}
      <rect x="472" y="151" width="34" height="11" rx="3" fill="#0A1540" />
      <text x="476" y="160" fontFamily="system-ui,sans-serif" fontSize="7.5" fontWeight="600" fill="#FCD34D" letterSpacing="0.5">
        BANGALORE
      </text>

      {/* Headlights */}
      <rect x="472" y="222" width="32" height="11" rx="4" fill="#FDE68A" />
      <rect x="474" y="224" width="28" height="7" rx="3" fill="#FCD34D" />

      {/* Indicator light */}
      <rect x="472" y="236" width="14" height="7" rx="2" fill="#F97316" />

      {/* Brand text */}
      <text
        x="148"
        y="206"
        fontFamily="system-ui,sans-serif"
        fontSize="20"
        fontWeight="800"
        fill="white"
        letterSpacing="1"
        opacity="0.95"
      >
        urRoute
      </text>

      {/* Door */}
      <rect x="402" y="215" width="30" height="51" rx="3" fill="#0F1845" />
      <rect x="415" y="219" width="2" height="43" fill="#1B2D78" />

      {/* Bumper rail */}
      <rect x="88" y="248" width="415" height="8" rx="3" fill="#0A1540" />

      {/* Under-body */}
      <rect x="88" y="255" width="415" height="12" rx="0" fill="#0D1F5C" />

      {/* WHEELS */}
      {/* Rear */}
      {[158, 248].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="268" r="27" fill="#1E293B" />
          <circle cx={cx} cy="268" r="18" fill="#334155" />
          <circle cx={cx} cy="268" r="9" fill="#475569" />
          <circle cx={cx} cy="268" r="4" fill="#64748B" />
          {lugBolts.map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <circle
                key={deg}
                cx={cx + 12 * Math.cos(rad)}
                cy={268 + 12 * Math.sin(rad)}
                r="2"
                fill="#94A3B8"
              />
            );
          })}
        </g>
      ))}
      {/* Front */}
      <circle cx="438" cy="268" r="27" fill="#1E293B" />
      <circle cx="438" cy="268" r="18" fill="#334155" />
      <circle cx="438" cy="268" r="9" fill="#475569" />
      <circle cx="438" cy="268" r="4" fill="#64748B" />
      {lugBolts.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <circle
            key={deg}
            cx={438 + 12 * Math.cos(rad)}
            cy={268 + 12 * Math.sin(rad)}
            r="2"
            fill="#94A3B8"
          />
        );
      })}

      {/* Exhaust */}
      <rect x="84" y="252" width="14" height="5" rx="2" fill="#374151" />
      <ellipse cx="83" cy="254" rx="5" ry="3" fill="#9CA3AF" opacity="0.3" />
    </svg>
  );
}

/* ── Static data ── */
const POPULAR_CITIES = [
  "Chennai", "Bangalore", "Coimbatore", "Madurai",
  "Trichy", "Hyderabad", "Pondicherry", "Salem",
];

const DEALS = [
  {
    label: "Champion Members",
    headline: "Up to 15% off",
    sub: "Reach L4 and unlock your operator's top discount on every ride.",
    bg: "bg-primary",
    text: "text-white",
    sub2: "text-white/70",
    icon: Award,
  },
  {
    label: "Group Travel",
    headline: "Bonus per extra seat",
    sub: "Travel with friends and earn a per-head bonus on top of your tier reward.",
    bg: "bg-action",
    text: "text-white",
    sub2: "text-white/70",
    icon: Users,
  },
  {
    label: "Instant Confirmation",
    headline: "Book in under a minute",
    sub: "Secure your seat, pay, and get a confirmed ticket before you blink.",
    bg: "bg-white border border-border",
    text: "text-foreground",
    sub2: "text-muted-foreground",
    icon: CheckCircle,
  },
];

const POPULAR_ROUTES = [
  { from: "Chennai", to: "Bangalore", hrs: "6 hrs", price: "From ₹350", color: "bg-gradient-to-br from-blue-500 to-indigo-600" },
  { from: "Bangalore", to: "Coimbatore", hrs: "5 hrs", price: "From ₹280", color: "bg-gradient-to-br from-purple-500 to-violet-600" },
  { from: "Chennai", to: "Madurai", hrs: "8 hrs", price: "From ₹420", color: "bg-gradient-to-br from-orange-400 to-rose-500" },
  { from: "Hyderabad", to: "Bangalore", hrs: "10 hrs", price: "From ₹550", color: "bg-gradient-to-br from-teal-500 to-emerald-600" },
  { from: "Trichy", to: "Coimbatore", hrs: "3 hrs", price: "From ₹180", color: "bg-gradient-to-br from-amber-400 to-orange-500" },
  { from: "Madurai", to: "Chennai", hrs: "8 hrs", price: "From ₹380", color: "bg-gradient-to-br from-cyan-500 to-blue-500" },
];

const HOW_IT_WORKS = [
  { n: "01", title: "Search Buses", desc: "Enter your route and date. Browse live buses from 50+ operators.", icon: Search, accent: "text-blue-500", ring: "ring-blue-100 dark:ring-blue-900/40", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { n: "02", title: "Book Your Seat", desc: "Choose your seat, pay securely via Razorpay, get an instant ticket.", icon: CheckCircle, accent: "text-action", ring: "ring-green-100 dark:ring-green-900/40", bg: "bg-green-50 dark:bg-green-950/30" },
  { n: "03", title: "Earn Rewards", desc: "Loyalty points added automatically. Climb tiers and save more every trip.", icon: Award, accent: "text-amber-500", ring: "ring-amber-100 dark:ring-amber-900/40", bg: "bg-amber-50 dark:bg-amber-950/30" },
];

const LEVELS = [
  { n: 1, name: "Welcome", range: "Trips 1–4", desc: "Operators reward you from the very first ride.", grad: "from-slate-400 to-slate-500" },
  { n: 2, name: "Stay", range: "Trips 5–8", desc: "Better offers and group bonuses start here.", grad: "from-blue-400 to-blue-600" },
  { n: 3, name: "Loyalty", range: "Trips 9–12", desc: "Flat rewards and priority perks unlock.", grad: "from-violet-400 to-purple-600" },
  { n: 4, name: "Champion", range: "Trips 13+", desc: "Top-tier deals. Progress never resets.", grad: "from-amber-400 to-orange-500" },
];

const TESTIMONIALS = [
  {
    name: "Priya Nair",
    role: "Frequent Traveler, Chennai",
    init: "PN",
    avatar: "bg-gradient-to-br from-purple-500 to-indigo-600",
    quote: "I travel Chennai–Bangalore every month. My operator's L3 reward saves me over ₹400 a trip. It adds up to thousands a year without any extra effort.",
    stars: 5,
  },
  {
    name: "Karthik Sundaram",
    role: "Business Traveler, Bangalore",
    init: "KS",
    avatar: "bg-gradient-to-br from-blue-500 to-cyan-600",
    quote: "Booking is instant, the seat I pick is always mine, and hitting Champion level genuinely changed how much I pay every single trip.",
    stars: 5,
  },
  {
    name: "Ananya Krishnan",
    role: "College Student, Coimbatore",
    init: "AK",
    avatar: "bg-gradient-to-br from-emerald-500 to-teal-600",
    quote: "Group bonuses are real. My operator gives ₹60 per extra person — four of us travelling home on weekends is so much cheaper now.",
    stars: 5,
  },
];

export function LandingPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  function swap() {
    setFrom(to);
    setTo(from);
  }

  const searchHref = `/search?${new URLSearchParams({
    ...(from ? { origin: from } : {}),
    ...(to ? { destination: to } : {}),
    ...(date ? { date } : {}),
  }).toString()}`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader dashboardHref={null} />

      {/* ─── HERO ─── */}
      <section className="bg-gradient-to-b from-slate-50 to-white pt-16 dark:from-slate-900/50 dark:to-background">
        <div className="container py-14">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left copy */}
            <div>
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary"
              >
                50+ operators · 200+ routes across India
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 text-5xl font-black leading-[1.05] tracking-tight text-foreground md:text-6xl xl:text-7xl"
              >
                Book your bus,
                <br />
                <span className="text-primary">earn every ride.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
                className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground"
              >
                Search buses from 50+ operators, book in seconds, and earn
                operator-exclusive loyalty rewards that grow with every trip you
                take.
              </motion.p>

              {/* Mini stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="mt-8 flex gap-8"
              >
                {[
                  { v: "10,000+", l: "Happy riders" },
                  { v: "4.8 / 5", l: "Avg rating" },
                  { v: "Free", l: "To join" },
                ].map((s) => (
                  <div key={s.l}>
                    <p className="text-2xl font-black text-foreground">{s.v}</p>
                    <p className="text-xs font-medium text-muted-foreground">{s.l}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — bus illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <BusIllustration className="w-full drop-shadow-xl" />
            </motion.div>
          </div>
        </div>

        {/* Search bar — spans full width below the split */}
        <div className="container pb-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-border bg-white p-3 shadow-xl shadow-primary/5 dark:bg-card"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
              {/* From */}
              <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 transition-colors hover:bg-muted/50">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <span className="flex flex-col text-left">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">From</span>
                  <input
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="Chennai"
                    className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/50"
                  />
                </span>
              </label>

              {/* Divider */}
              <div className="hidden self-stretch w-px bg-border md:block" />

              {/* Swap */}
              <button
                type="button"
                onClick={swap}
                aria-label="Swap origin and destination"
                className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full border border-border bg-background text-primary shadow-sm transition-transform hover:scale-110 active:scale-95"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>

              <div className="hidden self-stretch w-px bg-border md:block" />

              {/* To */}
              <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 transition-colors hover:bg-muted/50">
                <MapPin className="h-5 w-5 shrink-0 text-action" />
                <span className="flex flex-col text-left">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">To</span>
                  <input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Bangalore"
                    className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/50"
                  />
                </span>
              </label>

              <div className="hidden self-stretch w-px bg-border md:block" />

              {/* Date */}
              <label className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 transition-colors hover:bg-muted/50 md:max-w-[200px]">
                <Calendar className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="flex flex-col text-left">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-foreground outline-none"
                  />
                </span>
              </label>

              <Button
                variant="action"
                size="lg"
                className="h-auto shrink-0 rounded-xl px-8 py-4 text-base font-bold shadow-md shadow-action/20 transition-all hover:shadow-action/30 active:scale-[0.98]"
                asChild
              >
                <Link href={searchHref}>
                  <Search className="h-4 w-4" />
                  Search Buses
                </Link>
              </Button>
            </div>

            {/* Popular cities */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2 px-2 pb-1 pt-1">
              <span className="text-xs font-medium text-muted-foreground">Popular:</span>
              {POPULAR_CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => (from ? setTo(city) : setFrom(city))}
                  className="rounded-full border border-border px-3 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {city}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── DEALS STRIP ─── */}
      <section className="bg-slate-50 py-16 dark:bg-muted/20">
        <div className="container">
          <FadeUp className="mb-8 flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-action">Perks</span>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-foreground">
                What you get with urRoute
              </h2>
            </div>
          </FadeUp>

          <div className="grid gap-5 md:grid-cols-3">
            {DEALS.map((d, i) => (
              <FadeUp key={d.label} delay={i * 0.1}>
                <div className={cn("relative overflow-hidden rounded-2xl p-7", d.bg)}>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                    <d.icon className={cn("h-6 w-6", d.text)} />
                  </div>
                  <p className={cn("text-xs font-bold uppercase tracking-wider", d.sub2)}>
                    {d.label}
                  </p>
                  <h3 className={cn("mt-1 text-xl font-black", d.text)}>{d.headline}</h3>
                  <p className={cn("mt-2 text-sm leading-relaxed", d.sub2)}>{d.sub}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── POPULAR ROUTES ─── */}
      <section id="routes" className="scroll-mt-20 bg-white py-20 dark:bg-background">
        <div className="container">
          <FadeUp className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-action">Routes</span>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-foreground md:text-5xl">
              Popular routes
            </h2>
            <p className="mt-3 text-muted-foreground">
              Hundreds of buses, dozens of operators, one platform.
            </p>
          </FadeUp>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_ROUTES.map((r, i) => (
              <FadeUp key={`${r.from}-${r.to}`} delay={i * 0.07}>
                <Link
                  href={`/search?from=${r.from}&to=${r.to}`}
                  className="group block overflow-hidden rounded-2xl border border-border transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5"
                >
                  {/* Color band */}
                  <div className={cn("relative flex h-32 items-end p-5", r.color)}>
                    {/* Route overlay */}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                        {r.hrs}
                      </p>
                      <p className="text-xl font-black text-white leading-tight">
                        {r.from}
                        <span className="mx-2 font-light opacity-60">→</span>
                        {r.to}
                      </p>
                    </div>
                    {/* Clock */}
                    <Clock className="absolute right-5 top-5 h-5 w-5 text-white/40" />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between bg-card px-5 py-4">
                    <span className="text-sm font-bold text-foreground">{r.price}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-all group-hover:gap-2">
                      View buses <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-slate-50 py-20 dark:bg-muted/20">
        <div className="container">
          <FadeUp className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-action">Simple</span>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-foreground md:text-5xl">
              Three steps to your seat
            </h2>
          </FadeUp>

          <div className="relative grid gap-10 md:grid-cols-3 md:gap-6">
            {/* Connector line */}
            <div className="pointer-events-none absolute top-10 left-[17%] right-[17%] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

            {HOW_IT_WORKS.map((s, i) => (
              <FadeUp key={s.title} delay={i * 0.15}>
                <div className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl ring-8",
                      s.bg,
                      s.ring
                    )}
                  >
                    <s.icon className={cn("h-9 w-9", s.accent)} />
                    <span className="absolute -right-2.5 -top-2.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-foreground text-[11px] font-black text-background shadow">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-7 text-xl font-bold text-foreground">{s.title}</h3>
                  <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LOYALTY PROGRAM ─── */}
      <section id="loyalty" className="scroll-mt-20 bg-primary py-20">
        <div className="container">
          <FadeUp className="mx-auto max-w-xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">
              Loyalty Program
            </span>
            <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
              Four tiers.
              <br />
              Your operator sets the rewards.
            </h2>
            <p className="mt-5 text-white/60">
              Every operator on urRoute defines their own exclusive discounts for
              each tier. Progress never resets — it freezes when you pause and
              resumes when you return.
            </p>
          </FadeUp>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LEVELS.map((lvl, i) => (
              <FadeUp key={lvl.name} delay={i * 0.1}>
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-6 backdrop-blur-sm">
                  <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", lvl.grad)} />
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black text-white bg-gradient-to-br shadow-lg",
                        lvl.grad
                      )}
                    >
                      {lvl.n}
                    </div>
                    <div>
                      <p className="font-bold text-white">{lvl.name}</p>
                      <p className="text-xs text-white/50">{lvl.range}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/55">{lvl.desc}</p>
                  <div className="mt-4 rounded-lg border border-white/8 bg-white/5 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Reward</p>
                    <p className="mt-0.5 text-sm font-bold text-white/70">Set by your operator</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.45} className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/55">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-action" />
              Operators set their own discount %, flat rewards, and group bonuses per tier — your perks are exclusive to each operator you book with.
            </div>
          </FadeUp>

          <FadeUp delay={0.5} className="mt-6 text-center">
            <Button size="lg" className="bg-white px-8 font-bold text-primary hover:bg-white/92" asChild>
              <Link href="/register">
                Start earning <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </FadeUp>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="bg-white py-20 dark:bg-background">
        <div className="container">
          <FadeUp className="mx-auto mb-12 max-w-xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-action">Reviews</span>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-foreground md:text-5xl">
              Real riders, real savings
            </h2>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.12}>
                <div className="flex flex-col rounded-2xl border border-border bg-card p-8 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5">
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="flex-1 text-[15px] leading-relaxed text-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                    <span className={cn("flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white", t.avatar)}>
                      {t.init}
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

      {/* ─── DUAL CTA ─── */}
      <section className="border-y border-border bg-slate-50 py-16 dark:bg-muted/20">
        <div className="container grid gap-6 md:grid-cols-2">
          <FadeUp>
            <div className="flex flex-col rounded-2xl bg-primary p-10 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                <Gift className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white">Ready to save?</h3>
              <p className="mt-3 text-primary-foreground/65">
                Join thousands of travelers earning operator rewards on every route across India.
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

          <FadeUp delay={0.1}>
            <div className="flex flex-col rounded-2xl border-2 border-action/30 bg-action/5 p-10 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-action/10">
                <TrendingUp className="h-7 w-7 text-action" />
              </div>
              <h3 className="text-2xl font-black text-foreground">Running a fleet?</h3>
              <p className="mt-3 text-muted-foreground">
                Set your own loyalty rewards per tier, manage bookings, and grow passenger retention — all from one dashboard.
              </p>
              <Button variant="action" size="lg" className="mt-7 w-full font-bold" asChild>
                <Link href="/register/operator">
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
