"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  User as UserIcon,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Pencil,
  ArrowLeft,
  CheckCircle2,
  Ticket,
  ExternalLink,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface UserSummary {
  id: string;
  fullName: string;
  urid: string | null;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  walletBalanceMinor: number;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
}

interface BookingSummary {
  id: string;
  pnr: string;
  status: string;
  totalFareMinor: number;
  createdAt: string;
}
interface AgentIdentity { fullName: string; urid: string | null }

const BASIC_DETAIL_FIELDS = [
  { key: "fullName", label: "Name" },
  { key: "urid", label: "URID" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
] as const;

const EDITABLE_FIELDS = [
  { key: "fullName", label: "Full name" },
  { key: "phone", label: "Phone" },
] as const;
type FieldKey = (typeof EDITABLE_FIELDS)[number]["key"];

type Step = "verify" | "unlocked" | "view" | "edit" | "summary" | "resolved";

const fade = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.2 },
};

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "text-green-400",
  CANCELLED: "text-red-400",
  PENDING: "text-yellow-400",
  COMPLETED: "text-slate-400",
};

const VERIFY_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function verifiedKey(ticketId: string) {
  return `agent:verified:${ticketId}`;
}
function isVerified(ticketId: string): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(verifiedKey(ticketId));
  if (!raw) return false;
  return Date.now() - parseInt(raw, 10) < VERIFY_TTL_MS;
}
function markVerified(ticketId: string) {
  localStorage.setItem(verifiedKey(ticketId), Date.now().toString());
}
function clearVerified(ticketId: string) {
  localStorage.removeItem(verifiedKey(ticketId));
}

