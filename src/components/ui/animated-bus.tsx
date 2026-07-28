"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// ── Spinning wheel ────────────────────────────────────────────────────────────
function Wheel({ cx, cy, r = 14 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#0f172a" />
      <circle cx={cx} cy={cy} r={r * 0.7} fill="#1e293b" />
      <motion.g
        style={{ originX: `${cx}px`, originY: `${cy}px` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      >
        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = cx + Math.cos(rad) * r * 0.25;
          const y1 = cy + Math.sin(rad) * r * 0.25;
          const x2 = cx + Math.cos(rad) * r * 0.62;
          const y2 = cy + Math.sin(rad) * r * 0.62;
          return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />;
        })}
      </motion.g>
      <circle cx={cx} cy={cy} r={r * 0.18} fill="#94a3b8" />
    </g>
  );
}

// ── Window with glow ─────────────────────────────────────────────────────────
function BusWindow({ x, y, w = 28, h = 18, lit = true }: { x: number; y: number; w?: number; h?: number; lit?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={lit ? "#bfdbfe" : "#1e3a5f"} opacity={lit ? 0.9 : 0.6} />
      {lit && (
        <motion.rect
          x={x} y={y} width={w} height={h} rx={3}
          fill="white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.35, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: Math.random() * 2 }}
        />
      )}
    </g>
  );
}

// ── Full animated bus scene ───────────────────────────────────────────────────
interface BusSceneProps {
  state?: "arriving" | "stopped" | "loading" | "departing";
  doorsOpen?: boolean;
  className?: string;
  width?: number;
}

