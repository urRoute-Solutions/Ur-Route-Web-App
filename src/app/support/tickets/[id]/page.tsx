import { requireAuth } from "@/lib/auth/session";
import { supportTicketRepository } from "@/repositories/support-ticket.repository";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReplyForm } from "./reply-form";

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

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId, role } = await requireAuth();
  const { id } = await params;
  const ticket = await supportTicketRepository.getById(id);

  if (!ticket) notFound();
  if (role === "TRAVELER" && ticket.userId !== userId) notFound();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <div className="container max-w-2xl py-10">
        {/* Back */}
        <Link
          href="/support/tickets"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> My tickets
        </Link>

        {/* Ticket header */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-mono font-semibold text-muted-foreground">
                {ticket.ticketNumber}
              </p>
              <h1 className="mt-1 text-xl font-black text-foreground">{ticket.subject}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <span className={cn("h-2 w-2 rounded-full", PRIORITY_DOT[ticket.priority])} />
                {ticket.priority}
              </span>
              <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", STATUS_STYLE[ticket.status])}>
                {ticket.status.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span>Category: <strong className="text-foreground">{ticket.category.replace("_", " ")}</strong></span>
            {ticket.subCategory && <span>Issue: <strong className="text-foreground">{ticket.subCategory}</strong></span>}
            {ticket.bookingRef && <span>Ref: <strong className="font-mono text-foreground">{ticket.bookingRef}</strong></span>}
            <span>Opened: <strong className="text-foreground">{new Date(ticket.createdAt).toLocaleString("en-IN")}</strong></span>
          </div>
        </div>

        {/* Message thread */}
        <div className="mt-4 space-y-3">
          {ticket.messages.map((msg) => {
            const isUser = msg.senderRole === "USER";
            return (
              <div key={msg.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                <div className="max-w-[85%]">
                  <p className={cn("mb-1 text-[10px] font-semibold uppercase tracking-wider", isUser ? "text-right text-primary" : "text-muted-foreground")}>
                    {isUser ? "You" : msg.senderRole}
                  </p>
                  <div className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                    isUser ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-card border border-border text-foreground"
                  )}>
                    {msg.body}
                  </div>
                  <p className={cn("mt-1 text-[10px] text-muted-foreground", isUser ? "text-right" : "")}>
                    {new Date(msg.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply — only if not closed */}
        {ticket.status !== "CLOSED" && ticket.status !== "RESOLVED" && (
          <div className="mt-6">
            <ReplyForm ticketId={ticket.id} />
          </div>
        )}

        {(ticket.status === "RESOLVED" || ticket.status === "CLOSED") && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
            This ticket is {ticket.status.toLowerCase()}. Raise a new ticket if you have a different issue.
          </div>
        )}
      </div>
    </div>
  );
}
