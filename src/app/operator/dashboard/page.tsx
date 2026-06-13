import { requireOperator } from "@/lib/auth/session";
import { bookingRepository } from "@/repositories/booking.repository";
import { tripRepository } from "@/repositories/trip.repository";
import { operatorRepository } from "@/repositories/operator.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function OperatorDashboardPage() {
  const { operatorId } = await requireOperator();

  const [operator, [recentBookings, totalBookings], [trips]] = await Promise.all([
    operatorRepository.findById(operatorId),
    bookingRepository.listByOperator(operatorId, { page: 1, pageSize: 5 }),
    tripRepository.listByOperator(operatorId, { page: 1, pageSize: 3 }),
  ]);

  const revenue = recentBookings.reduce((sum, b) => sum + b.totalFareMinor, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{operator?.name ?? "Operator Dashboard"}</h1>
            <Badge className="mt-1" variant={operator?.status === "ACTIVE" ? "default" : "secondary"}>
              {operator?.status}
            </Badge>
          </div>
          <Link href="/operator/trips"><Button>+ New Trip</Button></Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{totalBookings}</p><p className="text-sm text-slate-500">Total bookings</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-2xl font-bold">₹{(revenue / 100).toFixed(0)}</p><p className="text-sm text-slate-500">Recent revenue</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{operator?.rating.toFixed(1)}</p><p className="text-sm text-slate-500">Rating</p></CardContent></Card>
        </div>

        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Recent Bookings</h2>
            <Link href="/operator/bookings" className="text-sm text-slate-500 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentBookings.map((b) => (
              <Card key={b.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-mono font-medium">{b.pnr}</p>
                    <p className="text-xs text-slate-400">{new Date(b.createdAt).toLocaleDateString("en-IN")} · {b.passengerCount} pax</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{(b.totalFareMinor / 100).toFixed(0)}</p>
                    <Badge variant="outline" className="text-xs">{b.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Upcoming Trips</h2>
            <Link href="/operator/trips" className="text-sm text-slate-500 hover:underline">Manage trips</Link>
          </div>
          <div className="space-y-3">
            {trips.map((t) => (
              <Card key={t.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{t.busName}</p>
                    <p className="text-xs text-slate-400">{new Date(t.departureAt).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{t.availableSeats}/{t.totalSeats} seats</p>
                    <Badge variant="outline" className="text-xs">{t.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <nav className="flex gap-3 flex-wrap">
          {([["Routes", "/operator/routes"], ["Trips", "/operator/trips"], ["Offers", "/operator/offers"], ["Bookings", "/operator/bookings"]] as [string, string][]).map(([label, href]) => (
            <Link key={href} href={href}><Button variant="outline">{label}</Button></Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
