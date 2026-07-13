import { requireRole } from "@/lib/auth/session";
import { operatorRepository } from "@/repositories/operator.repository";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ActivateOperatorButton } from "./activate-operator-button";

export default async function AdminOperatorsPage() {
  await requireRole("ADMIN");
  const [operators, total] = await operatorRepository.list({ page: 1, pageSize: 50 });

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Operators</h1>
        <p className="text-sm text-muted-foreground">{total} total</p>
      </div>

      {operators.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground/30" />
            <p className="font-medium">No operators yet</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {operators.map((o) => (
          <Card key={o.id}>
            <CardContent className="flex items-center justify-between py-4 px-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{o.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.slug} · {o.city ?? "—"} · {o.contactEmail} · <span className="font-mono">{o.urid}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={o.status === "ACTIVE" ? "default" : o.status === "PENDING" ? "secondary" : "destructive"}>
                  {o.status}
                </Badge>
                {o.status === "PENDING" && <ActivateOperatorButton operatorId={o.id} />}
                <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
