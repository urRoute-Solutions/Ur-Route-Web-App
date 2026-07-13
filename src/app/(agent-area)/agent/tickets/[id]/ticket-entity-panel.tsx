"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Link2 } from "lucide-react";
import { OperatorPanel } from "./operator-panel";
import { UserPanel } from "./user-panel";

type SubjectType = "OPERATOR" | "USER" | null;

export function TicketEntityPanel({ ticketId }: { ticketId: string }) {
  const [subjectType, setSubjectType] = useState<SubjectType | undefined>(undefined);
  const [urid, setUrid] = useState("");
  const [attaching, setAttaching] = useState(false);

  function load() {
    fetch(`/api/support/tickets/${ticketId}`)
      .then((r) => r.json())
      .then((json) => setSubjectType(json.data?.ticket?.subjectEntityType ?? null))
      .catch(() => setSubjectType(null));
  }

  useEffect(load, [ticketId]);

  async function handleAttach(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = urid.trim().toUpperCase();
    if (!trimmed) return;
    setAttaching(true);
    const res = await fetch(`/api/agent/tickets/${ticketId}/link-entity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urid: trimmed }),
    });
    const json = await res.json();
    setAttaching(false);
    if (res.ok) {
      toast.success(`${json.data.entityType === "OPERATOR" ? "Operator" : "User"} attached to ticket`);
      load();
    } else {
      toast.error(json.error?.message ?? "URID not found");
    }
  }

  if (subjectType === undefined) return null;

  if (subjectType === null) {
    return (
      <div className="shrink-0 border-b border-slate-800 bg-slate-900/60 px-4 py-3">
        <form onSubmit={handleAttach} className="flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-500 shrink-0" />
          <span className="text-xs text-slate-400 shrink-0">No entity attached —</span>
          <input
            value={urid}
            onChange={(e) => setUrid(e.target.value.toUpperCase())}
            placeholder="URID e.g. OPR-STBKNTY or USR-VDGZNWW"
            maxLength={13}
            className="flex-1 max-w-[280px] h-8 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs font-mono tracking-widest text-white placeholder:text-slate-600 placeholder:tracking-normal focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={attaching || !urid.trim()}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            <Link2 className="h-3 w-3" /> {attaching ? "Attaching…" : "Attach"}
          </button>
        </form>
      </div>
    );
  }

  return subjectType === "OPERATOR" ? <OperatorPanel ticketId={ticketId} /> : <UserPanel ticketId={ticketId} />;
}
