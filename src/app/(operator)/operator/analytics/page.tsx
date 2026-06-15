import { requireOperator } from "@/lib/auth/session";
import { getOperatorAnalyticsUseCase } from "@/usecases/analytics/get-analytics.usecase";
import { prisma } from "@/lib/prisma";
import { BarChart3, TrendingUp, Users, BookOpen, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(minor: number) {
  return `₹${(minor / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function OccupancyBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold w-10 text-right">{pct}%</span>
    </div>
  );
}

export default async function AnalyticsPage() {
  const { operatorId } = await requireOperator();

  const to = new Date().toISOString().split("T")[0]!;
  const from = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]!;

  const [rows, trips] = await Promise.all([
    getOperatorAnalyticsUseCase(operatorId, { from, to }),
    prisma.trip.findMany({
      where: { operatorId, departureAt: { gte: new Date(Date.now() - 30 * 86400000) } },
      include: { route: { select: { origin: true, destination: true } } },
      orderBy: { departureAt: "desc" },
      take: 20,
    }),
  ]);

  const totals = rows.reduce(
    (acc, r) => ({
      bookings: acc.bookings + r.bookingsCount,
      revenue: acc.revenue + r.revenueMinor,
      newUsers: acc.newUsers + r.newUsers,
      rewards: acc.rewards + r.rewardsRedeemed,
    }),
    { bookings: 0, revenue: 0, newUsers: 0, rewards: 0 },
  );

  const avgOccupancy = trips.length
    ? Math.round(trips.reduce((s, t) => s + ((t.totalSeats - t.availableSeats) / t.totalSeats) * 100, 0) / trips.length)
    : 0;

  const stats = [
    { label: "Total bookings", value: totals.bookings.toString(), icon: BookOpen, color: "text-primary", bg: "bg-primary/5" },
    { label: "Revenue (30d)", value: fmt(totals.revenue), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
    { label: "New travelers", value: totals.newUsers.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { label: "Avg occupancy", value: `${avgOccupancy}%`, icon: Percent, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
  ];

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last 30 days — {from} to {to}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={cn("rounded-2xl p-5 space-y-3", s.bg)}>
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 dark:bg-card/60", s.color)}>
              <s.icon className="h-4 w-4" />
            </div>
            <div>
              <p className={cn("text-2xl font-black", s.color)}>{s.value}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Occupancy per trip */}
      {trips.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-foreground mb-3">Trip occupancy (last 30 days)</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  {["Route", "Date", "Bus", "Seats Sold", "Occupancy"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {trips.map((t) => {
                  const sold = t.totalSeats - t.availableSeats;
                  const pct = Math.round((sold / t.totalSeats) * 100);
                  const dep = new Date(t.departureAt);
                  return (
                    <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold">{t.route.origin} → {t.route.destination}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {dep.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {dep.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{t.busName}</td>
                      <td className="px-4 py-3 text-xs">{sold} / {t.totalSeats}</td>
                      <td className="px-4 py-3 w-40"><OccupancyBar pct={pct} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center">
          <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="font-semibold text-foreground">No analytics data yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Data is collected automatically as bookings are made.</p>
        </div>
      ) : (
        <div>
          <h2 className="text-base font-bold text-foreground mb-3">Daily breakdown</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  {["Date", "Bookings", "Revenue", "New Travelers", "Rewards"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {rows.slice().reverse().map((r) => (
                  <tr key={r.date} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{r.date}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.bookingsCount}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-foreground">{fmt(r.revenueMinor)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.newUsers}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.rewardsRedeemed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
