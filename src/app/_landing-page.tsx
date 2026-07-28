"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  ArrowRight, ArrowLeftRight, MapPin, Calendar, Search,
  Gift, ShieldCheck, Users, Star, TrendingUp,
  CheckCircle, Award, Zap, Clock, Bus, Headphones, CreditCard,
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPR = { type: "spring" as const, stiffness: 280, damping: 26 };

// ── Cursor glow that follows mouse ───────────────────────────────────────────
function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function move(e: MouseEvent) {
      if (!ref.current) return;
      ref.current.style.background = `radial-gradient(700px at ${e.clientX}px ${e.clientY}px, rgba(27,45,120,0.07), transparent 80%)`;
    }
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return <div ref={ref} className="pointer-events-none fixed inset-0 z-[1] hidden lg:block" />;
}

// ── Count-up number animation ─────────────────────────────────────────────────
function CountUp({ to, suffix = "", prefix = "", className }: { to: number; suffix?: string; prefix?: string; className?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const t0 = Date.now();
    const dur = 1800;
    function tick() {
      const p = Math.min((Date.now() - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(e * to));
      if (p < 1) requestAnimationFrame(tick);
      else setVal(to);
    }
    requestAnimationFrame(tick);
  }, [inView, to]);
  return <span ref={ref} className={className}>{prefix}{val.toLocaleString("en-IN")}{suffix}</span>;
}

// ── Word-reveal ───────────────────────────────────────────────────────────────
function WordReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={cn("inline", className)}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden leading-[1.15] mr-[0.28em] last:mr-0">
          <motion.span className="inline-block"
            initial={{ y: "105%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ ...SPR, delay: delay + i * 0.042 }}>
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ── Scroll reveal ─────────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: EASE }}>
      {children}
    </motion.div>
  );
}

// ── Stagger card ──────────────────────────────────────────────────────────────
function StaggerCard({ children, index, className }: { children: React.ReactNode; index: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const offs = [{ y: 50, x: -8 }, { y: 36, x: 0 }, { y: 50, x: 8 }, { y: 64, x: 0 }];
  const off = offs[index % 4]!;
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: off.y, x: off.x }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.44, delay: index * 0.05, ease: EASE }}>
      {children}
    </motion.div>
  );
}

