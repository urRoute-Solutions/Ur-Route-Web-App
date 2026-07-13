"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Ticket, RefreshCw, Inbox, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QueueTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  isBotHandled: boolean;
  createdAt: string;
  user: { fullName: string; email: string };
  assignedAgent: { fullName: string } | null;
  _count: { messages: number };
}

const PRIORITY_ORDER: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const PRIORITY_DOT: Record<string, string> = {
  LOW: "bg-slate-500",
  MEDIUM: "bg-blue-400",
  HIGH: "bg-orange-400",
  URGENT: "bg-red-400 animate-pulse",
};

function TicketRow({ t, href }: { t: QueueTicket; href: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 px-4 py-4 hover:bg-slate-800 hover:border-slate-700 transition-all"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 w-9 h-9 rounded-lg bg-blue-600/15 flex items-center justify-center shrink-0">
          <Ticket className="h-4 w-4 text-blue-400" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="text-xs font-mono text-slate-500">{t.ticketNumber}</span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <span className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_DOT[t.priority])} />
              {t.priority}
            </span>
            {t.isBotHandled && (
              <span className="rounded-full bg-purple-600/20 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300">
                BOT
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-white truncate">{t.subject}</p>
          <p className="text-xs text-slate-400">{t.user.fullName} · {t.user.email}</p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <span className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
          t.status === "OPEN" ? "bg-blue-600/20 text-blue-400" : "bg-amber-600/20 text-amber-400"
        )}>
          {t.status.replace("_", " ")}
        </span>
        <p className="mt-1 text-[10px] text-slate-500">{t._count.messages} msg</p>
      </div>
    </Link>
  );
}

export default function AgentTicketsPage() {
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [unclaimed, setUnclaimed] = useState<QueueTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    const res = await fetch("/api/support/agent/queue");
    if (res.ok) {
      const json = await res.json();
      setTickets(json.data?.tickets ?? []);
      setUnclaimed(json.data?.unclaimed ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  async function claimTicket(ticketId: string) {
    setClaiming(ticketId);
    const res = await fetch(`/api/support/tickets/${ticketId}/claim`, { method: "POST" });
    setClaiming(null);
    if (res.ok) {
      toast.success("Ticket claimed — it's now in your queue");
      fetchQueue();
    } else {
      toast.error("Could not claim ticket");
    }
  }

  const sorted = [...tickets].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
  );

  return (
    <div className="p-6 max-w-3xl">
      {/* My Queue */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">My Queue</h1>
            <p className="text-sm text-slate-400 mt-0.5">Live — refreshes every 5 seconds</p>
          </div>
          <button
            onClick={fetchQueue}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl border border-slate-800 bg-slate-900 animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center">
            <Inbox className="mx-auto h-10 w-10 text-slate-600 mb-3" />
            <p className="text-slate-300 font-semibold">Queue is empty</p>
            <p className="text-slate-500 text-sm mt-1">
              New tickets assigned to you will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((t) => (
              <TicketRow key={t.id} t={t} href={`/agent/tickets/${t.id}`} />
            ))}
          </div>
        )}
      </div>

      {/* Unclaimed tickets (bot-handled, no agent assigned) */}
      {!loading && unclaimed.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-purple-400" />
            <h2 className="text-sm font-bold text-slate-300">Unclaimed — handled by bot</h2>
            <span className="rounded-full bg-purple-600/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
              {unclaimed.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            These tickets were answered by the bot while no agent was available. Click Claim to take over.
          </p>
          <div className="space-y-2">
            {unclaimed.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-purple-600/10 flex items-center justify-center shrink-0">
                    <Ticket className="h-3.5 w-3.5 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-slate-500">{t.ticketNumber}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <span className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_DOT[t.priority])} />
                        {t.priority}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{t.subject}</p>
                    <p className="text-xs text-slate-400">{t.user.fullName} · {t.user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => claimTicket(t.id)}
                  disabled={claiming === t.id}
                  className="shrink-0 rounded-lg bg-purple-600/20 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-600/40 transition-colors disabled:opacity-50"
                >
                  {claiming === t.id ? "Claiming…" : "Claim"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
