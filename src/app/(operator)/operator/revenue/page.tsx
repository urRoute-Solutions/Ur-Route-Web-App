import { requireOperator } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { TrendingUp, IndianRupee, BookOpen, Users, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

function fmt(minor: number) {
  return `₹${(minor / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

const STATUS_BADGE: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

export default async function RevenuePage() {
  const { operatorId } = await requireOperator();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const [allTime, thisMonth, thisWeek, recent, uniqueTravelers] = await Promise.all([
    prisma.booking.aggregate({
      where: { operatorId, status: { in: ["CONFIRMED", "COMPLETED"] } },
      _sum: { totalFareMinor: true },
      _count: { id: true },
    }),
    prisma.booking.aggregate({
      where: {
        operatorId,
        status: { in: ["CONFIRMED", "COMPLETED"] },
        createdAt: { gte: monthStart },
      },
      _sum: { totalFareMinor: true },
      _count: { id: true },
    }),
    prisma.booking.aggregate({
      where: {
        operatorId,
        status: { in: ["CONFIRMED", "COMPLETED"] },
        createdAt: { gte: weekStart },
      },
      _sum: { totalFareMinor: true },
    }),
    prisma.booking.findMany({
      where: { operatorId, status: { in: ["CONFIRMED", "COMPLETED", "PENDING", "CANCELLED"] } },
      orderBy: { createdAt: "desc" },
      take: 25,
      include: {
        user: { select: { fullName: true } },
        trip: { include: { route: { select: { origin: true, destination: true } } } },
      },
    }),
    prisma.booking.groupBy({
      by: ["userId"],
      where: { operatorId, status: { in: ["CONFIRMED", "COMPLETED"] } },
    }),
  ]);

  const stats = [
    {
      label: "All-time revenue",
      value: fmt(allTime._sum.totalFareMinor ?? 0),
      sub: `${allTime._count.id} paid bookings`,
      icon: IndianRupee,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      label: "This month",
      value: fmt(thisMonth._sum.totalFareMinor ?? 0),
      sub: `${thisMonth._count.id} bookings`,
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/5",
    },
    {
      label: "Last 7 days",
      value: fmt(thisWeek._sum.totalFareMinor ?? 0),
      sub: "rolling week",
      icon: BookOpen,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: "Unique travelers",
      value: uniqueTravelers.length.toString(),
      sub: "paid at least once",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
  ];

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <Link href="/operator/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <div>
        <h1 className="text-2xl font-black text-foreground">Revenue</h1>
        <p className="mt-1 text-sm text-muted-foreground">Earnings from confirmed and completed bookings.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={cn("rounded-2xl p-5 space-y-3", s.bg)}>
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 dark:bg-card/60", s.color)}>
              <s.icon className="h-4 w-4" />
            </div>
            <div>
              <p className={cn("text-2xl font-black", s.color)}>{s.value}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{s.label}</p>
              <p className="text-[11px] text-muted-foreground">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent bookings table */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-3">Recent bookings</h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                {["PNR", "Traveler", "Route", "Date", "Amount", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {recent.map((b) => (
                <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{b.pnr}</td>
                  <td className="px-4 py-3 text-xs font-medium text-foreground">{b.user.fullName}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {b.trip.route.origin} → {b.trip.route.destination}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-foreground">{fmt(b.totalFareMinor)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", STATUS_BADGE[b.status])}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recent.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">No bookings yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
