"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Search, Link2, UserSearch, X } from "lucide-react";
import { OperatorPanel } from "./operator-panel";
import { UserPanel } from "./user-panel";

type SubjectType = "OPERATOR" | "USER" | null;

interface UserHit {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  urid: string | null;
}

export function TicketEntityPanel({ ticketId }: { ticketId: string }) {
  const [subjectType, setSubjectType] = useState<SubjectType | undefined>(undefined);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [urid, setUrid] = useState("");
  const [attaching, setAttaching] = useState(false);

  // Name search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  function load() {
    fetch(`/api/support/tickets/${ticketId}`)
      .then((r) => r.json())
      .then((json) => {
        setSubjectType(json.data?.ticket?.subjectEntityType ?? null);
        setTicketNumber(json.data?.ticket?.ticketNumber ?? null);
      })
      .catch(() => setSubjectType(null));
  }

  useEffect(load, [ticketId]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setShowResults(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/agent/users/search?q=${encodeURIComponent(value.trim())}`);
        const json = await res.json();
        setSearchResults(json.data?.users ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  async function attachUser(user: UserHit) {
    if (!user.urid) return;
    setShowResults(false);
    setSearchQuery(user.fullName);
    setAttaching(true);
    const res = await fetch(`/api/agent/tickets/${ticketId}/link-entity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urid: user.urid }),
    });
    const json = await res.json();
    setAttaching(false);
    if (res.ok) {
      toast.success(`User "${user.fullName}" attached to ticket`);
      load();
    } else {
      toast.error(json.error?.message ?? "Failed to attach user");
    }
  }

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
      <div className="shrink-0 border-b border-slate-800 bg-slate-900/60 px-4 py-3 space-y-3">
        {/* Name/email search */}
        <div ref={searchRef} className="relative">
          <div className="flex items-center gap-2">
            <UserSearch className="h-4 w-4 text-slate-500 shrink-0" />
            <span className="text-xs text-slate-400 shrink-0">Find user by name/email:</span>
            <div className="relative flex-1 max-w-[320px]">
              <input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                placeholder="Type name, email or USR-XXXXXXX"
                className="w-full h-8 rounded-md border border-slate-700 bg-slate-800 px-2 pr-6 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setSearchResults([]); setShowResults(false); }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            {searching && <span className="text-[10px] text-slate-500">Searching…</span>}
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="absolute left-24 top-9 z-50 w-80 rounded-md border border-slate-700 bg-slate-800 shadow-xl">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => attachUser(user)}
                  disabled={attaching}
                  className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-100 truncate">{user.fullName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[9px] text-slate-500">{user.urid}</span>
                </button>
              ))}
            </div>
          )}
          {showResults && searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
            <div className="absolute left-24 top-9 z-50 w-64 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-500 shadow-xl">
              No users found
            </div>
          )}
        </div>

        {/* URID direct attach (operators or known URIDs) */}
        <form onSubmit={handleAttach} className="flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-500 shrink-0" />
          <span className="text-xs text-slate-400 shrink-0">Or attach by URID:</span>
          <input
            value={urid}
            onChange={(e) => setUrid(e.target.value.toUpperCase())}
            placeholder="OPR-XXXXXXX or USR-XXXXXXX"
            maxLength={13}
            className="flex-1 max-w-[260px] h-8 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs font-mono tracking-widest text-white placeholder:text-slate-600 placeholder:tracking-normal focus:outline-none focus:ring-1 focus:ring-blue-500"
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

  return subjectType === "OPERATOR"
    ? <OperatorPanel ticketId={ticketId} ticketNumber={ticketNumber} />
    : <UserPanel ticketId={ticketId} ticketNumber={ticketNumber} />;
}
