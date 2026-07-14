import { requireAgent } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Ticket, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

function ticketNumber(seq: number) {
  return `TKT-${String(seq).padStart(5, "0")}`;
}

const PRIORITY_DOT: Record<string, string> = {
  LOW: "bg-slate-400",
  MEDIUM: "bg-blue-400",
  HIGH: "bg-orange-400",
  URGENT: "bg-red-400 animate-pulse",
};

export default async function AgentDashboardPage() {
  const { userId, role } = await requireAgent();

  const where = role === "ADMIN" ? {} : { assignedAgentId: userId };

  const [open, inProgress, resolved, recent] = await Promise.all([
    prisma.serviceTicket.count({ where: { ...where, status: "OPEN" } }),
    prisma.serviceTicket.count({ where: { ...where, status: "IN_PROGRESS" } }),
    prisma.serviceTicket.count({ where: { ...where, status: "RESOLVED" } }),
    prisma.serviceTicket.findMany({
      where: { ...where, status: { in: ["OPEN", "IN_PROGRESS"] } },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      take: 10,
      include: { user: { select: { fullName: true } } },
    }),
  ]);

  const stats = [
    { label: "Open", value: open, icon: AlertCircle, color: "text-blue-400", bg: "bg-blue-600/10 border-blue-600/20" },
    { label: "In Progress", value: inProgress, icon: Clock, color: "text-amber-400", bg: "bg-amber-600/10 border-amber-600/20" },
    { label: "Resolved", value: resolved, icon: CheckCircle, color: "text-green-400", bg: "bg-green-600/10 border-green-600/20" },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Agent Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Your support queue overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={cn("rounded-xl border p-5", s.bg)}>
            <s.icon className={cn("h-5 w-5 mb-3", s.color)} />
            <p className={cn("text-3xl font-black", s.color)}>{s.value}</p>
            <p className="text-sm font-medium text-slate-300 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {recent.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-white mb-3">Active tickets</h2>
          <div className="space-y-2">
            {recent.map((t) => (
              <Link
                key={t.id}
                href={`/agent/tickets/${t.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                    <Ticket className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">{ticketNumber(t.ticketSeq)}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <span className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_DOT[t.priority])} />
                        {t.priority}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white truncate">{t.subject}</p>
                    <p className="text-xs text-slate-400">{t.user.fullName}</p>
                  </div>
                </div>
                <span className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                  t.status === "OPEN" ? "bg-blue-600/20 text-blue-400" : "bg-amber-600/20 text-amber-400"
                )}>
                  {t.status.replace("_", " ")}
                </span>
              </Link>
            ))}
          </div>
          <Link href="/agent/tickets" className="mt-3 inline-block text-xs text-blue-400 hover:text-blue-300 hover:underline">
            View all →
          </Link>
        </div>
      )}

      {recent.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-800 py-16 text-center">
          <Ticket className="mx-auto h-10 w-10 text-slate-600 mb-3" />
          <p className="text-slate-300 font-semibold">No active tickets</p>
          <p className="text-slate-500 text-sm mt-1">Go online to start receiving tickets.</p>
        </div>
      )}
    </div>
  );
}
