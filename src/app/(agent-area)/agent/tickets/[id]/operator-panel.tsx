"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Building2, ShieldCheck, ShieldAlert, Eye, Pencil, ArrowLeft, CheckCircle2, MapPin, ArrowRight, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface OperatorSummary {
  id: string;
  name: string;
  urid: string;
  status: string;
  description: string | null;
  logoUrl: string | null;
  contactEmail: string;
  contactPhone: string | null;
  address: string | null;
  city: string | null;
}

interface RouteSummary { id: string; origin: string; destination: string; isActive: boolean }
interface OfferLevelSummary {
  level: string; title: string; discountType: string;
  percentage: number | null; flatAmountMinor: number | null; maxCapMinor: number | null;
  groupBonusPerHead: number; groupBonusMaxHeads: number;
}
interface AgentIdentity { fullName: string; urid: string | null }

const LEVEL_LABEL: Record<string, string> = { LEVEL_1: "Level 1", LEVEL_2: "Level 2", LEVEL_3: "Level 3", LEVEL_4: "Level 4" };

function discountText(o: OfferLevelSummary) {
  if (o.discountType === "PERCENTAGE" && o.percentage) return `${o.percentage}% off`;
  if (o.discountType === "FLAT" && o.flatAmountMinor) return `₹${(o.flatAmountMinor / 100).toFixed(0)} off`;
  return "—";
}

const BASIC_DETAIL_FIELDS = [
  { key: "contactEmail", label: "Contact email" },
  { key: "contactPhone", label: "Contact phone" },
  { key: "city", label: "City" },
  { key: "address", label: "Address" },
  { key: "description", label: "Description" },
] as const;

const EDITABLE_FIELDS = [
  { key: "name", label: "Company name" },
  { key: "contactEmail", label: "Contact email" },
  { key: "contactPhone", label: "Contact phone" },
  { key: "city", label: "City" },
  { key: "address", label: "Address" },
  { key: "description", label: "Description" },
] as const;
type FieldKey = (typeof EDITABLE_FIELDS)[number]["key"];

type Step = "verify" | "unlocked" | "view" | "edit" | "summary" | "resolved";

const fade = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.2 },
};

