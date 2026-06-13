import { requireOperator } from "@/lib/auth/session";
import { tripRepository } from "@/repositories/trip.repository";
import { routeRepository } from "@/repositories/route.repository";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bus, Plus, Clock, ArrowRight } from "lucide-react";

const STATUS_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SCHEDULED: "default",
  DEPARTED: "secondary",
  ARRIVED: "outline",
  CANCELLED: "destructive",
};

export default async function OperatorTripsPage() {
  const { operatorId } = await requireOperator();
  const [[trips, total], [routes]] = await Promise.all([
    tripRepository.listByOperator(operatorId, { page: 1, pageSize: 50 }),
    routeRepository.listByOperator(operatorId, { page: 1, pageSize: 100 }),
  ]);

  const routeMap = Object.fromEntries(routes.map((r) => [r.id, r]));

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trips</h1>
        <Link href="/operator/trips/new">
          <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Schedule trip</Button>
        </Link>
      </div>

      {trips.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <Bus className="h-10 w-10 mx-auto text-muted-foreground/30" />
            <p className="font-medium">No trips scheduled</p>
            <p className="text-sm text-muted-foreground">Schedule your first trip so travellers can book.</p>
            <Link href="/operator/trips/new"><Button variant="outline">+ Schedule trip</Button></Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {trips.map((t) => {
          const route = routeMap[t.routeId];
          const dep = new Date(t.departureAt);
          const arr = new Date(t.arrivalAt);
          return (
            <Card key={t.id}>
              <CardContent className="flex items-center justify-between gap-4 py-4 px-5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bus className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    {route && (
                      <div className="flex items-center gap-1.5 font-semibold text-sm">
                        {route.origin} <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" /> {route.destination}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3" />
                      {dep.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {dep.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} – {arr.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{t.availableSeats} seats left</p>
                    <p className="text-sm font-semibold">₹{(t.basePriceMinor / 100).toFixed(0)}</p>
                  </div>
                  <Badge variant={STATUS_COLOR[t.status] ?? "secondary"}>{t.status}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {total > 50 && <p className="text-sm text-center text-muted-foreground">Showing 50 of {total}</p>}
      </div>
    </div>
  );
}
