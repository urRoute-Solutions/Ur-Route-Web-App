import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { IncidentForm } from "./incident-form";
import { UpdateIncidentForm } from "./update-form";
import { SeedStatusButton } from "./seed-button";

type Health = "OPERATIONAL" | "DEGRADED" | "PARTIAL_OUTAGE" | "MAJOR_OUTAGE" | "MAINTENANCE";

const HEALTH_STYLE: Record<Health, string> = {
  OPERATIONAL:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  DEGRADED:       "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300",
  PARTIAL_OUTAGE: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  MAJOR_OUTAGE:   "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  MAINTENANCE:    "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
};

const HEALTH_DOT: Record<Health, string> = {
  OPERATIONAL:    "bg-emerald-500",
  DEGRADED:       "bg-yellow-400",
  PARTIAL_OUTAGE: "bg-orange-400",
  MAJOR_OUTAGE:   "bg-red-500",
  MAINTENANCE:    "bg-blue-400",
};

export default async function AdminStatusPage() {
  await requireAdmin();

  const [services, activeIncidents, recentResolved] = await Promise.all([
    prisma.statusService.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.statusIncident.findMany({
      where: { status: { not: "RESOLVED" } },
      orderBy: { createdAt: "desc" },
      include: {
        updates: { orderBy: { createdAt: "desc" } },
        services: { include: { service: { select: { name: true } } } },
      },
    }),
    prisma.statusIncident.findMany({
      where: { status: "RESOLVED" },
      orderBy: { resolvedAt: "desc" },
      take: 5,
      include: {
        services: { include: { service: { select: { name: true } } } },
      },
    }),
  ]);

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black">Status Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage incidents and service status shown on the{" "}
            <Link href="/status" target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
              public status page <ExternalLink className="h-3 w-3" />
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SeedStatusButton />
          <IncidentForm services={services} />
        </div>
      </div>

      {/* Services grid */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Services</h2>
        {services.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-10 text-center space-y-3">
            <p className="text-sm text-muted-foreground">No services configured yet.</p>
            <p className="text-xs text-muted-foreground">Click "Seed / Reset Services" above to initialise the 8 default services with 90-day history.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {services.map((svc) => (
              <div key={svc.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", HEALTH_DOT[svc.currentStatus as Health])} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{svc.name}</p>
                    {svc.description && <p className="text-[11px] text-muted-foreground truncate">{svc.description}</p>}
                  </div>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase shrink-0", HEALTH_STYLE[svc.currentStatus as Health])}>
                  {svc.currentStatus.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active incidents */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Active Incidents</h2>
        {activeIncidents.length === 0 ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">No active incidents</p>
          </div>
        ) : (
          activeIncidents.map((inc) => (
            <div key={inc.id} className="rounded-xl border border-orange-200 dark:border-orange-900 bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-xs font-semibold text-orange-600">{inc.impact}</span>
                      <span className="text-xs text-muted-foreground">→ {inc.status.replace("_", " ")}</span>
                      <span className="text-xs text-muted-foreground">
                        {inc.services.map((s) => s.service.name).join(", ")}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-foreground">{inc.title}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {new Date(inc.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
              <div className="px-5 py-3 space-y-2">
                {inc.updates.slice(0, 3).map((u) => (
                  <p key={u.id} className="text-xs text-muted-foreground border-l-2 border-muted pl-2">
                    <strong className="text-foreground">{u.status}</strong> — {u.body}
                  </p>
                ))}
                <UpdateIncidentForm incidentId={inc.id} currentStatus={inc.status} />
              </div>
            </div>
          ))
        )}
      </section>

      {/* Recent resolved */}
      {recentResolved.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recently Resolved</h2>
          {recentResolved.map((inc) => (
            <div key={inc.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <p className="text-sm text-foreground truncate">{inc.title}</p>
                <span className="text-xs text-muted-foreground shrink-0">
                  {inc.services.map((s) => s.service.name).join(", ")}
                </span>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {inc.resolvedAt ? new Date(inc.resolvedAt).toLocaleDateString("en-IN") : "—"}
              </span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
