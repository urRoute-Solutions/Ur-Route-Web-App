"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Ticket, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function AgentTicketsPage() {
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    const res = await fetch("/api/support/agent/queue");
    if (res.ok) {
      const json = await res.json();
      setTickets(json.data?.tickets ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">My Queue</h1>
          <p className="text-sm text-slate-400 mt-0.5">Live — refreshes every 5 seconds</p>
        </div>
        <button onClick={fetchQueue} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-slate-800 bg-slate-900 animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 py-16 text-center">
          <Ticket className="mx-auto h-10 w-10 text-slate-600 mb-3" />
          <p className="text-slate-300 font-semibold">Queue is empty</p>
          <p className="text-slate-500 text-sm mt-1">New tickets will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/agent/tickets/${t.id}`}
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
          ))}
        </div>
      )}
    </div>
  );
}
