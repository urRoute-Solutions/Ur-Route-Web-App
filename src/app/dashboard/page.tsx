import { requireRole } from "@/lib/auth/session";
import { bookingRepository } from "@/repositories/booking.repository";
import { rewardProgressRepository } from "@/repositories/reward-progress.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const LEVEL_LABELS: Record<string, string> = {
  LEVEL_1: "Welcome",
  LEVEL_2: "Stay",
  LEVEL_3: "Loyalty",
  LEVEL_4: "Champion",
};

export default async function DashboardPage() {
  const principal = await requireRole("TRAVELER");

  const [[bookings], progress] = await Promise.all([
    bookingRepository.listByUser(principal.userId, { page: 1, pageSize: 5 }),
    rewardProgressRepository.listByUser(principal.userId),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <Link href="/search"><Button>Find a bus</Button></Link>
        </div>

        {/* Loyalty Summary */}
        {progress.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Loyalty Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {progress.map((p) => (
                <Card key={p.operatorId}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge>{LEVEL_LABELS[p.currentLevel] ?? p.currentLevel}</Badge>
                        <p className="text-sm text-slate-500 mt-1">{p.completedTrips} trips completed</p>
                      </div>
                      {p.status === "FROZEN" && (
                        <Badge variant="secondary">Frozen</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Recent Bookings */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Bookings</h2>
            <Link href="/bookings" className="text-sm text-slate-500 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {bookings.length === 0 && (
              <Card><CardContent className="py-8 text-center text-slate-400">No bookings yet</CardContent></Card>
            )}
            {bookings.map((b) => (
              <Card key={b.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-mono font-medium">{b.pnr}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(b.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{(b.totalFareMinor / 100).toFixed(0)}</p>
                    <Badge variant={b.status === "CONFIRMED" ? "default" : "secondary"} className="text-xs">
                      {b.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
