import { requireRole } from "@/lib/auth/session";
import { bookingRepository } from "@/repositories/booking.repository";
import { rewardProgressRepository } from "@/repositories/reward-progress.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowRight, Bus, Gift, MapPin } from "lucide-react";

const LEVEL_META: Record<string, { label: string; next: string; max: number; color: string }> = {
  LEVEL_1: { label: "Welcome", next: "Stay", max: 4, color: "bg-slate-400" },
  LEVEL_2: { label: "Stay", next: "Loyalty", max: 8, color: "bg-blue-500" },
  LEVEL_3: { label: "Loyalty", next: "Champion", max: 12, color: "bg-purple-500" },
  LEVEL_4: { label: "Champion", next: "Champion", max: 12, color: "bg-amber-500" },
};

export default async function DashboardPage() {
  const principal = await requireRole("TRAVELER");

  const [[bookings, totalBookings], allProgress] = await Promise.all([
    bookingRepository.listByUser(principal.userId, { page: 1, pageSize: 5 }),
    rewardProgressRepository.listByUser(principal.userId),
  ]);

  const activeProgress = allProgress.filter((p) => p.status === "ACTIVE");

  return (
    <div className="p-6 max-w-4xl space-y-8">
      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{totalBookings}</p>
            <p className="text-sm text-muted-foreground">Total bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{allProgress.length}</p>
            <p className="text-sm text-muted-foreground">Operators ridden</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{activeProgress.reduce((s, p) => s + p.completedTrips, 0)}</p>
            <p className="text-sm text-muted-foreground">Trips completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty progress */}
      {activeProgress.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Gift className="h-5 w-5 text-reward" /> Loyalty Progress</h2>
            <Link href="/rewards" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {activeProgress.map((p) => {
              const meta = LEVEL_META[p.currentLevel];
              const pct = meta ? Math.min(100, (p.completedTrips / meta.max) * 100) : 0;
              return (
                <Card key={p.operatorId}>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-semibold">{meta?.label ?? p.currentLevel}</Badge>
                      <span className="text-xs text-muted-foreground">{p.completedTrips} trips</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {meta && p.currentLevel !== "LEVEL_4"
                        ? `${meta.max - p.completedTrips} more trips to ${meta.next}`
                        : "Champion — cycling!"}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA if no progress */}
      {allProgress.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center space-y-3">
            <Bus className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="font-medium">Start your first journey</p>
            <p className="text-sm text-muted-foreground">Book a bus and start earning loyalty rewards.</p>
            <Link href="/search"><Button>Search buses</Button></Link>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Recent bookings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Bus className="h-5 w-5" /> Recent Bookings</h2>
          <Link href="/bookings" className="text-sm text-primary hover:underline flex items-center gap-1">
            All bookings <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {bookings.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No bookings yet.</p>
          )}
          {bookings.map((b) => (
            <Link key={b.id} href={`/bookings/${b.id}`}>
              <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                <CardContent className="flex items-center justify-between py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-medium">{b.pnr}</p>
                      <p className="text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">₹{(b.totalFareMinor / 100).toFixed(0)}</p>
                    <Badge variant={b.status === "CONFIRMED" ? "default" : b.status === "CANCELLED" ? "destructive" : "secondary"} className="text-xs">
                      {b.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
