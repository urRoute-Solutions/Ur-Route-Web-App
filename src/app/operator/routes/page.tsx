import { requireOperator } from "@/lib/auth/session";
import { routeRepository } from "@/repositories/route.repository";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function OperatorRoutesPage() {
  const { operatorId } = await requireOperator();
  const [routes] = await routeRepository.listByOperator(operatorId, { page: 1, pageSize: 50 });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Routes</h1>
          <Link href="/operator/routes/new"><Button>+ Add Route</Button></Link>
        </div>
        <div className="space-y-3">
          {routes.length === 0 && <p className="text-slate-400 text-center py-12">No routes yet. Add your first route.</p>}
          {routes.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold">{r.origin} → {r.destination}</p>
                  <p className="text-sm text-slate-500">
                    {r.distanceKm ? `${r.distanceKm} km · ` : ""}{r.durationMin ? `${Math.floor(r.durationMin / 60)}h ${r.durationMin % 60}m` : ""}
                  </p>
                </div>
                <Badge variant={r.isActive ? "default" : "secondary"}>{r.isActive ? "Active" : "Inactive"}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
