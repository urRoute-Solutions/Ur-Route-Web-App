import { requireAdmin } from "@/lib/auth/session";
import { supportTicketRepository } from "@/repositories/support-ticket.repository";
import Link from "next/link";
import { StatusUpdater } from "./status-updater";
import { SeedKnowledgeBase } from "./seed-button";
import { MessageSquare, Inbox, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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
  URGENT: "bg-red-500 animate-pulse",
};

const CATEGORY_LABEL: Record<string, string> = {
  BOOKING: "Booking",
  CANCELLATION_REFUND: "Refund",
  LOYALTY_REWARDS: "Rewards",
  PAYMENT: "Payment",
  OPERATOR_COMPLAINT: "Complaint",
  OTHER: "Other",
};

export default async function AdminSupportPage() {
  await requireAdmin();
  const tickets = await supportTicketRepository.listAll();

  const byStatus = {
    OPEN: tickets.filter((t) => t.status === "OPEN").length,
    IN_PROGRESS: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    RESOLVED: tickets.filter((t) => t.status === "RESOLVED").length,
    CLOSED: tickets.filter((t) => t.status === "CLOSED").length,
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black">Support — All Tickets</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage all customer support tickets.</p>
        </div>
        <SeedKnowledgeBase />
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-4">
        {(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const).map((s) => (
          <div key={s} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-black text-foreground">{byStatus[s]}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.replace("_", " ")}</p>
          </div>
        ))}
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground/30" />
          <p className="font-semibold">No tickets yet</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                {["Ticket", "User", "Subject", "Category", "Priority", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/support/tickets/${t.id}`} className="font-mono text-xs font-semibold text-primary hover:underline">
                      {t.ticketNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-foreground">{t.user.fullName}</p>
                    <p className="text-[11px] text-muted-foreground">{t.user.email}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="truncate text-xs font-medium text-foreground">{t.subject}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(t.createdAt).toLocaleDateString("en-IN")}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold">
                      {CATEGORY_LABEL[t.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      <span className={cn("h-2 w-2 rounded-full", PRIORITY_DOT[t.priority])} />
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase", STATUS_STYLE[t.status])}>
                      {t.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusUpdater ticketId={t.id} current={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
