import { requireOperator } from "@/lib/auth/session";
import { routeRepository } from "@/repositories/route.repository";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Plus, ArrowRight } from "lucide-react";

export default async function OperatorRoutesPage() {
  const { operatorId } = await requireOperator();
  const [routes, total] = await routeRepository.listByOperator(operatorId, { page: 1, pageSize: 50 });

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Routes</h1>
        <Link href="/operator/routes/new">
          <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add route</Button>
        </Link>
      </div>

      {routes.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <MapPin className="h-10 w-10 mx-auto text-muted-foreground/30" />
            <p className="font-medium">No routes yet</p>
            <p className="text-sm text-muted-foreground">Add your first route to start publishing trips.</p>
            <Link href="/operator/routes/new"><Button variant="outline">+ Add route</Button></Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {routes.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex items-center justify-between py-4 px-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm">
                    {r.origin} <ArrowRight className="h-3 w-3 text-muted-foreground" /> {r.destination}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.distanceKm ? `${r.distanceKm} km` : ""}{r.durationMin ? ` · Est. ${Math.floor(r.durationMin / 60)}h ${r.durationMin % 60}m` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={r.isActive ? "default" : "secondary"}>{r.isActive ? "Active" : "Inactive"}</Badge>
                <Link href={`/operator/routes/${r.id}`} className="text-xs text-primary hover:underline">Edit</Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {total > 50 && <p className="text-sm text-center text-muted-foreground">Showing 50 of {total}</p>}
      </div>
    </div>
  );
}
