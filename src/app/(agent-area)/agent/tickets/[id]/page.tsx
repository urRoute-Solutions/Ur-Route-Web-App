"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Bot, User, Wrench, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  senderRole: string;
  body: string;
  createdAt: string;
}

interface TicketMeta {
  subject?: string;
  status: string;
  assignedAgentId: string | null;
  isBotHandled: boolean;
  agentName: string | null;
  category?: string;
  priority?: string;
  user?: { fullName: string; email: string };
  ticketNumber?: string;
}

const ROLE_LABEL: Record<string, string> = {
  USER: "Customer",
  AGENT: "You",
  ADMIN: "Admin",
  BOT: "Bot",
  SYSTEM: "",
  OPERATOR: "Operator",
};

function MsgBubble({ msg }: { msg: Message }) {
  const isAgent = msg.senderRole === "AGENT" || msg.senderRole === "ADMIN";
  const isSystem = msg.senderRole === "SYSTEM";
  const isBot = msg.senderRole === "BOT";
  const isUser = msg.senderRole === "USER";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-slate-500 bg-slate-800/60 rounded-full px-3 py-1">{msg.body}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2.5", isAgent ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
        isAgent ? "bg-blue-600" : isBot ? "bg-purple-700" : "bg-slate-700"
      )}>
        {isAgent ? <User className="h-3.5 w-3.5 text-white" /> : isBot ? <Bot className="h-3.5 w-3.5 text-white" /> : <User className="h-3.5 w-3.5 text-slate-300" />}
      </div>
      <div className={cn("max-w-[72%]", isAgent ? "items-end" : "items-start", "flex flex-col")}>
        <span className={cn("text-[10px] font-semibold mb-1", isAgent ? "text-right text-blue-400" : "text-slate-400")}>
          {ROLE_LABEL[msg.senderRole] ?? msg.senderRole}
        </span>
        <div className={cn(
          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isAgent
            ? "rounded-tr-sm bg-blue-600 text-white"
            : isBot
            ? "rounded-tl-sm bg-purple-900/60 border border-purple-700/40 text-purple-100"
            : "rounded-tl-sm bg-slate-800 border border-slate-700 text-slate-100"
        )}>
          {msg.body}
        </div>
        <span className="text-[10px] text-slate-600 mt-1">
          {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

export default function AgentTicketPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [meta, setMeta] = useState<TicketMeta | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const lastTimestampRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initial load
  useEffect(() => {
    fetch(`/api/support/tickets/${id}`)
      .then((r) => r.json())
      .then((json) => {
        const t = json.data?.ticket;
        if (!t) return;
        setMeta({
          subject: t.subject,
          status: t.status,
          assignedAgentId: t.assignedAgentId,
          isBotHandled: t.isBotHandled,
          agentName: t.assignedAgent?.fullName ?? null,
          category: t.category,
          priority: t.priority,
          user: t.user,
          ticketNumber: t.ticketNumber,
        });
        setMessages(t.messages ?? []);
        if (t.messages?.length > 0) {
          lastTimestampRef.current = t.messages[t.messages.length - 1].createdAt;
        }
      });
  }, [id]);

  // Poll for new messages every 3 seconds
  const pollMessages = useCallback(async () => {
    const url = `/api/support/tickets/${id}/messages${lastTimestampRef.current ? `?after=${encodeURIComponent(lastTimestampRef.current)}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const json = await res.json();
    const newMsgs: Message[] = json.data?.messages ?? [];
    const newMeta = json.data?.meta;

    if (newMsgs.length > 0) {
      setMessages((prev) => [...prev, ...newMsgs]);
      lastTimestampRef.current = newMsgs[newMsgs.length - 1]!.createdAt;
    }
    if (newMeta) {
      setMeta((prev) => prev ? { ...prev, ...newMeta } : null);
    }
  }, [id]);

  useEffect(() => {
    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [pollMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    const res = await fetch(`/api/support/tickets/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim() }),
    });
    setSending(false);
    if (res.ok) {
      setBody("");
      inputRef.current?.focus();
      await pollMessages();
    } else {
      toast.error("Failed to send message");
    }
  }

  async function updateStatus(status: string) {
    const res = await fetch(`/api/support/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setMeta((m) => m ? { ...m, status } : null);
      toast.success(`Ticket marked as ${status.toLowerCase().replace("_", " ")}`);
      if (status === "RESOLVED" || status === "CLOSED") router.push("/agent/tickets");
    }
  }

  async function claimTicket() {
    setClaiming(true);
    const res = await fetch(`/api/support/tickets/${id}/claim`, { method: "POST" });
    setClaiming(false);
    if (res.ok) {
      toast.success("You've taken over this ticket");
      await pollMessages();
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="shrink-0 border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/agent/tickets" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-500">{meta?.ticketNumber}</span>
                {meta?.isBotHandled && (
                  <span className="rounded-full bg-purple-600/20 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300 flex items-center gap-1">
                    <Bot className="h-2.5 w-2.5" /> Bot handled
                  </span>
                )}
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase",
                  meta?.status === "OPEN" ? "bg-blue-600/20 text-blue-400" :
                  meta?.status === "IN_PROGRESS" ? "bg-amber-600/20 text-amber-400" :
                  "bg-green-600/20 text-green-400"
                )}>
                  {meta?.status?.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm font-semibold text-white truncate">{meta?.subject}</p>
              {meta?.user && (
                <p className="text-xs text-slate-400">{meta.user.fullName} · {meta.user.email}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {meta?.isBotHandled && (
              <button
                onClick={claimTicket}
                disabled={claiming}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                <Wrench className="h-3.5 w-3.5" />
                {claiming ? "Claiming…" : "Take over"}
              </button>
            )}
            {meta?.status !== "RESOLVED" && meta?.status !== "CLOSED" && (
              <button
                onClick={() => updateStatus("RESOLVED")}
                className="flex items-center gap-1.5 rounded-lg bg-green-700/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 transition-colors"
              >
                <CheckCircle className="h-3.5 w-3.5" /> Resolve
              </button>
            )}
            {meta?.status !== "CLOSED" && (
              <button
                onClick={() => updateStatus("CLOSED")}
                className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-600 transition-colors"
              >
                <XCircle className="h-3.5 w-3.5" /> Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
        {messages.map((msg) => <MsgBubble key={msg.id} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Reply input */}
      {meta?.status !== "RESOLVED" && meta?.status !== "CLOSED" ? (
        <form onSubmit={send} className="shrink-0 border-t border-slate-800 bg-slate-900 p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={2}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e as unknown as React.FormEvent); } }}
              placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
              className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!body.trim() || sending}
              className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="shrink-0 border-t border-slate-800 bg-slate-900 p-3 text-center text-xs text-slate-500">
          Ticket is {meta?.status?.toLowerCase()} — no further replies possible
        </div>
      )}
    </div>
  );
}
