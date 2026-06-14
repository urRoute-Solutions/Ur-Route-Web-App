"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bot, User, Headphones, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  senderRole: string;
  body: string;
  createdAt: string;
}

interface Meta {
  status: string;
  agentName: string | null;
  isBotHandled: boolean;
}

interface Props {
  ticketId: string;
  initialMessages: Message[];
  initialMeta: Meta;
}

const ROLE_LABEL: Record<string, string> = {
  USER: "You",
  AGENT: "Support Agent",
  ADMIN: "Support Agent",
  BOT: "Support Bot",
  SYSTEM: "",
  OPERATOR: "Operator",
};

export function LiveChat({ ticketId, initialMessages, initialMeta }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [meta, setMeta] = useState<Meta>(initialMeta);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const lastTimestampRef = useRef<string | null>(
    initialMessages.length > 0 ? initialMessages[initialMessages.length - 1]!.createdAt : null,
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  const poll = useCallback(async () => {
    const url = `/api/support/tickets/${ticketId}/messages${lastTimestampRef.current ? `?after=${encodeURIComponent(lastTimestampRef.current)}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const json = await res.json();
    const newMsgs: Message[] = json.data?.messages ?? [];
    if (newMsgs.length > 0) {
      setMessages((prev) => [...prev, ...newMsgs]);
      lastTimestampRef.current = newMsgs[newMsgs.length - 1]!.createdAt;
    }
    if (json.data?.meta) setMeta(json.data.meta);
  }, [ticketId]);

  useEffect(() => {
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [poll]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    const res = await fetch(`/api/support/tickets/${ticketId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim() }),
    });
    setSending(false);
    if (res.ok) {
      setBody("");
      await poll();
    } else {
      toast.error("Failed to send. Try again.");
    }
  }

  const isClosed = meta.status === "RESOLVED" || meta.status === "CLOSED";

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Connection bar */}
      <div className={cn(
        "flex items-center gap-2.5 px-4 py-3 border-b border-border text-sm font-medium",
        meta.agentName && !meta.isBotHandled
          ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
          : isClosed
          ? "bg-muted text-muted-foreground"
          : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
      )}>
        {meta.agentName && !meta.isBotHandled ? (
          <>
            <Headphones className="h-4 w-4 shrink-0" />
            <span>Connected to <strong>{meta.agentName}</strong></span>
            <span className="ml-auto h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </>
        ) : isClosed ? (
          <>
            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            Ticket {meta.status.toLowerCase()}
          </>
        ) : (
          <>
            <Bot className="h-4 w-4 shrink-0" />
            <span>Waiting for a support agent…</span>
            <span className="ml-auto h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 py-4 space-y-4 min-h-[260px] max-h-[420px]">
        {messages.map((msg) => {
          const isUser = msg.senderRole === "USER";
          const isSystem = msg.senderRole === "SYSTEM";
          const isBot = msg.senderRole === "BOT";

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-[11px] text-muted-foreground bg-muted rounded-full px-3 py-1">
                  {msg.body}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                isUser ? "bg-primary" : isBot ? "bg-purple-600" : "bg-slate-600 dark:bg-slate-500"
              )}>
                {isUser ? <User className="h-3.5 w-3.5 text-white" /> : isBot ? <Bot className="h-3.5 w-3.5 text-white" /> : <Headphones className="h-3.5 w-3.5 text-white" />}
              </div>
              <div className={cn("max-w-[80%] flex flex-col", isUser ? "items-end" : "items-start")}>
                <span className={cn("text-[10px] font-semibold mb-1", isUser ? "text-primary" : "text-muted-foreground")}>
                  {ROLE_LABEL[msg.senderRole] ?? msg.senderRole}
                </span>
                <div className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  isUser
                    ? "rounded-tr-sm bg-primary text-primary-foreground"
                    : isBot
                    ? "rounded-tl-sm bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-foreground"
                    : "rounded-tl-sm bg-muted border border-border text-foreground"
                )}>
                  {msg.body}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isClosed ? (
        <form onSubmit={send} className="border-t border-border p-3 flex items-end gap-2">
          <textarea
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e as unknown as React.FormEvent); } }}
            placeholder="Type a message…"
            className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!body.trim() || sending}
            className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <div className="border-t border-border p-3 text-center text-xs text-muted-foreground">
          This ticket is {meta.status.toLowerCase()}. Open a new ticket if you need further help.
        </div>
      )}
    </div>
  );
}
