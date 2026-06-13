import Link from "next/link";
import { Bus, Shield, Gift, TrendingUp, Star, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Gift,
    title: "4-Level Loyalty System",
    desc: "Welcome → Stay → Loyalty → Champion. Travelers earn discounts and badges as they ride, with progress that never resets.",
  },
  {
    icon: TrendingUp,
    title: "Operator Analytics",
    desc: "Daily revenue, booking trends, and reward redemption data — all pre-aggregated and ready to query.",
  },
  {
    icon: Shield,
    title: "Multi-Tenant & Secure",
    desc: "Row-level isolation per operator. JWT auth with refresh-token rotation and CSRF protection out of the box.",
  },
  {
    icon: Star,
    title: "Group Bonuses",
    desc: "Operators reward travelers who bring friends — configurable per-head bonus on every group booking.",
  },
];

const LEVELS = [
  { name: "Welcome", trips: "Trip 1", color: "bg-slate-200 text-slate-700", perk: "5% off every ride" },
  { name: "Stay", trips: "Trip 4", color: "bg-blue-100 text-blue-700", perk: "10% off + group bonus" },
  { name: "Loyalty", trips: "Trip 8", color: "bg-purple-100 text-purple-700", perk: "₹150 flat reward" },
  { name: "Champion", trips: "Trip 12", color: "bg-amber-100 text-amber-700", perk: "15% off + priority perks" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary text-lg">urRoute</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#loyalty" className="hover:text-foreground transition-colors">Loyalty</Link>
            <Link href="#operators" className="hover:text-foreground transition-colors">For Operators</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link href="/register"><Button size="sm">Get started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-20 text-center space-y-6">
        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
          B2B2C Loyalty for Bus Operators
        </Badge>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
          Turn every ride into a{" "}
          <span className="text-primary">loyal relationship</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          urRoute gives bus operators a gamified loyalty engine — travelers earn discounts, badges, and perks while operators get retention and analytics.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/register"><Button size="lg" className="gap-2">Start for free <ArrowRight className="h-4 w-4" /></Button></Link>
          <Link href="/search"><Button size="lg" variant="outline">Search buses</Button></Link>
        </div>
        <p className="text-xs text-muted-foreground">No credit card required · Free tier available</p>
      </section>

      {/* Loyalty levels */}
      <section id="loyalty" className="bg-slate-50 py-20">
        <div className="container space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Four loyalty levels. One cycle.</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Progress never resets — it freezes when a traveler rides another operator and resumes on return.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LEVELS.map((l, i) => (
              <Card key={l.name} className="relative overflow-hidden">
                <div className={`absolute inset-x-0 top-0 h-1 ${l.color.split(" ")[0]}`} />
                <CardContent className="pt-6 space-y-2">
                  <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${l.color}`}>L{i + 1} · {l.name}</span>
                  <p className="text-xs text-muted-foreground">{l.trips}</p>
                  <p className="text-sm font-medium">{l.perk}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-20 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Everything operators need</h2>
          <p className="text-muted-foreground">Built on Next.js 15, Prisma, and a clean-architecture backend.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-6 rounded-xl border bg-white">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* For operators CTA */}
      <section id="operators" className="bg-primary py-20">
        <div className="container text-center space-y-6 text-primary-foreground">
          <h2 className="text-3xl font-bold">Ready to grow rider retention?</h2>
          <p className="text-primary-foreground/80 max-w-md mx-auto">Register your fleet, configure loyalty offers, and watch repeat bookings climb.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register"><Button size="lg" className="bg-white text-primary hover:bg-white/90">Register as Operator</Button></Link>
            <Link href="/login"><Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">Sign in</Button></Link>
          </div>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-primary-foreground/70">
            {["Free to start", "No setup fee", "Cancel anytime"].map((t) => (
              <li key={t} className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" />{t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Bus className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">urRoute</span>
            <span>© 2026</span>
          </div>
          <nav className="flex gap-4">
            <Link href="/login" className="hover:text-foreground">Login</Link>
            <Link href="/register" className="hover:text-foreground">Register</Link>
            <Link href="/search" className="hover:text-foreground">Search</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
