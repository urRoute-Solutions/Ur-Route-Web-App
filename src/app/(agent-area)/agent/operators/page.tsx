"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Building2, Search, MapPin, ArrowRight, BookOpen, Bus } from "lucide-react";

interface LookupResult {
  operator: {
    id: string;
    name: string;
    slug: string;
    urid: string;
    contactEmail: string;
    contactPhone: string | null;
    city: string | null;
    status: string;
    rating: number;
  };
  stats: { routes: number; trips: number; bookings: number };
  recentRoutes: { id: string; origin: string; destination: string; isActive: boolean }[];
  recentBookings: { id: string; pnr: string; status: string; totalFareMinor: number; createdAt: string }[];
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-green-600/20 text-green-400",
  PENDING: "bg-amber-600/20 text-amber-400",
  SUSPENDED: "bg-red-600/20 text-red-400",
};

export default function AgentOperatorLookupPage() {
  const [urid, setUrid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = urid.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await fetch(`/api/agent/operators/lookup?urid=${encodeURIComponent(trimmed)}`);
    const json = await res.json();
    setLoading(false);
    if (res.ok) {
      setResult(json.data);
    } else {
      setError(json.error?.message ?? "Operator not found");
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">Operator Lookup</h1>
        <p className="mt-1 text-sm text-slate-400">
          Paste the operator's URID from a ticket or incident to view a read-only account snapshot.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            value={urid}
            onChange={(e) => setUrid(e.target.value.toUpperCase())}
            placeholder="e.g. STBKNTY"
            maxLength={9}
            className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 text-sm font-mono tracking-widest text-white placeholder:text-slate-600 placeholder:tracking-normal focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !urid.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
        >
          <Search className="h-4 w-4" /> {loading ? "Looking up…" : "Look up"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-dashed border-slate-800 py-10 text-center">
          <Building2 className="mx-auto h-8 w-8 text-slate-600 mb-2" />
          <p className="text-slate-300 font-semibold">No operator found</p>
          <p className="text-slate-500 text-sm mt-1">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Identity */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{result.operator.name}</h2>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", STATUS_COLOR[result.operator.status] ?? "bg-slate-700 text-slate-300")}>
                    {result.operator.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {result.operator.slug} · URID <span className="font-mono">{result.operator.urid}</span>
                </p>
              </div>
              <p className="text-sm text-slate-300 shrink-0">★ {result.operator.rating.toFixed(1)}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 mt-4 text-sm text-slate-300">
              <p>{result.operator.contactEmail}</p>
              <p>{result.operator.contactPhone ?? "—"}</p>
              <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-500" /> {result.operator.city ?? "—"}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <MapPin className="h-4 w-4 text-blue-400 mb-2" />
              <p className="text-2xl font-black text-white">{result.stats.routes}</p>
              <p className="text-xs text-slate-400">Routes</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <Bus className="h-4 w-4 text-blue-400 mb-2" />
              <p className="text-2xl font-black text-white">{result.stats.trips}</p>
              <p className="text-xs text-slate-400">Trips</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <BookOpen className="h-4 w-4 text-blue-400 mb-2" />
              <p className="text-2xl font-black text-white">{result.stats.bookings}</p>
              <p className="text-xs text-slate-400">Bookings</p>
            </div>
          </div>

          {/* Recent routes */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2">Recent routes</h3>
            {result.recentRoutes.length === 0 ? (
              <p className="text-sm text-slate-500">No routes yet.</p>
            ) : (
              <div className="space-y-2">
                {result.recentRoutes.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm">
                    <span className="flex items-center gap-2 text-slate-200">
                      {r.origin} <ArrowRight className="h-3 w-3 text-slate-500" /> {r.destination}
                    </span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", r.isActive ? "bg-green-600/20 text-green-400" : "bg-slate-700 text-slate-400")}>
                      {r.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent bookings */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2">Recent bookings</h3>
            {result.recentBookings.length === 0 ? (
              <p className="text-sm text-slate-500">No bookings yet.</p>
            ) : (
              <div className="space-y-2">
                {result.recentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm"
                  >
                    <span className="font-mono text-slate-200">{b.pnr}</span>
                    <span className="text-slate-400">₹{(b.totalFareMinor / 100).toFixed(0)}</span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
