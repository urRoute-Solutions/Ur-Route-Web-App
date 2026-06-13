import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Bus, Building2 } from "lucide-react";

export default async function AdminAnalyticsPage() {
  await requireRole("ADMIN");

  const [totalUsers, totalOperators, totalTrips, bookingStats] = await Promise.all([
    prisma.user.count(),
    prisma.operator.count({ where: { deletedAt: null } }),
    prisma.trip.count(),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { totalFareMinor: true },
    }),
  ]);

  const confirmedStats = bookingStats.find((s) => s.status === "CONFIRMED");
  const completedStats = bookingStats.find((s) => s.status === "COMPLETED");
  const totalRevenue = ((confirmedStats?._sum.totalFareMinor ?? 0) + (completedStats?._sum.totalFareMinor ?? 0));
  const totalBookings = bookingStats.reduce((s: number, b) => s + b._count.id, 0);

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{totalUsers.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><Users className="h-3.5 w-3.5" /> Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{totalOperators.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><Building2 className="h-3.5 w-3.5" /> Operators</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{totalTrips.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><Bus className="h-3.5 w-3.5" /> Trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">₹{(totalRevenue / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><TrendingUp className="h-3.5 w-3.5" /> Revenue</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Booking Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bookingStats.map((s) => {
              const count = s._count.id;
              const pct = totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0;
              return (
                <div key={s.status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{s.status.toLowerCase()}</span>
                    <span className="text-muted-foreground">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        s.status === "CONFIRMED" || s.status === "COMPLETED" ? "bg-green-500" :
                        s.status === "CANCELLED" ? "bg-red-400" : "bg-amber-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {bookingStats.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No bookings yet.</p>}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">All-time data. Revenue includes confirmed and completed bookings only.</p>
    </div>
  );
}