// ── Feature panel visuals ─────────────────────────────────────────────────────
function VisualOperators() {
  const ops = [
    { name: "VRL Travels", routes: 24, c: "bg-blue-600" },
    { name: "SRS Travels", routes: 18, c: "bg-violet-600" },
    { name: "KPN Travels", routes: 31, c: "bg-amber-500" },
    { name: "Orange Tours", routes: 12, c: "bg-orange-500" },
    { name: "TNSTC", routes: 45, c: "bg-emerald-600" },
    { name: "Parveen Travels", routes: 16, c: "bg-pink-600" },
  ];
  return (
    <div className="h-full flex flex-col p-7 gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Operator network</p>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
          <motion.span className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          50+ live
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 flex-1">
        {ops.map((op, i) => (
          <motion.div key={op.name}
            initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07, duration: 0.28 }}
            className="flex items-center gap-2.5 rounded-xl bg-white/[0.06] border border-white/[0.07] px-3 py-2.5">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0", op.c)}>
              {op.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white/70 truncate">{op.name}</p>
              <p className="text-[10px] text-white/25">{op.routes} routes</p>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="rounded-xl bg-blue-500/10 border border-blue-500/15 px-4 py-2.5 text-center">
        <span className="text-sm font-black text-blue-300">200+ routes across South India</span>
      </div>
    </div>
  );
}

function VisualLoyalty() {
  const tiers = [
    { n: 1, name: "Welcome", c: "bg-slate-500", w: "100%" },
    { n: 2, name: "Stay", c: "bg-primary", w: "60%" },
    { n: 3, name: "Loyalty", c: "bg-violet-500", w: "0%" },
    { n: 4, name: "Champion", c: "bg-amber-500", w: "0%" },
  ];
  return (
    <div className="h-full flex flex-col p-7 gap-5">
      <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Your progression</p>
      <div className="flex-1 space-y-5">
        {tiers.map((t, i) => (
          <motion.div key={t.name} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black text-white", t.c)}>{t.n}</div>
                <span className="text-sm font-bold text-white/70">{t.name}</span>
              </div>
              <span className="text-[10px] font-bold text-white/30">
                {i === 0 ? "Completed ✓" : i === 1 ? "In progress" : "Locked"}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
              <motion.div className={cn("h-full rounded-full", t.c)}
                initial={{ width: "0%" }} animate={{ width: t.w }}
                transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: EASE }} />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="rounded-xl bg-primary/20 border border-primary/25 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Current reward</p>
        <p className="text-2xl font-black text-white">₹84 off next booking</p>
      </div>
    </div>
  );
}

function VisualGroup() {
  const calc = [
    { label: "Your tier discount", value: "10%", c: "text-blue-300" },
    { label: "Group bonus ×4 travelers", value: "+₹240", c: "text-violet-300" },
    { label: "Total saving", value: "₹564", c: "text-emerald-300", big: true },
  ];
  return (
    <div className="h-full flex flex-col p-7 gap-5">
      <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Group bonus</p>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((n) => (
          <motion.div key={n} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (n - 1) * 0.12, type: "spring", stiffness: 400 }}
            className="w-11 h-11 rounded-full bg-violet-500/20 border-2 border-violet-500/40 flex items-center justify-center text-violet-300 text-sm font-black">
            {n}
          </motion.div>
        ))}
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="ml-2 text-xs text-white/30 font-bold">travelers</motion.span>
      </div>
      <div className="flex-1 space-y-2.5">
        {calc.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.12, duration: 0.3 }}
            className={cn("flex items-center justify-between rounded-xl px-4 py-3",
              item.big ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-white/[0.05]")}>
            <span className="text-sm text-white/55">{item.label}</span>
            <span className={cn("font-black", item.big ? "text-2xl" : "text-sm", item.c)}>{item.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function VisualInstant() {
  const steps = ["Seat selected", "Payment verified", "Ticket generated", "Email delivered"];
  return (
    <div className="h-full flex flex-col p-7 gap-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Booking in progress</p>
        <motion.span className="text-sm font-black text-amber-400 tabular-nums"
          animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>0:42</motion.span>
      </div>
      <div className="flex-1 space-y-2.5">
        {steps.map((step, i) => (
          <motion.div key={step} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.28, duration: 0.3 }}
            className="flex items-center gap-3 rounded-xl bg-white/[0.05] border border-white/[0.06] px-4 py-3.5">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: i * 0.28 + 0.18, type: "spring", stiffness: 400 }}
              className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle className="h-3 w-3 text-white" />
            </motion.div>
            <span className="text-sm font-semibold text-white/70">{step}</span>
          </motion.div>
        ))}
      </div>
      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/15 px-4 py-3 text-center">
        <p className="text-[10px] text-emerald-400/60 font-bold uppercase tracking-widest">Total time</p>
        <p className="text-3xl font-black text-emerald-400">42 seconds</p>
      </div>
    </div>
  );
}

function VisualSupport() {
  const msgs = [
    { from: "user", text: "My seat shows unavailable but I booked it." },
    { from: "agent", text: "On it! Checking now..." },
    { from: "agent", text: "Found it — seat is confirmed. Refreshing your ticket." },
    { from: "user", text: "Thank you, that was fast!" },
  ];
  return (
    <div className="h-full flex flex-col p-6 gap-3">
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/8">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-black text-white shrink-0">M</div>
        <div>
          <p className="text-sm font-bold text-white">Agent Maya</p>
          <div className="flex items-center gap-1">
            <motion.span className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="text-[10px] text-emerald-400 font-bold">Online now</span>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-2.5 overflow-hidden">
        {msgs.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.38, duration: 0.3 }}
            className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("rounded-2xl px-4 py-2 text-xs max-w-[82%]",
              m.from === "user"
                ? "bg-primary text-white rounded-br-sm"
                : "bg-white/8 text-white/70 rounded-bl-sm border border-white/8")}>
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/8 px-3 py-2">
        <span className="text-xs text-white/20 flex-1">Type a message…</span>
        <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <ArrowRight className="h-3 w-3 text-white" />
        </div>
      </div>
    </div>
  );
}

function VisualSecurity() {
  const checks = ["Operator verification", "SSL/TLS encryption", "PCI-DSS compliance", "100% refund policy"];
  return (
    <div className="h-full flex flex-col items-center justify-center p-7 gap-6">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }} className="relative">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500/25 flex items-center justify-center">
          <ShieldCheck className="h-10 w-10 text-emerald-400" />
        </div>
        <motion.div className="absolute -inset-3 rounded-3xl border-2 border-emerald-400/10"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
      </motion.div>
      <div className="w-full space-y-2">
        {checks.map((c, i) => (
          <motion.div key={c} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28 + i * 0.09, duration: 0.28 }}
            className="flex items-center gap-3 rounded-xl bg-white/[0.05] px-4 py-2.5">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.35 + i * 0.09, type: "spring" }}
              className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle className="h-2.5 w-2.5 text-white" />
            </motion.div>
            <span className="text-sm text-white/60">{c}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Interactive features panel ────────────────────────────────────────────────
