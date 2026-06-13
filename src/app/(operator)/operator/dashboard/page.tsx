import { requireOperator } from "@/lib/auth/session";
import { bookingRepository } from "@/repositories/booking.repository";
import { routeRepository } from "@/repositories/route.repository";
import { tripRepository } from "@/repositories/trip.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, MapPin, Bus, Users, TrendingUp } from "lucide-react";

export default async function OperatorDashboardPage() {
  const { operatorId } = await requireOperator();

  const [[routes, totalRoutes], [trips, totalTrips], [recentBookings, totalBookings]] = await Promise.all([
    routeRepository.listByOperator(operatorId, { page: 1, pageSize: 5 }),
    tripRepository.listByOperator(operatorId, { page: 1, pageSize: 5 }),
    bookingRepository.listByOperator(operatorId, { page: 1, pageSize: 5 }),
  ]);

  const confirmedBookings = recentBookings.filter((b) => b.status === "CONFIRMED").length;
  const revenue = recentBookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((s, b) => s + b.totalFareMinor, 0);

  return (
    <div className="p-6 max-w-5xl space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{totalRoutes}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3.5 w-3.5" /> Routes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{totalTrips}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><Bus className="h-3.5 w-3.5" /> Trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{totalBookings}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><Users className="h-3.5 w-3.5" /> Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">₹{(revenue / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><TrendingUp className="h-3.5 w-3.5" /> Revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent routes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Routes</CardTitle>
              <Link href="/operator/routes" className="text-xs text-primary hover:underline flex items-center gap-1">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {routes.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No routes yet. <Link href="/operator/routes/new" className="text-primary hover:underline">Add one</Link>.</p>
            )}
            {routes.map((r) => (
              <Link key={r.id} href={`/operator/routes/${r.id}`} className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {r.origin} <ArrowRight className="h-3 w-3 text-muted-foreground" /> {r.destination}
                </div>
                <Badge variant={r.isActive ? "default" : "secondary"} className="text-xs">{r.isActive ? "Active" : "Inactive"}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Bookings</CardTitle>
              <Link href="/operator/bookings" className="text-xs text-primary hover:underline flex items-center gap-1">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentBookings.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No bookings yet.</p>
            )}
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