export function BusScene({ state = "stopped", doorsOpen = false, className, width = 480 }: BusSceneProps) {
  const h = width * 0.42;
  const scale = width / 480;

  const busX = state === "arriving" ? -220 : state === "departing" ? 520 : 0;
  type CubicBezier = [number, number, number, number];
  const busTransition =
    state === "arriving"
      ? { duration: 0.8, ease: [0.22, 1, 0.36, 1] as CubicBezier }
      : state === "departing"
      ? { duration: 0.7, ease: [0.55, 0, 1, 0.45] as CubicBezier }
      : { duration: 0 };

  return (
    <div className={`relative overflow-hidden select-none ${className ?? ""}`} style={{ width, height: h }}>
      <svg width={width} height={h} viewBox={`0 0 480 ${h / scale}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Road */}
        <rect x={0} y={h / scale - 28} width={480} height={28} fill="#1e293b" rx={0} />

        {/* Road dashes */}
        {[0, 80, 160, 240, 320, 400].map((x) => (
          <motion.rect
            key={x}
            x={x} y={h / scale - 17} width={48} height={5} rx={2} fill="#fbbf24" opacity={0.7}
            animate={{ x: [x, x - 80, x - 80] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear", times: [0, 0.99, 1] }}
          />
        ))}

        {/* Kerb */}
        <rect x={0} y={h / scale - 30} width={480} height={3} fill="#334155" />

        {/* ── Bus body ── */}
        <motion.g
          initial={{ x: state === "arriving" ? -220 : 0 }}
          animate={{ x: state === "departing" ? 520 : 0 }}
          transition={busTransition}
        >
          {/* Shadow */}
          <ellipse cx={200} cy={h / scale - 10} rx={130} ry={6} fill="black" opacity={0.15} />

          {/* Body */}
          <rect x={30} y={h / scale - 115} width={340} height={87} rx={10} fill="#1B2D78" />

          {/* Roof accent */}
          <rect x={30} y={h / scale - 115} width={340} height={10} rx={10} fill="#111E52" />

          {/* Destination banner */}
          <rect x={44} y={h / scale - 105} width={200} height={12} rx={3} fill="#16A34A" />
          <text x={144} y={h / scale - 96} textAnchor="middle" fill="white" fontSize={7} fontFamily="system-ui" fontWeight="700">
            urRoute Express
          </text>

          {/* Windows */}
          <BusWindow x={44} y={h / scale - 89} lit />
          <BusWindow x={84} y={h / scale - 89} lit />
          <BusWindow x={124} y={h / scale - 89} lit />
          <BusWindow x={164} y={h / scale - 89} lit />
          <BusWindow x={204} y={h / scale - 89} lit />
          <BusWindow x={244} y={h / scale - 89} lit />

          {/* Windshield */}
          <rect x={295} y={h / scale - 100} width={55} height={38} rx={5} fill="#93c5fd" opacity={0.85} />
          {/* Windshield glare */}
          <line x1={302} y1={h / scale - 96} x2={310} y2={h / scale - 66} stroke="white" strokeWidth={2} strokeLinecap="round" opacity={0.4} />

          {/* Front grill / bumper */}
          <rect x={362} y={h / scale - 92} width={8} height={60} rx={4} fill="#111E52" />

          {/* Headlights */}
          <motion.rect
            x={364} y={h / scale - 80} width={5} height={8} rx={2} fill="#fde68a"
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.rect
            x={364} y={h / scale - 66} width={5} height={5} rx={1.5} fill="#fca5a5"
          />

          {/* Rear lights */}
          <motion.rect
            x={30} y={h / scale - 80} width={5} height={8} rx={2} fill="#ef4444"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />

          {/* Door */}
          <AnimatePresence>
            {doorsOpen ? (
              <>
                {/* Left door panel */}
                <motion.rect
                  key="door-left"
                  x={44} y={h / scale - 80} width={12} height={42} rx={2} fill="#0f172a"
                  initial={{ scaleX: 1, originX: "44px" }}
                  animate={{ x: -14 }}
                  exit={{ x: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
                {/* Right door panel */}
                <motion.rect
                  key="door-right"
                  x={56} y={h / scale - 80} width={12} height={42} rx={2} fill="#0f172a"
                  initial={{ x: 0 }}
                  animate={{ x: 14 }}
                  exit={{ x: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
                {/* Door glow — boarding light */}
                <motion.rect
                  key="door-glow"
                  x={44} y={h / scale - 80} width={24} height={42}
                  fill="#16A34A" opacity={0.15}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.2, 0.1] }}
                  transition={{ duration: 0.6 }}
                />
              </>
            ) : (
              <rect key="door-closed" x={44} y={h / scale - 80} width={24} height={42} rx={2} fill="#0f172a" />
            )}
          </AnimatePresence>

          {/* Undercarriage bar */}
          <rect x={30} y={h / scale - 32} width={340} height={5} rx={2} fill="#111E52" />

          {/* Wheels */}
          <Wheel cx={100} cy={h / scale - 15} />
          <Wheel cx={300} cy={h / scale - 15} />

          {/* Exhaust puffs when departing */}
          <AnimatePresence>
            {state === "loading" && (
              <>
                {[0, 1, 2].map((i) => (
                  <motion.circle
                    key={i}
                    cx={25} cy={h / scale - 35}
                    r={4}
                    fill="#94a3b8"
                    initial={{ opacity: 0.8, x: 0, y: 0, scale: 1 }}
                    animate={{ opacity: 0, x: -20 - i * 8, y: -8 - i * 4, scale: 2 + i }}
                    transition={{ duration: 1, delay: i * 0.3, repeat: Infinity }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </motion.g>

        {/* Bus stop sign */}
        <rect x={430} y={h / scale - 120} width={18} height={92} rx={2} fill="#334155" />
        <rect x={420} y={h / scale - 130} width={38} height={22} rx={4} fill="#1B2D78" />
        <text x={439} y={h / scale - 115} textAnchor="middle" fill="white" fontSize={7} fontFamily="system-ui" fontWeight="700">
          BUS
        </text>
        <text x={439} y={h / scale - 107} textAnchor="middle" fill="white" fontSize={5.5} fontFamily="system-ui">
          STOP
        </text>
      </svg>
    </div>
  );
}

// ── Mini bus loader (inline) ──────────────────────────────────────────────────
export function BusLoader({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className ?? ""}`}>
      <div className="relative w-64 h-20 overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 256 80" fill="none">
          {/* Road */}
          <rect x={0} y={60} width={256} height={20} fill="#1e293b" rx={2} />
          {[0, 60, 120, 180].map((x) => (
            <motion.rect
              key={x}
              x={x} y={68} width={40} height={4} rx={2} fill="#fbbf24" opacity={0.6}
              animate={{ x: [x, x - 60, x - 60] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: "linear", times: [0, 0.99, 1] }}
            />
          ))}

          {/* Bus */}
          <motion.g
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
          >
            <rect x={60} y={18} width={136} height={44} rx={6} fill="#1B2D78" />
            <rect x={60} y={18} width={136} height={6} rx={6} fill="#111E52" />
            <rect x={68} y={24} width={80} height={8} rx={2} fill="#16A34A" />
            {[68, 94, 120, 146].map((wx) => (
              <rect key={wx} x={wx} y={34} width={20} height={13} rx={2} fill="#93c5fd" opacity={0.85} />
            ))}
            {/* Windshield */}
            <rect x={168} y={22} width={22} height={26} rx={3} fill="#93c5fd" opacity={0.8} />
            {/* Headlight */}
            <motion.rect
              x={190} y={30} width={4} height={6} rx={1.5} fill="#fde68a"
              animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
            />
            {/* Wheels */}
            <circle cx={92} cy={65} r={10} fill="#0f172a" />
            <circle cx={92} cy={65} r={6} fill="#1e293b" />
            <motion.g animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "92px 65px" }}>
              {[0, 90, 180, 270].map((a) => {
                const rad = (a * Math.PI) / 180;
                return <line key={a} x1={92 + Math.cos(rad) * 2} y1={65 + Math.sin(rad) * 2} x2={92 + Math.cos(rad) * 5.5} y2={65 + Math.sin(rad) * 5.5} stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />;
              })}
            </motion.g>
            <circle cx={92} cy={65} r={2} fill="#94a3b8" />

            <circle cx={164} cy={65} r={10} fill="#0f172a" />
            <circle cx={164} cy={65} r={6} fill="#1e293b" />
            <motion.g animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "164px 65px" }}>
              {[0, 90, 180, 270].map((a) => {
                const rad = (a * Math.PI) / 180;
                return <line key={a} x1={164 + Math.cos(rad) * 2} y1={65 + Math.sin(rad) * 2} x2={164 + Math.cos(rad) * 5.5} y2={65 + Math.sin(rad) * 5.5} stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />;
              })}
            </motion.g>
            <circle cx={164} cy={65} r={2} fill="#94a3b8" />

            {/* Exhaust */}
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i} cx={58} cy={48} r={3}
                fill="#94a3b8"
                initial={{ opacity: 0.7, x: 0, y: 0 }}
                animate={{ opacity: 0, x: -12 - i * 5, y: -4 - i * 3 }}
                transition={{ duration: 0.8, delay: i * 0.25, repeat: Infinity }}
              />
            ))}
          </motion.g>
        </svg>
      </div>
      <motion.p
        className="text-sm font-semibold text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Finding your ride…
      </motion.p>
    </div>
  );
}

