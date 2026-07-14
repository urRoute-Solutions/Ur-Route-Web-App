import { requireRole } from "@/lib/auth/session";
import { operatorRepository } from "@/repositories/operator.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Building2, Users, TrendingUp, ArrowRight,
  ShieldCheck, BarChart3, Activity,
} from "lucide-react";

export default async function AdminOverviewPage() {
  await requireRole("ADMIN");

  const [[allOperators, totalOperators], [recentBookings, totalBookings]] = await Promise.all([
    operatorRepository.list({ page: 1, pageSize: 5 }),
    bookingRepository.listAll({ page: 1, pageSize: 5 }),
  ]);

  const activeOperators = allOperators.filter((o) => o.status === "ACTIVE").length;
  const pendingOperators = allOperators.filter((o) => o.status === "PENDING").length;
  const revenue = recentBookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((s, b) => s + b.totalFareMinor, 0);

  const STATS = [
    {
      icon: Building2, label: "Total Operators", value: totalOperators,
      sub: `${activeOperators} active · ${pendingOperators} pending`,
      color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", href: "/admin/operators",
    },
    {
      icon: Users, label: "Total Bookings", value: totalBookings,
      sub: `${recentBookings.filter((b) => b.status === "CONFIRMED").length} confirmed recently`,
      color: "text-primary", bg: "bg-primary/5", href: "/admin/analytics",
    },
    {
      icon: TrendingUp, label: "Recent Revenue", value: `₹${(revenue/100).toLocaleString("en-IN",{maximumFractionDigits:0})}`,
      sub: "From confirmed bookings",
      color: "text-action", bg: "bg-action/5", href: "/admin/analytics",
    },
  ];

  function statusVariant(status: string): "default" | "destructive" | "secondary" | "outline" {
    if (status === "CONFIRMED" || status === "ACTIVE") return "default";
    if (status === "CANCELLED") return "destructive";
    return "secondary";
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header banner ── */}
      <div className="bg-sidebar text-white">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-sidebar-active" />
                <span className="text-sidebar-active text-xs font-bold uppercase tracking-widest">Admin Console</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">Platform Overview</h1>
              <p className="text-white/50 text-sm mt-1">
                {totalOperators} operator{totalOperators !== 1 ? "s" : ""} · {totalBookings} booking{totalBookings !== 1 ? "s" : ""} total
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/admin/analytics">
                <button className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors">
                  <BarChart3 className="h-3.5 w-3.5" /> Analytics
                </button>
              </Link>
              <Link href="/admin/status">
                <button className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors">
                  <Activity className="h-3.5 w-3.5" /> Status
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map(({ icon: Icon, label, value, sub, color, bg, href }) => (
            <Link
              key={label}
              href={href}
              className="group bg-white dark:bg-card border border-border rounded-xl p-5 flex items-start gap-4 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold leading-none">{value}</p>
                <p className="text-xs font-medium text-muted-foreground mt-1">{label}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Tables grid ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Operators */}
          <div className="bg-white dark:bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-500" /> Operators
              </h2>
              <Link href="/admin/operators" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {allOperators.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No operators yet.</div>
            ) : (
              <div className="divide-y divide-border">
                {allOperators.map((o) => (
                  <div key={o.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold">{o.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{o.city ?? "—"} · {o.slug}</p>
                    </div>
                    <Badge
                      variant={o.status === "ACTIVE" ? "default" : o.status === "PENDING" ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {o.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent bookings */}
          <div className="bg-white dark:bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Recent Bookings
              </h2>
            </div>
            {recentBookings.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No bookings yet.</div>
            ) : (
              <div className="divide-y divide-border">
                {recentBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="font-mono text-sm font-semibold">{b.pnr}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {b.passengerCount} pax · {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">₹{(b.totalFareMinor / 100).toFixed(0)}</p>
                      <Badge variant={statusVariant(b.status)} className="text-[10px]">{b.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick admin links ── */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Building2, label: "Manage Operators", href: "/admin/operators", desc: "Approve, review and manage operator accounts" },
            { icon: Users, label: "Support Agents", href: "/admin/agents", desc: "Manage support agent accounts and access" },
            { icon: Activity, label: "System Status", href: "/admin/status", desc: "View incidents and post status updates" },
          ].map(({ icon: Icon, label, href, desc }) => (
            <Link
              key={label}
              href={href}
              className="group flex items-start gap-3 bg-white dark:bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto mt-1 shrink-0 group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