export function UserPanel({ ticketId, ticketNumber }: { ticketId: string; ticketNumber: string | null }) {
  const [subjectUser, setSubjectUser] = useState<UserSummary | null | undefined>(undefined);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [agent, setAgent] = useState<AgentIdentity | null>(null);

  // Persist verification for 8 hours in localStorage so re-mounting/new tabs don't re-ask
  const [step, setStep] = useState<Step>(() => isVerified(ticketId) ? "unlocked" : "verify");
  const [verifyUrid, setVerifyUrid] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyFailed, setVerifyFailed] = useState(false);

  const [form, setForm] = useState<Record<string, string>>({});
  const [resolutionComments, setResolutionComments] = useState("");
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<{ key: FieldKey; label: string; from: string; to: string }[]>([]);
  const [result, setResult] = useState<{ auditReference: string; ticketNumber: string } | null>(null);

  function load() {
    fetch(`/api/agent/tickets/${ticketId}/user`)
      .then((r) => r.json())
      .then((json) => {
        setSubjectUser(json.data?.user ?? null);
        setBookings(json.data?.recentBookings ?? []);
      })
      .catch(() => setSubjectUser(null));
  }

  useEffect(load, [ticketId]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((json) => {
        const u = json.data?.user;
        if (u) setAgent({ fullName: u.fullName, urid: u.urid });
      })
      .catch(() => {});
  }, []);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = verifyUrid.trim().toUpperCase();
    if (!trimmed) return;
    setVerifying(true);
    setVerifyFailed(false);
    const res = await fetch(`/api/agent/tickets/${ticketId}/verify-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urid: trimmed }),
    });
    const json = await res.json();
    setVerifying(false);
    if (res.ok && json.data?.verified) {
      markVerified(ticketId);
      setStep("unlocked");
    } else {
      setVerifyFailed(true);
    }
  }

  function startEdit() {
    if (!subjectUser) return;
    setForm({ fullName: subjectUser.fullName, phone: subjectUser.phone ?? "" });
    setResolutionComments("");
    setStep("edit");
  }

  function goToSummary(e: React.FormEvent) {
    e.preventDefault();
    if (!subjectUser) return;
    if (resolutionComments.trim().length < 10) {
      toast.error("Resolution comments must be at least 10 characters");
      return;
    }
    const diffs = EDITABLE_FIELDS
      .map(({ key, label }) => {
        const from = (subjectUser[key as keyof UserSummary] ?? "") as string;
        const to = form[key] ?? "";
        return { key, label, from, to };
      })
      .filter((d) => d.from !== d.to);
    if (diffs.length === 0) {
      toast.error("No fields were changed");
      return;
    }
    setChanges(diffs);
    setStep("summary");
  }

  async function confirmAndResolve() {
    if (!subjectUser) return;
    setSaving(true);
    const payload: Record<string, string> = { resolutionComments: resolutionComments.trim() };
    for (const c of changes) payload[c.key] = c.to;
    const res = await fetch(`/api/agent/tickets/${ticketId}/user`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setSaving(false);
    if (res.ok) {
      setResult({ auditReference: json.data.auditReference, ticketNumber: json.data.ticketNumber });
      clearVerified(ticketId);
      setStep("resolved");
      load();
    } else {
      toast.error(json.error?.message ?? "Failed to save changes");
    }
  }

  if (subjectUser === undefined) return null;
  if (subjectUser === null) {
    return (
      <div className="shrink-0 border-b border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-500">
        No user attached to this ticket yet.
      </div>
    );
  }

  const displayedBookings = showAllBookings ? bookings : bookings.slice(0, 3);

  return (
    <div className="shrink-0 border-b border-slate-800 bg-slate-900/60 px-4 py-3">
      <AnimatePresence mode="wait">
        {step === "verify" && (
          <motion.div key="verify" {...fade} className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <UserIcon className="h-4 w-4 text-purple-400 shrink-0" />
              <span>Entity Type <strong className="text-slate-200">User</strong></span>
              <span className="text-slate-600">·</span>
              <span>Entity URID <strong className="font-mono text-slate-200">{subjectUser.urid}</strong></span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300 font-medium">{subjectUser.fullName}</span>
            </div>
            <form onSubmit={handleVerify} className="flex items-center gap-2">
              <input
                value={verifyUrid}
                onChange={(e) => { setVerifyUrid(e.target.value.toUpperCase()); setVerifyFailed(false); }}
                placeholder="Re-type the URID above to verify"
                maxLength={13}
                className={cn(
                  "flex-1 max-w-[260px] h-8 rounded-md border bg-slate-800 px-2 text-xs font-mono tracking-widest text-white placeholder:text-slate-600 placeholder:tracking-normal focus:outline-none focus:ring-1",
                  verifyFailed ? "border-red-600 focus:ring-red-500" : "border-slate-700 focus:ring-purple-500",
                )}
              />
              <button
                type="submit"
                disabled={verifying || !verifyUrid.trim()}
                className="flex items-center gap-1 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
              >
                <ShieldCheck className="h-3 w-3" /> {verifying ? "Verifying…" : "Verify"}
              </button>
            </form>
            {verifyFailed && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                Verification Failed — the entered URID does not match the entity associated with this ticket.
              </p>
            )}
          </motion.div>
        )}

        {step === "unlocked" && (
          <motion.div key="unlocked" {...fade} className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-green-600/20 px-2 py-0.5 text-[10px] font-bold uppercase text-green-400">
                <CheckCircle2 className="h-3 w-3" /> Verification Successful
              </span>
            </div>
            <div className="text-sm text-slate-200">
              Verified User <strong>{subjectUser.fullName}</strong>
              <span className="ml-2 font-mono text-xs text-slate-400">{subjectUser.urid}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setStep("view")} className="flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors">
                <Eye className="h-3 w-3" /> Quick View
              </button>
              <button onClick={startEdit} className="flex items-center gap-1 rounded-md bg-purple-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 transition-colors">
                <Pencil className="h-3 w-3" /> Edit Profile
              </button>
              <Link
                href={`/agent/users/${subjectUser.id}`}
                className="flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                <UserIcon className="h-3 w-3" /> Full Profile
              </Link>
            </div>
          </motion.div>
        )}

        {step === "view" && (
          <motion.div key="view" {...fade} className="space-y-3">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Account details</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                {BASIC_DETAIL_FIELDS.map(({ key, label }) => (
                  <div key={key}>
                    <p className="text-slate-500">{label}</p>
                    <p className="text-slate-200 font-mono text-[11px] break-all">{(subjectUser[key as keyof UserSummary] as string) || "—"}</p>
                  </div>
                ))}
                <div>
                  <p className="text-slate-500">Wallet</p>
                  <p className="text-green-400 font-semibold">₹{(subjectUser.walletBalanceMinor / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Member since</p>
                  <p className="text-slate-200">{new Date(subjectUser.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">
                  Bookings ({bookings.length})
                </p>
                <button
                  onClick={load}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  title="Refresh bookings"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>
              {bookings.length === 0 ? (
                <p className="text-xs text-slate-500">No bookings yet.</p>
              ) : (
                <div className="space-y-1">
                  {displayedBookings.map((b) => (
                    <div key={b.id} className="flex items-center gap-2 text-xs rounded-md bg-slate-800/50 px-2 py-1.5">
                      <Ticket className="h-3 w-3 text-slate-500 shrink-0" />
                      <span className="font-mono text-slate-200 text-[10px]">{b.pnr}</span>
                      <span className="text-slate-400 text-[10px]">₹{(b.totalFareMinor / 100).toFixed(0)}</span>
                      <span className={cn("ml-auto text-[9px] font-bold uppercase shrink-0", STATUS_COLORS[b.status] ?? "text-slate-400")}>
                        {b.status}
                      </span>
                      <Link
                        href={`/agent/bookings/${b.id}`}
                        className="shrink-0 text-slate-500 hover:text-blue-400 transition-colors"
                        title="View booking detail"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                  {bookings.length > 3 && (
                    <button
                      onClick={() => setShowAllBookings((v) => !v)}
                      className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {showAllBookings ? "Show less" : `Show all ${bookings.length} bookings`}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={startEdit} className="flex items-center gap-1 rounded-md bg-purple-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 transition-colors">
                <Pencil className="h-3 w-3" /> Edit Profile
              </button>
              <Link
                href={`/agent/users/${subjectUser.id}`}
                className="flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                <UserIcon className="h-3 w-3" /> Full Profile
              </Link>
              <button onClick={() => setStep("unlocked")} className="rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors">
                Back
              </button>
            </div>
          </motion.div>
        )}

        {step === "edit" && (
          <motion.form key="edit" {...fade} onSubmit={goToSummary} className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              {EDITABLE_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">{label}</label>
                  <input
                    value={form[key] ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full h-8 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Resolution comments (required, min 10 chars)</label>
              <input
                value={resolutionComments}
                onChange={(e) => setResolutionComments(e.target.value)}
                placeholder="e.g. Updated phone number after verification"
                className="w-full h-8 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="rounded-md bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 transition-colors">
                Save Changes
              </button>
              <button type="button" onClick={() => setStep("unlocked")} className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors">
                Cancel
              </button>
            </div>
          </motion.form>
        )}

        {step === "summary" && (
          <motion.div key="summary" {...fade} className="space-y-3">
            <p className="text-sm font-bold text-white">Changes Summary</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div><p className="text-slate-500 uppercase text-[10px] font-semibold">Ticket Number</p><p className="font-mono text-slate-200">{ticketNumber ?? "—"}</p></div>
              <div><p className="text-slate-500 uppercase text-[10px] font-semibold">Entity</p><p className="text-slate-200">User · {subjectUser.fullName}</p></div>
              <div><p className="text-slate-500 uppercase text-[10px] font-semibold">Support Agent</p><p className="text-slate-200">{agent?.fullName ?? "—"}</p></div>
              <div><p className="text-slate-500 uppercase text-[10px] font-semibold">Support Agent URID</p><p className="font-mono text-slate-200">{agent?.urid ?? "—"}</p></div>
              <div><p className="text-slate-500 uppercase text-[10px] font-semibold">User URID</p><p className="font-mono text-slate-200">{subjectUser.urid}</p></div>
            </div>
            <div>
              <p className="text-slate-500 uppercase text-[10px] font-semibold mb-1">Fields Updated</p>
              <div className="space-y-1">
                {changes.map((c) => (
                  <div key={c.key} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-300 w-32 shrink-0">{c.label}</span>
                    <span className="text-slate-500 line-through">{c.from || "(empty)"}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-slate-100 font-semibold">{c.to}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-slate-500 uppercase text-[10px] font-semibold">Resolution</p>
              <p className="text-xs text-slate-200">{resolutionComments}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep("edit")} className="flex items-center gap-1 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors">
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <button onClick={confirmAndResolve} disabled={saving} className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500 disabled:opacity-50 transition-colors">
                {saving ? "Resolving…" : "Confirm & Resolve"}
              </button>
            </div>
          </motion.div>
        )}

        {step === "resolved" && result && (
          <motion.div key="resolved" {...fade} className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-sm font-bold text-green-400">
              <CheckCircle2 className="h-4 w-4" /> Ticket <span className="font-mono">{result.ticketNumber}</span> Successfully Resolved
            </p>
            <p className="text-xs text-slate-400">Audit Log Created — Reference <span className="font-mono text-slate-200">{result.auditReference}</span></p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