const FEAT_LIST = [
  { id: "ops",     icon: Bus,        color: "text-blue-400",    title: "50+ Bus Operators",  desc: "Every major operator across South India. Live seat availability and real-time updates.", Visual: VisualOperators },
  { id: "loyal",   icon: Gift,       color: "text-emerald-400", title: "Loyalty Rewards",     desc: "Each operator sets exclusive discounts per tier. Earn from your very first trip.", Visual: VisualLoyalty },
  { id: "group",   icon: Users,      color: "text-violet-400",  title: "Group Bonuses",       desc: "Travel together and stack per-head bonuses on top of your loyalty tier discount.", Visual: VisualGroup },
  { id: "instant", icon: CreditCard, color: "text-amber-400",   title: "Instant Booking",     desc: "Confirm your seat, pay securely, and receive your e-ticket in under 60 seconds.", Visual: VisualInstant },
  { id: "support", icon: Headphones, color: "text-sky-400",     title: "24/7 Support",        desc: "Dedicated agent support for any ticket issue, refund, or booking change.", Visual: VisualSupport },
  { id: "secure",  icon: ShieldCheck,color: "text-emerald-400", title: "Verified & Secure",   desc: "Every operator is verified. Every payment is encrypted end-to-end.", Visual: VisualSecurity },
];

