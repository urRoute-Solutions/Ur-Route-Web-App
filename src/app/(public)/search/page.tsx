"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Bus, ArrowRight, Star, ArrowLeftRight, SlidersHorizontal, X, Gift, Clock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TripSearchItem } from "@/usecases/trips/search-trips.usecase";

type SortKey = "price-asc" | "price-desc" | "duration";
type DepartureWindow = "morning" | "afternoon" | "evening" | "night";

const DEP_WINDOWS: { key: DepartureWindow; label: string; range: string }[] = [
  { key: "morning",   label: "Morning",   range: "6 – 12" },
  { key: "afternoon", label: "Afternoon", range: "12 – 18" },
  { key: "evening",   label: "Evening",   range: "18 – 22" },
  { key: "night",     label: "Night",     range: "22 – 6" },
];

function inWindow(iso: string, window: DepartureWindow) {
  const h = new Date(iso).getHours();
  if (window === "morning")   return h >= 6  && h < 12;
  if (window === "afternoon") return h >= 12 && h < 18;
  if (window === "evening")   return h >= 18 && h < 22;
  return h >= 22 || h < 6;
}

function PlaceInput({
  value, onChange, placeholder, places, icon,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  places: string[]; icon?: "origin" | "destination";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!value.trim()) return places.slice(0, 8);
    const q = value.toLowerCase();
    return places.filter((p) => p.toLowerCase().includes(q)).slice(0, 8);
  }, [value, places]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 min-w-[140px]">
      <MapPin className={cn(
        "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none",
        icon === "origin" ? "text-primary" : "text-muted-foreground"
      )} />
      <Input
        placeholder={placeholder} value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        className="pl-8 h-10 text-sm" required autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white dark:bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          {suggestions.map((place) => (
            <button key={place} type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(place); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-muted transition-colors",
                value === place && "bg-primary/5 text-primary font-semibold"
              )}>
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {place}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const LEVEL_META: Record<string, { tag: string; color: string; bg: string; ring: string; label: string }> = {
  LEVEL_1: { tag: "L1", label: "Level 1", color: "text-slate-700 dark:text-slate-300",  bg: "bg-slate-100 dark:bg-slate-800",    ring: "ring-slate-300 dark:ring-slate-600" },
  LEVEL_2: { tag: "L2", label: "Level 2", color: "text-blue-700 dark:text-blue-300",    bg: "bg-blue-50 dark:bg-blue-900/30",    ring: "ring-blue-300 dark:ring-blue-600" },
  LEVEL_3: { tag: "L3", label: "Level 3", color: "text-purple-700 dark:text-purple-300",bg: "bg-purple-50 dark:bg-purple-900/30", ring: "ring-purple-300 dark:ring-purple-600" },
  LEVEL_4: { tag: "L4", label: "Level 4", color: "text-amber-700 dark:text-amber-300",  bg: "bg-amber-50 dark:bg-amber-900/30",  ring: "ring-amber-300 dark:ring-amber-600" },
};

function discountText(o: TripOffer): string {
  if (o.discountType === "PERCENTAGE" && o.percentage) return `${o.percentage}% off every booking`;
  if (o.discountType === "FLAT" && o.flatAmountMinor) return `₹${(o.flatAmountMinor / 100).toFixed(0)} flat off every booking`;
  return "Special offer";
}

function OperatorAvatar({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  if (logoUrl) return <img src={logoUrl} alt={name} className="w-10 h-10 rounded-xl object-contain border border-border bg-white" />;
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
      <span className="text-xs font-extrabold text-white">{initials}</span>
    </div>
  );
}

function WaitlistButton({ tripId }: { tripId: string }) {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  async function join() {
    setLoading(true);
    const res = await fetch(`/api/trips/${tripId}/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seats: 1 }),
    });
    setLoading(false);
    if (res.status === 401) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    if (res.ok) {
      setJoined(true);
      toast.success("You're on the waitlist — we'll notify you if a seat opens.");
    } else {
      const j = await res.json();
      toast.error(j.error?.message ?? "Could not join waitlist");
    }
  }

  if (joined) return (
    <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
      <Clock className="h-4 w-4" /> On waitlist
    </div>
  );

  return (
    <Button variant="outline" size="lg" onClick={join} disabled={loading} className="font-semibold gap-2 px-6">
      <Clock className="h-4 w-4" /> {loading ? "Joining..." : "Join Waitlist"}
    </Button>
  );
}

function TripCard({ trip }: { trip: TripSearchItem }) {
  const dep = new Date(trip.departureAt);
  const arr = new Date(trip.arrivalAt);
  const durMins = Math.round((arr.getTime() - dep.getTime()) / 60000);
  const hours = Math.floor(durMins / 60);
  const mins  = durMins % 60;
  const depStr = dep.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  const arrStr = arr.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  const amenities = Array.isArray(trip.amenities) ? (trip.amenities as string[]) : [];
  const seatsLeft  = trip.availableSeats;
  const seatsTotal = trip.totalSeats;
  const seatsPct   = Math.round((seatsLeft / seatsTotal) * 100);
  const seatsUrgent = seatsLeft <= 5;

  return (
    <div className="bg-white dark:bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/20 transition-all">
      <div className="h-0.5 bg-gradient-to-r from-action via-action/60 to-transparent" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <OperatorAvatar name={trip.operator.name} logoUrl={trip.operator.logoUrl} />
            <div>
              <p className="font-bold text-sm">{trip.operator.name}</p>
              <p className="text-xs text-muted-foreground">
                {trip.seatType === "SLEEPER" ? "AC Sleeper" : "AC Seater"} · {trip.layout} · {trip.busName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{trip.operator.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="text-left">
            <p className="text-2xl font-extrabold tracking-tight">{depStr}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{trip.route.origin}</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <p className="text-xs font-semibold text-muted-foreground">{hours}h {mins}m</p>
            <div className="relative w-full flex items-center">
              <div className="h-px flex-1 bg-border" />
              <div className="mx-2 w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                <Bus className="h-2.5 w-2.5 text-primary" />
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>
            {trip.route.distanceKm && <p className="text-[10px] text-muted-foreground">{trip.route.distanceKm} km</p>}
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold tracking-tight">{arrStr}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{trip.route.destination}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className={cn("text-[11px] font-bold",
              seatsUrgent ? "text-red-600 dark:text-red-400" : seatsLeft <= 15 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
            )}>
              {seatsUrgent ? `Only ${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} left!` : `${seatsLeft} / ${seatsTotal} seats available`}
            </span>
            <span className="text-[11px] text-muted-foreground">{seatsPct}% free</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className={cn("h-full rounded-full transition-all",
              seatsUrgent ? "bg-red-500" : seatsLeft <= 15 ? "bg-amber-400" : "bg-emerald-500"
            )} style={{ width: `${seatsPct}%` }} />
          </div>
        </div>

        {amenities.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            {amenities.slice(0, 5).map((a) => (
              <span key={a} className="text-[11px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted/60 border border-border/50">{a}</span>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-border space-y-3">
          {trip.offers[0] && (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary/90 to-action px-4 py-3 flex items-center justify-between gap-3">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] animate-[shimmer_2.5s_infinite]" />
              <div>
                <div className="flex items-center gap-1.5">
                  <Gift className="h-3 w-3 text-white/80" />
                  <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Loyalty Deal</p>
                </div>
                <p className="text-white font-black text-2xl leading-tight">
                  {trip.offers[0].discountType === "PERCENTAGE"
                    ? `${trip.offers[0].percentage}% OFF`
                    : `₹${((trip.offers[0].flatAmountMinor ?? 0) / 100).toFixed(0)} OFF`}
                </p>
                <p className="text-white/70 text-[11px] mt-0.5">
                  {trip.offers[0].title}
                  {trip.offers[0].maxCapMinor ? ` · up to ₹${(trip.offers[0].maxCapMinor / 100).toFixed(0)}` : ""}
                  {trip.offers[0].groupBonusPerHead > 0 ? ` · +${trip.offers[0].groupBonusPerHead}% per guest` : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-white/60 text-[10px]">Sign in to unlock</p>
                <div className="flex items-center gap-1 mt-1">
                  {["L1","L2","L3","L4"].map((l, i) => (
                    <div key={l} className={`rounded-full text-[9px] font-black px-1.5 py-0.5 ${i === 0 ? "bg-white text-primary" : "bg-white/20 text-white/60"}`}>{l}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-extrabold text-foreground">₹{(trip.basePriceMinor / 100).toFixed(0)}</p>
              <p className="text-[10px] text-muted-foreground">per seat · before discount</p>
            </div>
            {seatsLeft > 0 ? (
              <Link href={`/book/${trip.id}`}>
                <Button variant="action" size="lg" className="font-black gap-2 px-8 text-base">
                  Book Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <WaitlistButton tripId={trip.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FavoriteRouteButton({
  origin, destination, favorites, onToggle,
}: {
  origin: string; destination: string;
  favorites: Set<string>; onToggle: (origin: string, destination: string, add: boolean) => void;
}) {
  const key = `${origin}|${destination}`;
  const isFav = favorites.has(key);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      if (isFav) {
        const r = await fetch(`/api/favorites/routes?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`, { method: "DELETE" });
        if (r.status === 401) { toast.error("Sign in to manage saved routes"); return; }
        onToggle(origin, destination, false);
        toast.success("Route removed from favourites");
      } else {
        const r = await fetch("/api/favorites/routes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin, destination }),
        });
        if (r.status === 401) { toast.error("Sign in to save routes"); return; }
        if (!r.ok) { const d = await r.json(); throw new Error(d.error?.message); }
        onToggle(origin, destination, true);
        toast.success("Route saved to favourites");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={toggle} disabled={busy} title={isFav ? "Remove from favourites" : "Save route"}
      className="p-1 rounded-full transition-colors hover:bg-muted">
      <Star className={cn("h-4 w-4 transition-colors", isFav ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40 hover:text-amber-400")} />
    </button>
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();

  const [origin, setOrigin]           = useState(searchParams.get("origin") ?? searchParams.get("from") ?? "");
  const [destination, setDestination] = useState(searchParams.get("destination") ?? searchParams.get("to") ?? "");
  const [date, setDate]               = useState(searchParams.get("date") ?? new Date().toISOString().slice(0, 10));

  const [results, setResults]   = useState<TripSearchItem[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [places, setPlaces]     = useState<{ origins: string[]; destinations: string[] }>({ origins: [], destinations: [] });
  const [favoriteRoutes, setFavoriteRoutes] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey]       = useState<SortKey>("price-asc");
  const [depWindows, setDepWindows] = useState<Set<DepartureWindow>>(new Set());
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetch("/api/places")
      .then((r) => r.json())
      .then((j) => { if (j.data) setPlaces(j.data); })
      .catch(() => {});

    // Silently skipped if not logged in (401 returns null)
    fetch("/api/favorites/routes")
      .then((r) => r.ok ? r.json() : null)
      .then((j) => {
        if (j?.data?.favorites) {
          setFavoriteRoutes(new Set(j.data.favorites.map((f: { origin: string; destination: string }) => `${f.origin}|${f.destination}`)));
        }
      })
      .catch(() => {});
  }, []);

  const handleFavToggle = useCallback((orig: string, dest: string, add: boolean) => {
    const key = `${orig}|${dest}`;
    setFavoriteRoutes((prev) => {
      const next = new Set(prev);
      add ? next.add(key) : next.delete(key);
      return next;
    });
  }, []);

  async function doSearch(org: string, dest: string, dt: string) {
    if (!org || !dest) return;
    setLoading(true);
    setSearched(true);
    const params = new URLSearchParams({ origin: org, destination: dest, date: dt, pageSize: "40" });
    const res  = await fetch(`/api/trips?${params}`);
    const json = await res.json();
    setResults(json.data?.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    const org  = searchParams.get("origin") ?? searchParams.get("from") ?? "";
    const dest = searchParams.get("destination") ?? searchParams.get("to") ?? "";
    const dt   = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    if (org && dest) doSearch(org, dest, dt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e: React.FormEvent) { e.preventDefault(); doSearch(origin, destination, date); }
  function handleSwap() { setOrigin(destination); setDestination(origin); }
  function toggleWindow(w: DepartureWindow) {
    setDepWindows((prev) => { const next = new Set(prev); if (next.has(w)) next.delete(w); else next.add(w); return next; });
  }

  const filtered = useMemo(() => {
    let arr = [...results];
    if (depWindows.size > 0) arr = arr.filter((t) => [...depWindows].some((w) => inWindow(t.departureAt, w)));
    if (sortKey === "price-asc")  arr.sort((a, b) => a.basePriceMinor - b.basePriceMinor);
    if (sortKey === "price-desc") arr.sort((a, b) => b.basePriceMinor - a.basePriceMinor);
    if (sortKey === "duration") arr.sort((a, b) => (new Date(a.arrivalAt).getTime() - new Date(a.departureAt).getTime()) - (new Date(b.arrivalAt).getTime() - new Date(b.departureAt).getTime()));
    return arr;
  }, [results, sortKey, depWindows]);

  const allPlaces = useMemo(() => [...new Set([...places.origins, ...places.destinations])].sort(), [places]);
  const filterCount = depWindows.size + (sortKey !== "price-asc" ? 1 : 0);

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Sort by</p>
        <div className="space-y-1">
          {(["price-asc", "price-desc", "duration"] as SortKey[]).map((k) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
              <input type="radio" name="sort" checked={sortKey === k} onChange={() => setSortKey(k)} className="accent-primary" />
              {{ "price-asc": "Price: Low to High", "price-desc": "Price: High to Low", duration: "Duration: Shortest" }[k]}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Departure Time</p>
        <div className="space-y-1">
          {DEP_WINDOWS.map(({ key, label, range }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
              <input type="checkbox" checked={depWindows.has(key)} onChange={() => toggleWindow(key)} className="accent-primary rounded" />
              <span>{label}</span>
              <span className="text-muted-foreground text-xs ml-auto">{range}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="bg-white dark:bg-card border-b border-border shadow-sm sticky top-16 z-30">
        <div className="container py-3">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-2 items-end">
            <PlaceInput value={origin} onChange={setOrigin} placeholder="From" places={allPlaces} icon="origin" />
            <button type="button" onClick={handleSwap}
              className="h-10 w-10 shrink-0 rounded-lg border border-border bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors">
              <ArrowLeftRight className="h-4 w-4" />
            </button>
            <PlaceInput value={destination} onChange={setDestination} placeholder="To" places={allPlaces} icon="destination" />
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 text-sm w-auto" required />
            <Button type="submit" variant="action" disabled={loading} className="h-10 gap-1.5 font-semibold shrink-0">
              <Search className="h-3.5 w-3.5" /> {loading ? "Searching…" : "Search"}
            </Button>
            <button type="button" onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={cn("md:hidden h-10 px-3 rounded-lg border flex items-center gap-1.5 text-sm font-medium transition-colors",
                filterCount > 0 ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground bg-muted")}>
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              {filterCount > 0 && <span className="bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{filterCount}</span>}
            </button>
          </form>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex gap-6 items-start">
          <aside className="hidden md:block w-56 shrink-0 sticky top-32">
            <div className="bg-white dark:bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-5">
                <p className="font-bold text-sm">Filters</p>
                {filterCount > 0 && (
                  <button onClick={() => { setSortKey("price-asc"); setDepWindows(new Set()); }} className="text-xs text-primary hover:underline font-medium">
                    Clear all
                  </button>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          <div className="flex-1 min-w-0 space-y-4">
            {showMobileFilters && (
              <div className="md:hidden bg-white dark:bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-sm">Filters</p>
                  <button onClick={() => setShowMobileFilters(false)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
                </div>
                <FilterPanel />
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-16">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Bus className="h-5 w-5 animate-pulse" />
                  <span className="text-sm font-medium animate-pulse">Searching buses…</span>
                </div>
              </div>
            )}

            {!loading && !searched && (
              <div className="text-center py-16 space-y-3">
                <Bus className="h-10 w-10 mx-auto text-muted-foreground/30" />
                <p className="font-bold text-lg">Ready to roll?</p>
                <p className="text-sm text-muted-foreground">Enter origin, destination and date above to see available buses.</p>
              </div>
            )}

            {!loading && searched && results.length === 0 && (
              <div className="text-center py-16 space-y-3">
                <Bus className="h-10 w-10 mx-auto text-muted-foreground/30" />
                <p className="font-bold text-lg">No buses found</p>
                <p className="text-sm text-muted-foreground">Looks like the bus just left. Try a different date or route.</p>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{filtered.length} bus{filtered.length !== 1 ? "es" : ""} found</p>
                  {origin && destination && (
                    <FavoriteRouteButton origin={origin} destination={destination} favorites={favoriteRoutes} onToggle={handleFavToggle} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(date + "T12:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </p>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="space-y-4">
                {filtered.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