export function OperatorPanel({ ticketId, ticketNumber }: { ticketId: string; ticketNumber: string | null }) {
  const [operator, setOperator] = useState<OperatorSummary | null | undefined>(undefined);
  const [routes, setRoutes] = useState<RouteSummary[]>([]);
  const [offerLevels, setOfferLevels] = useState<OfferLevelSummary[]>([]);
  const [agent, setAgent] = useState<AgentIdentity | null>(null);

  const [step, setStep] = useState<Step>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(`agent:verified:${ticketId}`) === "1" ? "unlocked" : "verify";
    }
    return "verify";
  });
  const [verifyUrid, setVerifyUrid] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyFailed, setVerifyFailed] = useState(false);

  const [form, setForm] = useState<Record<string, string>>({});
  const [resolutionComments, setResolutionComments] = useState("");
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<{ key: FieldKey; label: string; from: string; to: string }[]>([]);
  const [result, setResult] = useState<{ auditReference: string; ticketNumber: string } | null>(null);

  function load() {
    fetch(`/api/agent/tickets/${ticketId}/operator`)
      .then((r) => r.json())
      .then((json) => {
        setOperator(json.data?.operator ?? null);
        setRoutes(json.data?.routes ?? []);
        setOfferLevels(json.data?.offerLevels ?? []);
      })
      .catch(() => setOperator(null));
  }

  useEffect(load, [ticketId]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((json) => { const u = json.data?.user; if (u) setAgent({ fullName: u.fullName, urid: u.urid }); })
      .catch(() => {});
  }, []);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = verifyUrid.trim().toUpperCase();
    if (!trimmed) return;
    setVerifying(true);
    setVerifyFailed(false);
    const res = await fetch(`/api/agent/tickets/${ticketId}/verify-operator`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urid: trimmed }),
    });
    const json = await res.json();
    setVerifying(false);
    if (res.ok && json.data?.verified) {
      sessionStorage.setItem(`agent:verified:${ticketId}`, "1");
      setStep("unlocked");
    } else {
      setVerifyFailed(true);
    }
  }

  function startEdit() {
    if (!operator) return;
    setForm({
      name: operator.name,
      contactEmail: operator.contactEmail,
      contactPhone: operator.contactPhone ?? "",
      city: operator.city ?? "",
      address: operator.address ?? "",
      description: operator.description ?? "",
    });
    setResolutionComments("");
    setStep("edit");
  }

  function goToSummary(e: React.FormEvent) {
    e.preventDefault();
    if (!operator) return;
    if (resolutionComments.trim().length < 10) {
      toast.error("Resolution comments must be at least 10 characters");
      return;
    }
    const diffs = EDITABLE_FIELDS
      .map(({ key, label }) => {
        const from = (operator[key as keyof OperatorSummary] ?? "") as string;
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
    if (!operator) return;
    setSaving(true);
    const payload: Record<string, string> = { resolutionComments: resolutionComments.trim() };
    for (const c of changes) payload[c.key] = c.to;
    const res = await fetch(`/api/agent/tickets/${ticketId}/operator`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setSaving(false);
    if (res.ok) {
      setResult({ auditReference: json.data.auditReference, ticketNumber: json.data.ticketNumber });
      sessionStorage.removeItem(`agent:verified:${ticketId}`);
      setStep("resolved");
      load();
    } else {
      toast.error(json.error?.message ?? "Failed to save changes");
    }
  }

  if (operator === undefined) return null;
  if (operator === null) {
    return (
      <div className="shrink-0 border-b border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-500">
        No operator attached to this ticket yet.
      </div>
    );
  }

  return (
    <div className="shrink-0 border-b border-slate-800 bg-slate-900/60 px-4 py-3">
      <AnimatePresence mode="wait">
        {step === "verify" && (
          <motion.div key="verify" {...fade} className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Building2 className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Entity Type <strong className="text-slate-200">Operator</strong></span>
              <span className="text-slate-600">·</span>
              <span>Entity URID <strong className="font-mono text-slate-200">{operator.urid}</strong></span>
            </div>
            <form onSubmit={handleVerify} className="flex items-center gap-2">
              <input
                value={verifyUrid}
                onChange={(e) => { setVerifyUrid(e.target.value.toUpperCase()); setVerifyFailed(false); }}
                placeholder="Re-type the URID above to verify"
                maxLength={13}
                className={cn(
                  "flex-1 max-w-[260px] h-8 rounded-md border bg-slate-800 px-2 text-xs font-mono tracking-widest text-white placeholder:text-slate-600 placeholder:tracking-normal focus:outline-none focus:ring-1",
                  verifyFailed ? "border-red-600 focus:ring-red-500" : "border-slate-700 focus:ring-blue-500",
                )}
              />
              <button
                type="submit"
                disabled={verifying || !verifyUrid.trim()}
                className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
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
              Verified Operator <strong>{operator.name}</strong>
              <span className="ml-2 font-mono text-xs text-slate-400">{operator.urid}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep("view")} className="flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors">
                <Eye className="h-3 w-3" /> View Profile
              </button>
              <button onClick={startEdit} className="flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors">
                <Pencil className="h-3 w-3" /> Edit Profile
              </button>
            </div>
          </motion.div>
        )}

        {step === "view" && (
          <motion.div key="view" {...fade} className="space-y-4">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Basic details</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                {BASIC_DETAIL_FIELDS.map(({ key, label }) => (
                  <div key={key}>
                    <p className="text-slate-500">{label}</p>
                    <p className="text-slate-200">{(operator[key as keyof OperatorSummary] as string) || "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Routes ({routes.length})</p>
              {routes.length === 0 ? <p className="text-xs text-slate-500">No routes yet.</p> : (
                <div className="space-y-1">
                  {routes.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 text-xs">
                      <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                      <span className="text-slate-200">{r.origin}</span>
                      <ArrowRight className="h-3 w-3 text-slate-600 shrink-0" />
                      <span className="text-slate-200">{r.destination}</span>
                      <span className={cn("ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase", r.isActive ? "bg-green-600/20 text-green-400" : "bg-slate-700 text-slate-400")}>
                        {r.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Loyalty levels</p>
              {offerLevels.length === 0 ? <p className="text-xs text-slate-500">No loyalty levels configured.</p> : (
                <div className="space-y-1">
                  {offerLevels.map((o) => (
                    <div key={o.level} className="flex items-center gap-2 text-xs">
                      <Gift className="h-3 w-3 text-slate-500 shrink-0" />
                      <span className="text-slate-300 w-16 shrink-0">{LEVEL_LABEL[o.level] ?? o.level}</span>
                      <span className="text-slate-200 truncate">{o.title}</span>
                      <span className="ml-auto font-semibold text-slate-200 shrink-0">{discountText(o)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={startEdit} className="flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors">
              <Pencil className="h-3 w-3" /> Edit Profile
            </button>
          </motion.div>
        )}

        {step === "edit" && (
          <motion.form key="edit" {...fade} onSubmit={goToSummary} className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              {EDITABLE_FIELDS.map(({ key, label }) => (
                <div key={key} className={cn(key === "description" || key === "address" ? "col-span-2" : "")}>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">{label}</label>
                  <input
                    value={form[key] ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full h-8 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Resolution comments (required, min 10 chars)</label>
              <input
                value={resolutionComments}
                onChange={(e) => setResolutionComments(e.target.value)}
                placeholder="e.g. Updated operator contact information after verification"
                className="w-full h-8 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors">
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
              <div><p className="text-slate-500 uppercase text-[10px] font-semibold">Entity</p><p className="text-slate-200">Operator · {operator.name}</p></div>
              <div><p className="text-slate-500 uppercase text-[10px] font-semibold">Support Agent</p><p className="text-slate-200">{agent?.fullName ?? "—"}</p></div>
              <div><p className="text-slate-500 uppercase text-[10px] font-semibold">Support Agent URID</p><p className="font-mono text-slate-200">{agent?.urid ?? "—"}</p></div>
              <div><p className="text-slate-500 uppercase text-[10px] font-semibold">Operator URID</p><p className="font-mono text-slate-200">{operator.urid}</p></div>
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
