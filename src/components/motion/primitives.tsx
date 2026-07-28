"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

// ── Shared easing ────────────────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const;

// ── FadeUp ───────────────────────────────────────────────────────────────────
export function FadeUp({
  children,
  delay = 0,
  duration = 0.5,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── FadeIn ───────────────────────────────────────────────────────────────────
export function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── SlideIn ──────────────────────────────────────────────────────────────────
export function SlideIn({
  children,
  from = "right",
  delay = 0,
  className,
}: {
  children: ReactNode;
  from?: "left" | "right" | "bottom";
  delay?: number;
  className?: string;
}) {
  const x = from === "left" ? -40 : from === "right" ? 40 : 0;
  const y = from === "bottom" ? 40 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.5, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── ScaleIn ──────────────────────────────────────────────────────────────────
export function ScaleIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Stagger container + item ─────────────────────────────────────────────────
const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

export function StaggerList({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const containerWithDelay: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: delay } },
  };
  return (
    <motion.div
      variants={containerWithDelay}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// ── Hover lift card ───────────────────────────────────────────────────────────
export function HoverCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 40px -8px rgba(27,45,120,0.18)" }}
      transition={{ duration: 0.25, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Press button ──────────────────────────────────────────────────────────────
export function PressButton({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

// ── CountUp number ────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";

export function CountUp({
  to,
  duration = 1.2,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * to));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, duration]);

  return (
    <span className={className}>
      {prefix}{val.toLocaleString("en-IN")}{suffix}
    </span>
  );
}

// ── Page transition wrapper ───────────────────────────────────────────────────
export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Pulse ring (for live indicators) ─────────────────────────────────────────
export function PulseRing({ className }: { className?: string }) {
  return (
    <span className={`relative flex h-3 w-3 ${className ?? ""}`}>
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full bg-action/60"
        animate={{ scale: [1, 2], opacity: [0.7, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
      />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-action" />
    </span>
  );
}
