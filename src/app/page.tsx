import Link from "next/link";
import {
  Bus, Shield, Gift, TrendingUp, Star, ArrowRight, CheckCircle,
  MapPin, Clock, Users, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const LEVELS = [
  {
    code: "L1", name: "Welcome", trips: "Trips 1–4",
    gradient: "from-slate-500 to-slate-600",
    light: "bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700",
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    perk: "Flat 11% off every ride",
  },
  {
    code: "L2", name: "Stay", trips: "Trips 4–8",
    gradient: "from-blue-500 to-blue-700",
    light: "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900",
    badge: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
    perk: "10% off + group bonuses",
  },
  {
    code: "L3", name: "Loyalty", trips: "Trips 8–12",
    gradient: "from-purple-500 to-purple-700",
    light: "bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900",
    badge: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300",
    perk: "₹150 flat reward per trip",
  },
  {
    code: "L4", name: "Champion", trips: "Trips 12+",
    gradient: "from-amber-400 to-amber-600",
    light: "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900",
    badge: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    perk: "15% off + priority perks",
  },
];

const FEATURES = [
  {
    icon: Gift,
    title: "4-Level Loyalty System",
    desc: "Welcome → Stay → Loyalty → Champion. Progress never fully resets — it freezes and resumes, rewarding long-term riders.",
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Operator Analytics",
    desc: "Revenue trends, booking conversion, reward redemption rates — all pre-aggregated and ready in the dashboard.",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  {
    icon: Shield,
    title: "Multi-Tenant & Secure",
    desc: "Row-level isolation per operator. JWT auth with refresh-token rotation. Razorpay-verified payments.",
    color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  },
  {
    icon: Users,
    title: "Group Travel Bonuses",
    desc: "Operators configure per-head bonuses for group bookings — travelers who bring friends get more rewards.",
    color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  },
];

const STATS = [
  { value: "4", label: "Loyalty Levels", icon: Star },
  { value: "₹0", label: "Setup Cost", icon: Zap },
  { value: "∞", label: "Operators Supported", icon: MapPin },
  { value: "100%", label: "Data Isolation", icon: Shield },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-sidebar border-b border-white/10">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sidebar-active flex items-center justify-center">
              <Bus className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-extrabold text-white tracking-tight">urRoute</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#loyalty" className="hover:text-white transition-colors">Loyalty</Link>
            <Link href="#operators" className="hover:text-white transition-colors">Operators</Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle dark />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="action" size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-sidebar py-24 text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="bg-sidebar-active/20 text-sidebar-active border-sidebar-active/30 text-xs font-semibold tracking-widest uppercase">
              B2B2C Bus Loyalty Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              The smarter way to<br />
              <span className="text-sidebar-active">book intercity buses</span>
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Earn loyalty rewards on every ride. Bus operators get retention analytics while travelers unlock discounts and perks.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
              <Link href="/register">
                <Button variant="action" size="lg" className="gap-2 font-semibold px-8">
                  Start for free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/search">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white">
                  Search buses
                </Button>
              </Link>
            </div>
            <p className="text-white/30 text-xs">No credit card required · Free tier available</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center space-y-1">
                <p className="text-2xl font-extrabold text-white">{value}</p>
                <p className="text-xs text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loyalty Levels */}
      <section id="loyalty" className="py-20 bg-muted/30">
        <div className="container space-y-12">
          <div className="text-center space-y-3">
            <p className="text-action text-xs font-semibold uppercase tracking-widest">Loyalty Journey</p>
            <h2 className="text-3xl font-extrabold">Four levels. One continuous cycle.</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              Progress freezes when a traveler rides another operator — and resumes the moment they return. No full resets.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LEVELS.map((l) => (
              <Card key={l.name} className={`border overflow-hidden ${l.light}`}>
                <div className={`h-1.5 w-full bg-gradient-to-r ${l.gradient}`} />
                <CardContent className="pt-5 pb-5 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${l.badge}`}>
                      {l.code} · {l.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{l.trips}</p>
                  <p className="text-sm font-semibold">{l.perk}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Progress freezes after inactivity — not deleted. Riders pick up where they left off.</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container space-y-12">
          <div className="text-center space-y-3">
            <p className="text-action text-xs font-semibold uppercase tracking-widest">Platform</p>
            <h2 className="text-3xl font-extrabold">Everything operators need</h2>
            <p className="text-muted-foreground text-sm">
              Built on Next.js 15, Prisma, and a clean-architecture backend — ready to scale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="flex gap-4 p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operator CTA */}
      <section id="operators" className="py-20 bg-sidebar">
        <div className="container text-center space-y-6 text-white">
          <p className="text-sidebar-active text-xs font-semibold uppercase tracking-widest">For Operators</p>
          <h2 className="text-3xl font-extrabold">Ready to grow rider retention?</h2>
          <p className="text-white/60 max-w-md mx-auto text-sm">
            Register your fleet, configure loyalty offers, and watch repeat bookings climb — all from one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button variant="action" size="lg" className="font-semibold">
                Register as Operator
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white">
                Sign in
              </Button>
            </Link>
          </div>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/50 pt-2">
            {["Free to start", "No setup fee", "Cancel anytime"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-sidebar-active" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Bus className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold text-foreground">urRoute</span>
            <span>© 2026</span>
          </div>
          <nav className="flex gap-4">
            <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            <Link href="/search" className="hover:text-foreground transition-colors">Search</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
