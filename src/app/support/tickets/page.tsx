import { requireAuth } from "@/lib/auth/session";
import { supportTicketRepository } from "@/repositories/support-ticket.repository";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, ChevronRight, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  RESOLVED: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300",
  CLOSED: "bg-muted text-muted-foreground",
};

const PRIORITY_DOT: Record<string, string> = {
  LOW: "bg-slate-400",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

const CATEGORY_LABEL: Record<string, string> = {
  BOOKING: "Booking",
  CANCELLATION_REFUND: "Cancellation / Refund",
  LOYALTY_REWARDS: "Loyalty Rewards",
  PAYMENT: "Payment",
  OPERATOR_COMPLAINT: "Operator Complaint",
  OTHER: "General",
};

export default async function MyTicketsPage() {
  const { userId } = await requireAuth();
  const tickets = await supportTicketRepository.listByUser(userId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <div className="container max-w-3xl py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground">My Support Tickets</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track the status of your support requests.
            </p>
          </div>
          <Button variant="action" size="sm" asChild>
            <Link href="/dashboard">Open support chat ↗</Link>
          </Button>
        </div>

        {tickets.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
              <Ticket className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="font-semibold text-foreground">No tickets yet</p>
            <p className="text-sm text-muted-foreground">
              Use the chat widget on any page to raise a support request.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <Link
                key={t.id}
                href={`/support/tickets/${t.id}`}
                className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-muted-foreground">
                        {t.ticketNumber}
                      </span>
                      <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", STATUS_STYLE[t.status])}>
                        {t.status.replace("_", " ")}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className={cn("h-2 w-2 rounded-full", PRIORITY_DOT[t.priority])} />
                        {t.priority}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {CATEGORY_LABEL[t.category]} &middot; {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