function FeaturesPanel() {
  const [active, setActive] = useState(0);
  const ActiveVisual = FEAT_LIST[active]!.Visual;
  return (
    <div className="grid lg:grid-cols-[1fr_1.15fr] gap-6 lg:gap-10 items-start">
      {/* Left list */}
      <div className="space-y-1">
        {FEAT_LIST.map((f, i) => {
          const on = active === i;
          return (
            <motion.button key={f.id} onClick={() => setActive(i)} whileTap={{ scale: 0.98 }}
              className={cn("w-full text-left rounded-2xl px-5 py-4 transition-all duration-200",
                on ? "bg-foreground dark:bg-white text-background shadow-lg shadow-black/10" : "hover:bg-muted/60")}>
              <div className="flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                  on ? "bg-white/15" : "bg-muted")}>
                  <f.icon className={cn("h-4 w-4", on ? "text-background dark:text-foreground" : f.color)} />
                </div>
                <span className={cn("font-bold text-sm", on ? "text-background dark:text-foreground" : "text-foreground")}>
                  {f.title}
                </span>
                {on && <ArrowRight className="h-3.5 w-3.5 ml-auto text-background/40 dark:text-foreground/40" />}
              </div>
              <AnimatePresence>
                {on && (
                  <motion.p
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="text-xs pl-11 overflow-hidden text-background/55 dark:text-foreground/55 leading-relaxed">
                    {f.desc}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      {/* Right visual */}
      <div className="sticky top-24 rounded-3xl bg-[#080E1F] h-[420px] overflow-hidden border border-white/[0.05] shadow-2xl shadow-black/40">
        <AnimatePresence mode="wait">
          <motion.div key={active} className="h-full"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.22, ease: EASE }}>
            <ActiveVisual />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Hero bus photo ────────────────────────────────────────────────────────────
function HeroBusPhoto() {
  return (
    <div className="relative h-[400px] sm:h-[460px] lg:h-[520px] flex items-center justify-center select-none overflow-visible">
      <div className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, rgba(27,45,120,0.10) 1.5px, transparent 1.5px)", backgroundSize: "22px 22px" }} />
      <div className="absolute inset-0 rounded-3xl pointer-events-none bg-gradient-to-br from-blue-50/80 via-white/20 to-emerald-50/50" />
      <div className="absolute top-4 right-8 w-24 h-24 rounded-full border border-primary/10 pointer-events-none" />
      <div className="absolute top-9 right-14 w-12 h-12 rounded-full border border-action/10 pointer-events-none" />

      <motion.div initial={{ opacity: 0, x: 70, scale: 0.86 }} animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 22, delay: 0.1 }}
        className="relative z-10 w-full px-4 lg:px-0">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }} className="relative">
          <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=900&q=88&auto=format&fit=crop"
            alt="Luxury coach bus" loading="eager"
            className="w-full max-w-[500px] lg:max-w-[560px] mx-auto h-auto object-cover rounded-2xl"
            style={{ filter: "drop-shadow(0 20px 52px rgba(27,45,120,0.22)) drop-shadow(0 4px 16px rgba(0,0,0,0.12))" }} />
          <motion.div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2/3 h-3 bg-primary/10 rounded-full blur-2xl pointer-events-none"
            animate={{ scaleX: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }} />
        </motion.div>
      </motion.div>

      {/* Badge: live */}
      <div className="absolute top-6 left-0 lg:-left-4 z-20">
        <motion.div initial={{ opacity: 0, x: -36, scale: 0.82 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ ...SPR, delay: 0.52 }}>
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="bg-white rounded-2xl shadow-xl shadow-black/8 px-4 py-3.5 flex items-center gap-3 border border-slate-100">
            <motion.div className="w-3 h-3 rounded-full bg-emerald-400 shrink-0"
              animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
            <div>
              <p className="text-sm font-black text-foreground">12 buses live</p>
              <p className="text-[11px] text-muted-foreground">on this route now</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Badge: price */}
      <div className="absolute bottom-8 right-0 lg:-right-4 z-20">
        <motion.div initial={{ opacity: 0, y: 32, scale: 0.82 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...SPR, delay: 0.72 }}>
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
            className="bg-white rounded-2xl shadow-xl shadow-black/8 px-5 py-4 border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Starting from</p>
            <p className="text-[28px] font-black text-primary leading-none mt-0.5">₹350</p>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-action inline-block" /> Sleeper AC · WiFi
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Badge: loyalty */}
      <div className="absolute top-6 right-4 lg:right-0 z-20">
        <motion.div initial={{ opacity: 0, y: -28, scale: 0.82 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...SPR, delay: 0.92 }}>
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
            className="rounded-2xl bg-gradient-to-br from-primary to-blue-700 shadow-xl shadow-primary/30 px-4 py-3.5 text-white min-w-[120px]">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <p className="text-[10px] font-bold opacity-65 uppercase tracking-widest">Loyalty L2</p>
            </div>
            <p className="text-xl font-black leading-none">₹84 saved</p>
            <p className="text-[10px] opacity-55 mt-1">this booking</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Marquee ───────────────────────────────────────────────────────────────────
const OPS = ["VRL Travels","SRS Travels","Orange Tours","TNSTC","KPN Travels","Parveen Travels","Green Line","Kallada Travels","National Travels","RedBus Express"];
function LogoMarquee() {
  const all = [...OPS, ...OPS];
  return (
    <div className="relative overflow-hidden py-5 border-y border-border">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-white dark:from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-white dark:from-background to-transparent" />
      <motion.div className="flex gap-8 w-max" animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}>
        {all.map((n, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0 px-5 py-2 rounded-full border border-border/70 text-xs font-semibold text-muted-foreground whitespace-nowrap bg-white dark:bg-card">
            <Bus className="h-3 w-3 opacity-50" /> {n}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ── Route card ────────────────────────────────────────────────────────────────
function RouteCard({ r, i }: { r: { from: string; to: string; hrs: string; price: string }; i: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.38, delay: i * 0.05, ease: EASE }}>
      <Link href={`/search?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}`}
        className="group flex flex-col rounded-2xl border border-border bg-white dark:bg-card overflow-hidden hover:-translate-y-2 hover:shadow-xl hover:shadow-black/6 hover:border-primary/20 transition-all duration-200">
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2 mb-4">
            <div>
              <p className="text-base font-black text-foreground">{r.from}</p>
              <p className="text-[10px] text-muted-foreground">Origin</p>
            </div>
            <div className="flex-1 flex items-center gap-1.5 px-2">
              <div className="w-2 h-2 rounded-full border-2 border-primary shrink-0" />
              <div className="flex-1 h-px bg-border relative overflow-hidden">
                <motion.div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
                  animate={{ x: ["-100%", "300%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: i * 0.35 }} />
              </div>
              <div className="w-2 h-2 rounded-full border-2 border-action shrink-0" />
            </div>
            <div className="text-right">
              <p className="text-base font-black text-foreground">{r.to}</p>
              <p className="text-[10px] text-muted-foreground">Destination</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="font-semibold">{r.hrs}</span>
            <span className="text-border/60">·</span>
            <span>Multiple operators</span>
          </div>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-[#FAFAFA] dark:bg-muted/30">
          <span className="text-base font-black text-foreground">{r.price}</span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:gap-2 transition-all duration-150">
            Book now <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const ROUTES = [
  { from: "Chennai",    to: "Bengaluru",   hrs: "6 hrs",    price: "From ₹850" },
  { from: "Bengaluru",  to: "Hyderabad",   hrs: "10 hrs",   price: "From ₹950" },
  { from: "Chennai",    to: "Madurai",     hrs: "8 hrs",    price: "From ₹700" },
  { from: "Chennai",    to: "Pondicherry", hrs: "3 hrs",    price: "From ₹250" },
  { from: "Hyderabad",  to: "Chennai",     hrs: "11 hrs",   price: "From ₹900" },
  { from: "Coimbatore", to: "Bengaluru",   hrs: "6.5 hrs",  price: "From ₹650" },
  { from: "Chennai",    to: "Trichy",      hrs: "6 hrs",    price: "From ₹550" },
  { from: "Bengaluru",  to: "Mangaluru",   hrs: "7 hrs",    price: "From ₹700" },
  { from: "Bengaluru",  to: "Mumbai",      hrs: "16 hrs",   price: "From ₹1400" },
  { from: "Hyderabad",  to: "Vijayawada",  hrs: "5 hrs",    price: "From ₹450" },
  { from: "Madurai",    to: "Chennai",     hrs: "8 hrs",    price: "From ₹700" },
  { from: "Bengaluru",  to: "Coimbatore",  hrs: "6.5 hrs",  price: "From ₹650" },
];
const ROUTE_FILTERS = ["All Routes", "Short (< 4 hrs)", "Night Buses", "Premium", "Budget"];
const STEPS = [
  { n: "01", title: "Search your route",  desc: "Enter origin, destination, and date. Browse live buses from 50+ operators instantly.", icon: Search },
  { n: "02", title: "Pick your seat",     desc: "See the interactive seat map, choose your spot, and lock it in before anyone else.", icon: CheckCircle },
  { n: "03", title: "Earn every ride",    desc: "Loyalty points auto-added. Climb tiers and unlock bigger savings with each operator.", icon: Award },
];
const LEVELS = [
  { n: 1, name: "Welcome",  range: "Trips 1–4",  desc: "Operators reward you from the very first ride.",  c: "bg-slate-500",  glow: "shadow-slate-500/20" },
  { n: 2, name: "Stay",     range: "Trips 5–8",  desc: "Better offers and group bonuses start here.",     c: "bg-primary",    glow: "shadow-primary/30" },
  { n: 3, name: "Loyalty",  range: "Trips 9–12", desc: "Flat rewards and priority perks unlock.",          c: "bg-violet-500", glow: "shadow-violet-500/20" },
  { n: 4, name: "Champion", range: "Trips 13+",  desc: "Top-tier deals. Progress never resets.",           c: "bg-amber-500",  glow: "shadow-amber-500/20" },
];
const TESTIMONIALS = [
  { name: "Priya Nair",       role: "Chennai",   init: "PN", quote: "I travel Chennai–Bangalore every month. My operator's L3 reward saves me over ₹400 a trip — thousands a year.", stars: 5 },
  { name: "Karthik Sundaram", role: "Bangalore", init: "KS", quote: "Booking is instant, my seat is always mine, and hitting Champion level genuinely changed how much I pay every trip.", stars: 5 },
  { name: "Ananya Krishnan",  role: "Coimbatore",init: "AK", quote: "Group bonuses are real. My operator gives ₹60 per extra person — four of us travelling home on weekends is so much cheaper.", stars: 5 },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export function LandingPage() {
  const [from, setFrom] = useState("");
  const [to, setTo]     = useState("");
  const [date, setDate] = useState("");
  const [filter, setFilter] = useState("All Routes");
  function swap() { setFrom(to); setTo(from); }

  const searchHref = `/search?${new URLSearchParams({
    ...(from ? { origin: from } : {}),
    ...(to   ? { destination: to } : {}),
    ...(date ? { date } : {}),
  })}`;

  const visibleRoutes = filter === "All Routes" ? ROUTES : ROUTES.slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-background overflow-x-hidden">
      <CursorGlow />
      <SiteHeader dashboardHref={null} />

      {/* ─── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="pt-16">
        <div className="container pt-12 pb-0 lg:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-6 xl:gap-14">
            <div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE }} className="inline-flex items-center gap-2 mb-6">
                <span className="w-5 h-px bg-primary" />
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">The smarter way to travel India</p>
              </motion.div>

              <h1 className="text-5xl font-black leading-[1.04] tracking-tight text-foreground md:text-6xl xl:text-[68px] mb-6">
                <WordReveal text="Book your bus," delay={0.08} />
                <br />
                <span className="text-primary"><WordReveal text="earn every ride." delay={0.26} /></span>
              </h1>

              <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.58, ease: EASE }}
                className="max-w-md text-lg leading-relaxed text-muted-foreground mb-8">
                Search buses from 50+ operators, book in seconds, and earn
                operator-exclusive loyalty rewards that grow with every trip.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, delay: 0.7, ease: EASE }}
                className="flex flex-wrap items-center gap-3 mb-10">
                <Link href="/register">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button size="lg" className="relative overflow-hidden rounded-full px-8 font-bold h-12 gap-2 shadow-lg shadow-primary/25">
                      <motion.span className="absolute inset-0 -skew-x-12 bg-white/20 pointer-events-none"
                        animate={{ x: ["-160%", "260%"] }}
                        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }} />
                      Get started free <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/#features">
                  <Button variant="ghost" size="lg" className="rounded-full px-6 h-12 text-muted-foreground hover:text-foreground">
                    How it works
                  </Button>
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.84 }}
                className="flex gap-8 sm:gap-10 border-t border-border pt-7">
                {[{ v: "50+", l: "Bus operators" }, { v: "200+", l: "Routes" }, { v: "4 tiers", l: "Loyalty rewards" }].map((s, i) => (
                  <motion.div key={s.l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: 0.88 + i * 0.07, ease: EASE }}>
                    <p className="text-2xl font-black text-foreground">{s.v}</p>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">{s.l}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <HeroBusPhoto />
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-8 border-t border-border bg-white dark:bg-card">
          <div className="container py-4">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.36, ease: EASE }}
              className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="flex flex-1 items-center gap-3 rounded-xl border border-border px-4 py-3 hover:border-primary/40 focus-within:border-primary/60 transition-colors">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="flex flex-col flex-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">From</span>
                  <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Chennai"
                    className="bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/50 w-full" />
                </span>
              </label>
              <button type="button" onClick={swap}
                className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-white dark:bg-background text-primary shadow-sm hover:scale-110 active:scale-95 transition-transform">
                <ArrowLeftRight className="h-4 w-4" />
              </button>
              <label className="flex flex-1 items-center gap-3 rounded-xl border border-border px-4 py-3 hover:border-primary/40 focus-within:border-primary/60 transition-colors">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex flex-col flex-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">To</span>
                  <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Bangalore"
                    className="bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/50 w-full" />
                </span>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 hover:border-primary/40 focus-within:border-primary/60 transition-colors min-w-[160px]">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Date</span>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-foreground outline-none w-full" />
                </span>
              </label>
              <Link href={searchHref}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="action" size="lg" className="rounded-full px-8 h-12 font-bold gap-2 shrink-0 shadow-lg shadow-action/20">
                    <Search className="h-4 w-4" /> Search
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
        <LogoMarquee />
      </section>

      {/* ─── STATS ────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-border bg-[#F8F9FB] dark:bg-muted/10">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 sm:gap-0 sm:divide-x sm:divide-border text-center">
            {[
              { to: 50000, suffix: "+", label: "Trips booked" },
              { to: 98,    suffix: "%", label: "On-time rate" },
              { to: 50,    suffix: "+", label: "Bus operators" },
              { to: 49,    suffix: "★", prefix: "4.", label: "Average rating" },
            ].map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.06} className="sm:px-10">
                <p className="text-5xl font-black text-foreground tracking-tight tabular-nums">
                  {s.prefix && <span>{s.prefix}</span>}
                  <CountUp to={s.to} suffix={s.suffix} />
                </p>
                <p className="text-sm text-muted-foreground mt-2 font-medium">{s.label}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES — INTERACTIVE PANEL ────────────────────────────────────── */}
      <section id="features" className="scroll-mt-20 py-28 bg-white dark:bg-background">
        <div className="container">
          <FadeUp className="mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Platform features</p>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[0.96] mb-4">
              Everything you need
              <br />
              <span className="text-foreground/20">to travel smarter.</span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <FeaturesPanel />
          </FadeUp>
        </div>
      </section>

      {/* ─── POPULAR ROUTES ───────────────────────────────────────────────────── */}
      <section id="routes" className="scroll-mt-20 py-28 bg-[#F8F9FB] dark:bg-muted/10">
        <div className="container">
          <FadeUp className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Only the best routes</p>
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <h2 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">Popular Routes</h2>
              <p className="text-sm text-muted-foreground">Hundreds of buses. Dozens of operators. One platform.</p>
            </div>
          </FadeUp>
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            {ROUTE_FILTERS.map((f) => (
              <motion.button key={f} onClick={() => setFilter(f)} whileTap={{ scale: 0.95 }}
                className={cn("rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200",
                  filter === f ? "bg-foreground text-background shadow-sm" : "border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground bg-white dark:bg-card")}>
                {f}
              </motion.button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={filter}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: EASE }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleRoutes.map((r, i) => <RouteCard key={`${r.from}-${r.to}`} r={r} i={i} />)}
            </motion.div>
          </AnimatePresence>
          <FadeUp delay={0.2} className="mt-10 text-center">
            <Link href="/search" className="inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors border-b border-foreground/20 hover:border-primary pb-0.5">
              Show all routes <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-28 bg-white dark:bg-background">
        <div className="container">
          <FadeUp className="mb-20">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Simple</p>
            <h2 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">Three steps to your seat</h2>
          </FadeUp>
          <div className="relative">
            <div className="hidden md:block absolute top-[26px] left-[calc(16.67%+26px)] right-[calc(16.67%+26px)] h-px bg-border overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-primary via-action to-primary"
                initial={{ scaleX: 0, originX: "0%" }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3, ease: EASE }} />
            </div>
            <div className="grid gap-12 md:grid-cols-3 md:gap-8">
              {STEPS.map((s, i) => (
                <StaggerCard key={s.title} index={i}>
                  <div className="relative flex flex-col">
                    <div className="relative z-10 w-[52px] h-[52px] rounded-full bg-white dark:bg-card border-2 border-border shadow-sm flex items-center justify-center mb-8">
                      <s.icon className="h-5 w-5 text-primary" />
                      <div className="absolute -top-5 left-full pl-2 text-[88px] font-black text-foreground/[0.05] leading-none select-none pointer-events-none">{s.n}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-white dark:bg-card p-8 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 transition-all duration-200">
                      <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">{s.n}</p>
                      <h3 className="text-xl font-black text-foreground mb-3">{s.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                </StaggerCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── LOYALTY ──────────────────────────────────────────────────────────── */}
      <section id="loyalty" className="scroll-mt-20 py-28 bg-primary relative overflow-hidden">
        <motion.div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/[0.03] pointer-events-none"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/[0.03] pointer-events-none"
          animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }} />
        <div className="container relative">
          <FadeUp className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">Loyalty program</p>
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl max-w-lg leading-tight">
                Four tiers.<br />Your operator sets the rewards.
              </h2>
              <p className="text-white/40 max-w-xs text-sm leading-relaxed">Every operator defines their own discounts per tier. Progress never resets — ever.</p>
            </div>
          </FadeUp>
          <FadeUp delay={0.08} className="mb-10">
            <div className="rounded-2xl bg-white/5 border border-white/10 px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-white/35">Loyalty progression</p>
                <p className="text-xs font-bold text-white/35">Trip 6 of 13 to Champion</p>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white/60 via-blue-300 to-violet-400"
                  initial={{ width: "0%" }} whileInView={{ width: "38%" }} viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.4, ease: EASE }} />
              </div>
              <div className="flex justify-between mt-2.5">
                {LEVELS.map((l) => <span key={l.name} className="text-[10px] font-bold text-white/25">{l.name}</span>)}
              </div>
            </div>
          </FadeUp>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LEVELS.map((lvl, i) => (
              <StaggerCard key={lvl.name} index={i}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 h-full flex flex-col gap-5 hover:bg-white/[0.08] transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white shadow-lg", lvl.c, lvl.glow)}>{lvl.n}</div>
                    <div>
                      <p className="font-bold text-white">{lvl.name}</p>
                      <p className="text-xs text-white/30">{lvl.range}</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/45 leading-relaxed flex-1">{lvl.desc}</p>
                  <div className="rounded-xl border border-white/8 bg-white/5 px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/20">Reward</p>
                    <p className="mt-0.5 text-sm font-bold text-white/45">Set by your operator</p>
                  </div>
                </div>
              </StaggerCard>
            ))}
          </div>
          <FadeUp delay={0.4} className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/40 max-w-lg">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-action" />
              Operators set their own %, flat rewards, and group bonuses per tier — your perks are exclusive to each operator.
            </div>
            <Link href="/register" className="shrink-0">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button size="lg" className="bg-white text-primary hover:bg-white/92 rounded-full px-8 font-bold h-12 shadow-xl shadow-black/20">
                  Start earning <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="py-28 bg-white dark:bg-background">
        <div className="container">
          <FadeUp className="mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">What riders say</p>
            <h2 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">Real riders, real savings</h2>
          </FadeUp>
          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <StaggerCard key={t.name} index={i}>
                <div className={cn("flex flex-col rounded-3xl p-8 h-full",
                  i === 1 ? "bg-[#1B2D78] text-white" : "border border-border bg-white dark:bg-card hover:-translate-y-2 hover:shadow-xl hover:shadow-black/5 transition-all duration-200")}>
                  <div className={cn("text-7xl font-black leading-none mb-3 -mt-2 select-none", i === 1 ? "text-white/12" : "text-primary/10")}>&ldquo;</div>
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className={cn("flex-1 text-[15px] leading-relaxed", i === 1 ? "text-white/75" : "text-foreground")}>{t.quote}</p>
                  <div className={cn("mt-7 flex items-center gap-3 border-t pt-6", i === 1 ? "border-white/10" : "border-border")}>
                    <span className={cn("flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shrink-0",
                      i === 1 ? "bg-white/15 text-white" : "bg-primary text-white")}>{t.init}</span>
                    <div>
                      <p className={cn("text-sm font-bold", i === 1 ? "text-white" : "text-foreground")}>{t.name}</p>
                      <p className={cn("text-xs", i === 1 ? "text-white/40" : "text-muted-foreground")}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </StaggerCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OPERATOR CTA ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#F8F9FB] dark:bg-muted/10">
        <div className="container">
          <FadeUp>
            <div className="rounded-3xl bg-foreground dark:bg-card overflow-hidden">
              <div className="grid lg:grid-cols-2 items-center">
                <div className="p-12 lg:p-16">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/25 mb-4">Running a fleet?</p>
                  <h2 className="text-4xl font-black leading-tight tracking-tight md:text-5xl text-white">Grow your ridership with urRoute</h2>
                  <p className="mt-5 text-white/45 leading-relaxed max-w-md">Set your own loyalty rewards per tier, manage bookings, and grow passenger retention — all from one dashboard.</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/register/operator">
                      <Button size="lg" variant="action" className="rounded-full px-8 font-bold h-12">Register as Operator <ArrowRight className="h-4 w-4" /></Button>
                    </Link>
                    <Link href="/register">
                      <Button size="lg" variant="ghost" className="rounded-full px-6 h-12 font-bold text-white/45 hover:text-white hover:bg-white/10">Sign up as Traveler</Button>
                    </Link>
                  </div>
                </div>
                <div className="border-t border-white/10 lg:border-t-0 lg:border-l p-12 lg:p-16 space-y-7">
                  {[
                    { icon: TrendingUp, title: "Analytics dashboard", desc: "See booking trends, seat occupancy, and revenue in real time." },
                    { icon: Gift,       title: "Custom loyalty tiers", desc: "Define your own % discounts and flat rewards for each level." },
                    { icon: Users,      title: "Passenger management", desc: "View manifests, manage refunds, and handle support in one place." },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center shrink-0 mt-0.5">
                        <item.icon className="h-5 w-5 text-white/50" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{item.title}</p>
                        <p className="text-sm text-white/40 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container">
          <FadeUp>
            <div className="rounded-3xl bg-primary px-12 py-16 lg:px-20 lg:py-20 text-center relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
              <motion.div className="absolute top-0 right-1/4 w-48 h-48 rounded-full bg-white/[0.04] pointer-events-none"
                animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Ready to roll?</p>
                <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl max-w-xl mx-auto">
                  Book your first bus with urRoute today
                </h2>
                <p className="mt-5 text-white/45 max-w-md mx-auto leading-relaxed">
                  Join thousands of travelers earning loyalty rewards on every route across India. Free to join, instant to use.
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/register">
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                      <Button size="lg" className="bg-white text-primary hover:bg-white/92 rounded-full px-10 font-bold h-12 gap-2 shadow-xl shadow-black/20">
                        Sign up free <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/search">
                    <Button size="lg" variant="ghost" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full px-8 h-12">
                      Search buses →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
