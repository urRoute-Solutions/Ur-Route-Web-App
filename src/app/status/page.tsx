import { prisma } from "@/lib/prisma";
import { CheckCircle, AlertTriangle, XCircle, Wrench, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const revalidate = 60;

// ── types ──────────────────────────────────────────────────────────────────

type Health = "OPERATIONAL" | "DEGRADED" | "PARTIAL_OUTAGE" | "MAJOR_OUTAGE" | "MAINTENANCE";
type IStatus = "INVESTIGATING" | "IDENTIFIED" | "MONITORING" | "RESOLVED";
type Impact = "MINOR" | "MAJOR" | "CRITICAL";

// ── color / label maps ────────────────────────────────────────────────────

const HEALTH_BAR: Record<Health, string> = {
  OPERATIONAL:   "bg-emerald-500",
  DEGRADED:      "bg-yellow-400",
  PARTIAL_OUTAGE:"bg-orange-400",
  MAJOR_OUTAGE:  "bg-red-500",
  MAINTENANCE:   "bg-blue-400",
};

const HEALTH_DOT: Record<Health, string> = {
  OPERATIONAL:   "bg-emerald-500",
  DEGRADED:      "bg-yellow-400",
  PARTIAL_OUTAGE:"bg-orange-400",
  MAJOR_OUTAGE:  "bg-red-500",
  MAINTENANCE:   "bg-blue-400",
};

const HEALTH_LABEL: Record<Health, string> = {
  OPERATIONAL:   "Operational",
  DEGRADED:      "Degraded Performance",
  PARTIAL_OUTAGE:"Partial Outage",
  MAJOR_OUTAGE:  "Major Outage",
  MAINTENANCE:   "Under Maintenance",
};

const INCIDENT_STATUS_LABEL: Record<IStatus, string> = {
  INVESTIGATING: "Investigating",
  IDENTIFIED:    "Identified",
  MONITORING:    "Monitoring",
  RESOLVED:      "Resolved",
};

const IMPACT_STYLE: Record<Impact, string> = {
  MINOR:    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  MAJOR:    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

// ── helpers ────────────────────────────────────────────────────────────────

function overallHealth(services: { currentStatus: Health }[]): Health {
  if (services.some((s) => s.currentStatus === "MAJOR_OUTAGE")) return "MAJOR_OUTAGE";
  if (services.some((s) => s.currentStatus === "PARTIAL_OUTAGE")) return "PARTIAL_OUTAGE";
  if (services.some((s) => s.currentStatus === "DEGRADED")) return "DEGRADED";
  if (services.some((s) => s.currentStatus === "MAINTENANCE")) return "MAINTENANCE";
  return "OPERATIONAL";
}

function Banner({ health, activeCount }: { health: Health; activeCount: number }) {
  const isOk = health === "OPERATIONAL";
  return (
    <div className={cn(
      "rounded-2xl px-6 py-8 flex items-center gap-4 border",
      isOk
        ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
        : health === "MAJOR_OUTAGE"
        ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
        : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
    )}>
      {isOk
        ? <CheckCircle className="h-8 w-8 text-emerald-500 shrink-0" />
        : health === "MAJOR_OUTAGE"
        ? <XCircle className="h-8 w-8 text-red-500 shrink-0" />
        : <AlertTriangle className="h-8 w-8 text-amber-500 shrink-0" />
      }
      <div>
        <p className={cn(
          "text-xl font-black",
          isOk ? "text-emerald-700 dark:text-emerald-300"
          : health === "MAJOR_OUTAGE" ? "text-red-700 dark:text-red-300"
          : "text-amber-700 dark:text-amber-300"
        )}>
          {isOk
            ? "All Systems Operational"
            : activeCount > 0
            ? `${activeCount} Active Incident${activeCount > 1 ? "s" : ""}`
            : HEALTH_LABEL[health]}
        </p>
        <p className={cn(
          "text-sm mt-0.5",
          isOk ? "text-emerald-600/70 dark:text-emerald-400/70" : "text-muted-foreground"
        )}>
          {isOk
            ? "No incidents reported. All services are running normally."
            : "Our team is aware and actively working on a resolution."}
        </p>
      </div>
    </div>
  );
}

// 90-day history bar for one service
function UptimeBar({ stats }: { stats: { date: Date; status: Health }[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build map: date-string → status
  const byDate = new Map(
    stats.map((s) => [s.date.toISOString().split("T")[0], s.status]),
  );

  const days = Array.from({ length: 90 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (89 - i));
    const key = d.toISOString().split("T")[0]!;
    return { key, status: (byDate.get(key) ?? null) as Health | null };
  });

  return (
    <div className="flex items-end gap-px">
      {days.map(({ key, status }) => (
        <div
          key={key}
          title={`${key}: ${status ? HEALTH_LABEL[status] : "No data"}`}
          className={cn(
            "h-7 w-full rounded-sm transition-all hover:opacity-80",
            status ? HEALTH_BAR[status] : "bg-muted/40",
          )}
        />
      ))}
    </div>
  );
}

// ── page ───────────────────────────────────────────────────────────────────

export default async function StatusPage() {
  const ninetyAgo = new Date();
  ninetyAgo.setDate(ninetyAgo.getDate() - 89);

  const [services, activeIncidents, pastIncidents] = await Promise.all([
    prisma.statusService.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        dailyStats: {
          where: { date: { gte: ninetyAgo } },
          orderBy: { date: "asc" },
          select: { date: true, status: true },
        },
      },
    }),
    prisma.statusIncident.findMany({
      where: { status: { not: "RESOLVED" } },
      orderBy: { createdAt: "desc" },
      include: {
        updates: { orderBy: { createdAt: "desc" } },
        services: { include: { service: { select: { name: true } } } },
      },
    }),
    prisma.statusIncident.findMany({
      where: {
        status: "RESOLVED",
        resolvedAt: { gte: new Date(Date.now() - 30 * 86400000) },
      },
      orderBy: { resolvedAt: "desc" },
      take: 10,
      include: {
        updates: { orderBy: { createdAt: "asc" } },
        services: { include: { service: { select: { name: true } } } },
      },
    }),
  ]);

  const health = services.length > 0 ? overallHealth(services as { currentStatus: Health }[]) : "OPERATIONAL";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-border bg-white dark:bg-slate-900">
        <div className="container max-w-3xl flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-xs font-black text-white">u</span>
            </div>
            <span className="font-black text-foreground text-[15px]">urRoute</span>
            <span className="text-muted-foreground text-sm font-medium ml-1">Status</span>
          </Link>
          <span className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
      </header>

      <main className="container max-w-3xl py-10 space-y-8">
        {/* Overall banner */}
        <Banner health={health} activeCount={activeIncidents.length} />

        {/* Active incidents */}
        {activeIncidents.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Active Incidents</h2>
            {activeIncidents.map((inc) => (
              <div key={inc.id} className="rounded-xl border border-orange-200 dark:border-orange-900 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-orange-100 dark:border-orange-900/40 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", IMPACT_STYLE[inc.impact as Impact])}>
                        {inc.impact}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {inc.services.map((s) => s.service.name).join(", ")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-foreground">{inc.title}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-orange-600 dark:text-orange-400">
                    {INCIDENT_STATUS_LABEL[inc.status as IStatus]}
                  </span>
                </div>
                <div className="px-5 py-3 space-y-3">
                  {inc.updates.map((u) => (
                    <div key={u.id} className="text-sm">
                      <span className="font-semibold text-foreground">{INCIDENT_STATUS_LABEL[u.status as IStatus]} — </span>
                      <span className="text-muted-foreground">{u.body}</span>
                      <span className="ml-2 text-[11px] text-muted-foreground/60">
                        {new Date(u.createdAt).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Services */}
        {services.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <Info className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Status services not yet configured.</p>
            <p className="text-xs text-muted-foreground mt-1">Admin: visit /admin/status to seed services.</p>
          </div>
        ) : (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Services</h2>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500 inline-block" /> Operational</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-yellow-400 inline-block" /> Degraded</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-500 inline-block" /> Outage</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-muted/40 inline-block" /> No data</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white dark:bg-slate-900 overflow-hidden divide-y divide-border">
              {services.map((svc) => (
                <div key={svc.id} className="px-5 py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", HEALTH_DOT[svc.currentStatus as Health])} />
                      <span className="text-sm font-semibold text-foreground">{svc.name}</span>
                      {svc.description && (
                        <span className="hidden sm:inline text-xs text-muted-foreground">{svc.description}</span>
                      )}
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      svc.currentStatus === "OPERATIONAL" ? "text-emerald-600 dark:text-emerald-400" :
                      svc.currentStatus === "MAJOR_OUTAGE" ? "text-red-600 dark:text-red-400" :
                      "text-amber-600 dark:text-amber-400"
                    )}>
                      {HEALTH_LABEL[svc.currentStatus as Health]}
                    </span>
                  </div>
                  <UptimeBar stats={svc.dailyStats as { date: Date; status: Health }[]} />
                  <div className="flex justify-between text-[10px] text-muted-foreground/50">
                    <span>90 days ago</span>
                    <span>Today</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Past incidents */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">Incident History</h2>
          {pastIncidents.length === 0 ? (
            <div className="rounded-xl border border-border bg-white dark:bg-slate-900 px-5 py-8 text-center">
              <CheckCircle className="mx-auto h-7 w-7 text-emerald-400 mb-2" />
              <p className="text-sm font-medium text-foreground">No incidents in the last 30 days</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastIncidents.map((inc) => (
                <details key={inc.id} className="group rounded-xl border border-border bg-white dark:bg-slate-900 overflow-hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 hover:bg-muted/30 transition-colors list-none">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="text-sm font-semibold text-foreground truncate">{inc.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase", IMPACT_STYLE[inc.impact as Impact])}>
                        {inc.impact}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {inc.resolvedAt
                          ? new Date(inc.resolvedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </span>
                      <Wrench className="h-3.5 w-3.5 text-muted-foreground group-open:hidden" />
                    </div>
                  </summary>
                  <div className="border-t border-border px-5 py-4 space-y-3">
                    {inc.updates.map((u) => (
                      <div key={u.id} className="text-sm border-l-2 border-muted pl-3">
                        <span className="font-semibold text-foreground">{INCIDENT_STATUS_LABEL[u.status as IStatus]}</span>
                        <span className="ml-1 text-[11px] text-muted-foreground">
                          {new Date(u.createdAt).toLocaleString("en-IN")}
                        </span>
                        <p className="text-muted-foreground mt-0.5">{u.body}</p>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground pt-1">
                      Affected: {inc.services.map((s) => s.service.name).join(", ")}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          <p>urRoute Status · Updates every minute · <Link href="/" className="hover:underline">Back to urRoute</Link></p>
        </footer>
      </main>
    </div>
  );
}
