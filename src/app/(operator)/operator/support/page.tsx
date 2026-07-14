import { requireOperator } from "@/lib/auth/session";
import { supportTicketRepository } from "@/repositories/support-ticket.repository";
import { operatorRepository } from "@/repositories/operator.repository";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Inbox, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { RaiseTicketDialog } from "./raise-ticket-dialog";

const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  RESOLVED: "bg-green-50 text-green-700 border-green-200",
  CLOSED: "bg-muted text-muted-foreground",
};

const PRIORITY_DOT: Record<string, string> = {
  LOW: "bg-slate-400",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

export default async function OperatorSupportPage() {
  const { operatorId } = await requireOperator();
  const [tickets, operator] = await Promise.all([
    supportTicketRepository.listByOperator(operatorId),
    operatorRepository.findById(operatorId),
  ]);

  const open = tickets.filter((t) => t.status === "OPEN").length;
  const urgent = tickets.filter((t) => t.priority === "URGENT").length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 space-y-6">
      <Link href="/operator/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Support Tickets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complaints and queries about your account, plus anything you raise yourself.
          </p>
        </div>
        {operator && <RaiseTicketDialog urid={operator.urid} />}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: tickets.length, color: "text-foreground" },
          { label: "Open", value: open, color: "text-blue-600" },
          { label: "Urgent", value: urgent, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 text-center">
            <p className={cn("text-3xl font-black", s.color)}>{s.value}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground/30" />
          <p className="font-semibold text-foreground">No tickets yet</p>
          <p className="text-sm text-muted-foreground">Complaints filed against your service will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/support/tickets/${t.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-3 min-w-0">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{t.ticketNumber}</span>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", STATUS_STYLE[t.status])}>
                      {t.status.replace("_", " ")}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      <span className={cn("h-2 w-2 rounded-full", PRIORITY_DOT[t.priority])} />
                      {t.priority}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.user.fullName} &middot; {new Date(t.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{t._count.messages} msg{t._count.messages !== 1 ? "s" : ""}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
