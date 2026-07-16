import { requireRole } from "@/lib/auth/session";
import { operatorRepository } from "@/repositories/operator.repository";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { OperatorStatusButton } from "./operator-status-button";
import type { OperatorStatus } from "@prisma/client";

const STATUS_TABS = ["ALL", "PENDING", "ACTIVE", "SUSPENDED"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const TAB_LABEL: Record<StatusTab, string> = {
  ALL: "All",
  PENDING: "Pending",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
};

export default async function AdminOperatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("ADMIN");
  const { status: statusParam } = await searchParams;
  const selected: StatusTab = STATUS_TABS.includes(statusParam as StatusTab)
    ? (statusParam as StatusTab)
    : "ALL";

  // Fetch everything once — the operator directory is small enough that
  // filtering/counting in memory (same pattern as the admin support page)
  // avoids a round-trip per tab while keeping counts accurate regardless of
  // which tab is currently selected.
  const [allOperators] = await operatorRepository.list({ page: 1, pageSize: 200 });

  const counts: Record<StatusTab, number> = {
    ALL: allOperators.length,
    PENDING: allOperators.filter((o) => o.status === "PENDING").length,
    ACTIVE: allOperators.filter((o) => o.status === "ACTIVE").length,
    SUSPENDED: allOperators.filter((o) => o.status === "SUSPENDED").length,
  };

  const operators = selected === "ALL" ? allOperators : allOperators.filter((o) => o.status === selected);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Operators</h1>
        <p className="text-sm text-muted-foreground">{counts.ALL} total</p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab}
            href={tab === "ALL" ? "/admin/operators" : `/admin/operators?status=${tab}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              selected === tab
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            {TAB_LABEL[tab]}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                selected === tab ? "bg-white/20" : "bg-muted",
              )}
            >
              {counts[tab]}
            </span>
          </Link>
        ))}
      </div>

      {operators.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground/30" />
            <p className="font-medium">
              {selected === "ALL" ? "No operators yet" : `No ${TAB_LABEL[selected].toLowerCase()} operators`}
            </p>
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
                <OperatorStatusButton operatorId={o.id} operatorName={o.name} status={o.status as OperatorStatus} />
                <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
