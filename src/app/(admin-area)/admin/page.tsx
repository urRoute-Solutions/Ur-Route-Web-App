import { requireRole } from "@/lib/auth/session";
import { operatorRepository } from "@/repositories/operator.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Building2, Users, TrendingUp, ArrowRight } from "lucide-react";

export default async function AdminOverviewPage() {
  await requireRole("ADMIN");

  const [[allOperators, totalOperators], [recentBookings, totalBookings]] = await Promise.all([
    operatorRepository.list({ page: 1, pageSize: 5 }),
    bookingRepository.listAll({ page: 1, pageSize: 5 }),
  ]);

  const activeOperators = allOperators.filter((o) => o.status === "ACTIVE").length;
  const revenue = recentBookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((s, b) => s + b.totalFareMinor, 0);

  return (
    <div className="p-6 max-w-5xl space-y-8">
      <h1 className="text-2xl font-bold">Platform Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{totalOperators}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><Building2 className="h-3.5 w-3.5" /> Operators</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{totalBookings}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><Users className="h-3.5 w-3.5" /> Total bookings</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">₹{(revenue / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><TrendingUp className="h-3.5 w-3.5" /> Revenue (recent)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Operators</CardTitle>
              <Link href="/admin/operators" className="text-xs text-primary hover:underline flex items-center gap-1">All <ArrowRight className="h-3 w-3" /></Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {allOperators.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{o.name}</p>
                  <p className="text-xs text-muted-foreground">{o.city ?? "—"} · {o.slug}</p>
                </div>
                <Badge variant={o.status === "ACTIVE" ? "default" : o.status === "PENDING" ? "secondary" : "destructive"} className="text-xs">{o.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Bookings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 px-3 rounded">
                <div>
                  <p className="font-mono text-sm font-medium">{b.pnr}</p>
                  <p className="text-xs text-muted-foreground">{b.passengerCount} pax · {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">₹{(b.totalFareMinor / 100).toFixed(0)}</p>
                  <Badge variant={b.status === "CONFIRMED" ? "default" : b.status === "CANCELLED" ? "destructive" : "secondary"} className="text-xs">{b.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
