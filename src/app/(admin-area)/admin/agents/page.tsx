import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getOnlineAgentIds } from "@/lib/agent-presence";
import { UserCheck, Headphones, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CreateAgentForm } from "./create-agent-form";

export default async function AdminAgentsPage() {
  await requireAdmin();

  const [agents, onlineIds] = await Promise.all([
    prisma.user.findMany({
      where: { role: "AGENT" },
      select: {
        id: true, fullName: true, email: true, isActive: true, lastLoginAt: true, createdAt: true,
        _count: { select: { agentTickets: { where: { status: { in: ["OPEN", "IN_PROGRESS"] } } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getOnlineAgentIds(),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black">Support Agents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage agents who handle customer support tickets.
          </p>
        </div>
        <CreateAgentForm />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-black text-foreground">{agents.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total agents</p>
        </div>
        <div className="rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 p-4 text-center">
          <p className="text-2xl font-black text-green-600 dark:text-green-400">{onlineIds.length}</p>
          <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-0.5">Online now</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-black text-foreground">
            {agents.reduce((sum, a) => sum + a._count.agentTickets, 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Open tickets</p>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Headphones className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="font-semibold">No agents yet</p>
          <p className="text-sm text-muted-foreground mt-1">Add your first support agent above.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                {["Agent", "Status", "Open tickets", "Last login", "Joined"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {agents.map((a) => {
                const isOnline = onlineIds.includes(a.id);
                return (
                  <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <UserCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{a.fullName}</p>
                          <p className="text-[11px] text-muted-foreground">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "flex items-center gap-1.5 text-xs font-semibold",
                        isOnline ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                      )}>
                        <span className={cn("h-2 w-2 rounded-full", isOnline ? "bg-green-500 animate-pulse" : "bg-slate-400")} />
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground font-medium">{a._count.agentTickets}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleDateString("en-IN") : "Never"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