// ── Route progress (booking steps as bus stops) ───────────────────────────────
interface Stop {
  label: string;
  sublabel?: string;
}

export function RouteProgress({ stops, current }: { stops: Stop[]; current: number }) {
  const pct = current / (stops.length - 1);

  return (
    <div className="relative py-4">
      {/* Road line */}
      <div className="absolute top-[2.1rem] left-8 right-8 h-1 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Bus icon on road */}
      <motion.div
        className="absolute top-[1.5rem] z-10"
        style={{ left: `calc(2rem + ${pct} * (100% - 4rem) - 10px)` }}
        animate={{ left: `calc(2rem + ${pct} * (100% - 4rem) - 10px)` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <rect x="2" y="6" width="20" height="12" rx="3" />
            <rect x="5" y="9" width="5" height="4" rx="1" fill="#1B2D78" />
            <rect x="11" y="9" width="5" height="4" rx="1" fill="#1B2D78" />
            <circle cx="7" cy="19" r="2" fill="white" />
            <circle cx="17" cy="19" r="2" fill="white" />
          </svg>
        </div>
      </motion.div>

      {/* Stops */}
      <div className="relative flex justify-between">
        {stops.map((stop, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5" style={{ width: `${100 / stops.length}%` }}>
              <motion.div
                className={`w-4 h-4 rounded-full border-2 z-10 flex items-center justify-center ${
                  done ? "bg-primary border-primary" : active ? "border-primary bg-white dark:bg-background" : "border-border bg-background"
                }`}
                animate={{ scale: active ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.5, repeat: active ? Infinity : 0, repeatDelay: 1.5 }}
              >
                {done && (
                  <motion.svg width="8" height="8" viewBox="0 0 8 8" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <polyline points="1,4 3,6 7,2" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </motion.svg>
                )}
              </motion.div>
              <p className={`text-[11px] font-semibold text-center leading-tight ${active ? "text-primary" : done ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                {stop.label}
              </p>
              {stop.sublabel && (
                <p className="text-[9px] text-muted-foreground/60 text-center">{stop.sublabel}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Arrival celebration ───────────────────────────────────────────────────────
export function ArrivalCelebration({ show }: { show: boolean }) {
  const [particles, setParticles] = useState<{ x: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    if (show) {
      const COLORS = ["#16A34A", "#1B2D78", "#F59E0B", "#EF4444", "#8B5CF6"] as const;
      setParticles(
        Array.from({ length: 20 }, (_, i) => ({
          x: 10 + (i * 4.5),
          color: COLORS[i % 5] as string,
          delay: Math.random() * 0.5,
        }))
      );
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{ left: `${p.x}%`, top: "60%", backgroundColor: p.color }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ y: -200, opacity: 0, rotate: 360 * (i % 2 === 0 ? 1 : -1) }}
          transition={{ duration: 1.2, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
