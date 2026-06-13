"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Bus, ArrowRight, Star, ArrowLeftRight, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TripResult {
  id: string;
  departureAt: string;
  arrivalAt: string;
  availableSeats: number;
  basePriceMinor: number;
  route: { origin: string; destination: string };
  operator: { name: string };
}

const LEVEL_BADGE = {
  label: "L1 Welcome • 11% off",
  color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
};

type SortKey = "price-asc" | "price-desc" | "duration";
type DepartureWindow = "morning" | "afternoon" | "evening" | "night";
type BusType = "ac-sleeper" | "ac-seater" | "non-ac";
type Amenity = "water" | "cctv" | "pillow" | "lamp";

const DEP_WINDOWS: { key: DepartureWindow; label: string; range: string }[] = [
  { key: "morning",   label: "Morning",   range: "6 – 12" },
  { key: "afternoon", label: "Afternoon", range: "12 – 18" },
  { key: "evening",   label: "Evening",   range: "18 – 22" },
  { key: "night",     label: "Night",     range: "22 – 6" },
];

const BUS_TYPES: { key: BusType; label: string }[] = [
  { key: "ac-sleeper", label: "AC Sleeper" },
  { key: "ac-seater",  label: "AC Seater" },
  { key: "non-ac",     label: "Non-AC" },
];

const AMENITIES: { key: Amenity; label: string }[] = [
  { key: "water",  label: "Water Bottle" },
  { key: "cctv",   label: "CCTV" },
  { key: "pillow", label: "Pillow" },
  { key: "lamp",   label: "Reading Lamp" },
];

function OperatorInitial({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
      <span className="text-xs font-extrabold text-white">{initials}</span>
    </div>
  );
}

function seatColor(seats: number) {
  if (seats <= 2) return "text-red-600 bg-red-50 dark:bg-red-900/30";
  if (seats <= 5) return "text-amber-600 bg-amber-50 dark:bg-amber-900/30";
  return "text-action bg-action/10";
}

function depHour(iso: string) {
  return new Date(iso).getHours();
}

function inWindow(iso: string, window: DepartureWindow) {
  const h = depHour(iso);
  if (window === "morning")   return h >= 6 && h < 12;
  if (window === "afternoon") return h >= 12 && h < 18;
  if (window === "evening")   return h >= 18 && h < 22;
  return h >= 22 || h < 6; // night
}

export default function SearchPage() {
  const searchParams = useSearchParams();

  const [origin, setOrigin] = useState(searchParams.get("origin") ?? "");
  const [destination, setDestination] = useState(searchParams.get("destination") ?? "");
  const [date, setDate] = useState(searchParams.get("date") ?? new Date().toISOString().slice(0, 10));

  const [results, setResults] = useState<TripResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // filters
  const [sortKey, setSortKey] = useState<SortKey>("price-asc");
  const [depWindows, setDepWindows] = useState<Set<DepartureWindow>>(new Set());
  const [busTypes, setBusTypes] = useState<Set<BusType>>(new Set());
  const [amenities, setAmenities] = useState<Set<Amenity>>(new Set());
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  async function doSearch(org: string, dest: string, dt: string) {
    if (!org || !dest) return;
    setLoading(true);
    setSearched(true);
    const params = new URLSearchParams({ origin: org, destination: dest, date: dt, pageSize: "40" });
    const res = await fetch(`/api/trips?${params}`);
    const json = await res.json();
    setResults(json.data?.items ?? []);
    setLoading(false);
  }

  // auto-search if URL params present
  useEffect(() => {
    const org = searchParams.get("origin") ?? "";
    const dest = searchParams.get("destination") ?? "";
    const dt = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    if (org && dest) doSearch(org, dest, dt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    doSearch(origin, destination, date);
  }

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function toggleSet<T>(set: Set<T>, key: T): Set<T> {
    const next = new Set(set);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  }

  function clearFilters() {
    setSortKey("price-asc");
    setDepWindows(new Set());
    setBusTypes(new Set());
    setAmenities(new Set());
  }

  const filtered = useMemo(() => {
    let arr = [...results];

    if (depWindows.size > 0) {
      arr = arr.filter((t) => [...depWindows].some((w) => inWindow(t.departureAt, w)));
    }

    // bus type filter is UI-only (no real data field) — skip for now
    // amenity filter is UI-only — skip for now

    if (sortKey === "price-asc")  arr.sort((a, b) => a.basePriceMinor - b.basePriceMinor);
    if (sortKey === "price-desc") arr.sort((a, b) => b.basePriceMinor - a.basePriceMinor);
    if (sortKey === "duration") {
      arr.sort((a, b) => {
        const durA = new Date(a.arrivalAt).getTime() - new Date(a.departureAt).getTime();
        const durB = new Date(b.arrivalAt).getTime() - new Date(b.departureAt).getTime();
        return durA - durB;
      });
    }

    return arr;
  }, [results, sortKey, depWindows]);

  const filterCount = depWindows.size + busTypes.size + amenities.size;

  // ── Filter panel (shared between desktop and mobile sheet) ──
  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Sort by</p>
        <div className="space-y-1">
          {(["price-asc", "price-desc", "duration"] as SortKey[]).map((k) => {
            const labels: Record<SortKey, string> = {
              "price-asc": "Price: Low to High",
              "price-desc": "Price: High to Low",
              "duration": "Duration: Shortest",
            };
            return (
              <label key={k} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
                <input
                  type="radio"
                  name="sort"
                  checked={sortKey === k}
                  onChange={() => setSortKey(k)}
                  className="accent-primary"
                />
                {labels[k]}
              </label>
            );
          })}
        </div>
      </div>

      {/* Departure time */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Departure Time</p>
        <div className="space-y-1">
          {DEP_WINDOWS.map(({ key, label, range }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
              <input
                type="checkbox"
                checked={depWindows.has(key)}
                onChange={() => setDepWindows(toggleSet(depWindows, key))}
                className="accent-primary rounded"
              />
              <span>{label}</span>
              <span className="text-muted-foreground text-xs ml-auto">{range}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Bus type */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Bus Type</p>
        <div className="space-y-1">
          {BUS_TYPES.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
              <input
                type="checkbox"
                checked={busTypes.has(key)}
                onChange={() => setBusTypes(toggleSet(busTypes, key))}
                className="accent-primary rounded"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Amenities</p>
        <div className="space-y-1">
          {AMENITIES.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
              <input
                type="checkbox"
                checked={amenities.has(key)}
                onChange={() => setAmenities(toggleSet(amenities, key))}
                className="accent-primary rounded"
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* ── Search refinement bar ─────────────────────────────── */}
      <div className="bg-white dark:bg-card border-b border-border shadow-sm sticky top-16 z-30">
        <div className="container py-3">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-2 items-end">
            <div className="relative flex-1 min-w-[130px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary" />
              <Input
                placeholder="From"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="pl-8 h-10 text-sm"
                required
              />
            </div>

            <button
              type="button"
              onClick={handleSwap}
              className="h-10 w-10 shrink-0 rounded-lg border border-border bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>

            <div className="relative flex-1 min-w-[130px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="To"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="pl-8 h-10 text-sm"
                required
              />
            </div>

            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 text-sm w-auto"
              required
            />

            <Button type="submit" variant="action" disabled={loading} className="h-10 gap-1.5 font-semibold shrink-0">
              <Search className="h-3.5 w-3.5" />
              Search
            </Button>

            {/* Mobile filter toggle */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={cn(
                "md:hidden h-10 px-3 rounded-lg border flex items-center gap-1.5 text-sm font-medium transition-colors",
                filterCount > 0
                  ? "border-primary text-primary bg-primary/5"
                  : "border-border text-muted-foreground bg-muted"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {filterCount > 0 && (
                <span className="bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {filterCount}
                </span>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex gap-6 items-start">

          {/* ── Desktop filter panel ────────────────────────────── */}
          <aside className="hidden md:block w-64 shrink-0 sticky top-32">
            <div className="bg-white dark:bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-5">
                <p className="font-bold text-sm">Filters</p>
                {filterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* ── Results column ─────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Mobile filter panel */}
            {showMobileFilters && (
              <div className="md:hidden bg-white dark:bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-sm">Filters</p>
                  <div className="flex items-center gap-3">
                    {filterCount > 0 && (
                      <button onClick={clearFilters} className="text-xs text-primary font-medium hover:underline">
                        Clear all
                      </button>
                    )}
                    <button onClick={() => setShowMobileFilters(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <FilterPanel />
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-36 w-full rounded-xl" />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && searched && results.length === 0 && (
              <div className="text-center py-24 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                  <Bus className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <p className="font-bold text-lg">No buses found</p>
                <p className="text-sm text-muted-foreground">Try a different date, origin, or destination.</p>
              </div>
            )}

            {/* Not yet searched */}
            {!loading && !searched && (
              <div className="text-center py-24 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                  <Search className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <p className="font-bold text-lg">Search for buses</p>
                <p className="text-sm text-muted-foreground">Enter your origin, destination and date above.</p>
              </div>
            )}

            {/* Results header */}
            {!loading && filtered.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {filtered.length} bus{filtered.length !== 1 ? "es" : ""} found
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
                    weekday: "short", day: "numeric", month: "short"
                  })}
                </p>
              </div>
            )}

            {/* Bus cards */}
            {!loading && filtered.map((trip) => {
              const dep = new Date(trip.departureAt);
              const arr = new Date(trip.arrivalAt);
              const durMins = Math.round((arr.getTime() - dep.getTime()) / 60000);
              const hours = Math.floor(durMins / 60);
              const mins = durMins % 60;
              const depStr = dep.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
              const arrStr = arr.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
              const sc = seatColor(trip.availableSeats);

              return (
                <div
                  key={trip.id}
                  className="bg-white dark:bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/20 transition-all group"
                >
                  {/* Thin accent bar */}
                  <div className="h-0.5 bg-gradient-to-r from-action via-action/60 to-transparent" />

                  <div className="p-5">
                    {/* Top row: operator + type + rating */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <OperatorInitial name={trip.operator.name} />
                        <div>
                          <p className="font-bold text-sm">{trip.operator.name}</p>
                          <p className="text-xs text-muted-foreground">AC Sleeper · 2+1</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-300">4.3</span>
                      </div>
                    </div>

                    {/* Middle row: departure — duration — arrival */}
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
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-extrabold tracking-tight">{arrStr}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{trip.route.destination}</p>
                      </div>
                    </div>

                    {/* Seat availability row */}
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", sc)}>
                        {trip.availableSeats} seat{trip.availableSeats !== 1 ? "s" : ""} left
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        💧 Water
                      </span>
                      <span className="text-[11px] text-muted-foreground">📹 CCTV</span>
                    </div>

                    {/* Bottom row: level badge + price + CTA */}
                    <div className="flex items-center justify-between gap-4 pt-3 border-t border-border">
                      <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", LEVEL_BADGE.color)}>
                        {LEVEL_BADGE.label}
                      </span>

                      <div className="flex items-center gap-4 ml-auto">
                        <div className="text-right">
                          <p className="text-xl font-extrabold text-foreground">
                            ₹{(trip.basePriceMinor / 100).toFixed(0)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">per seat</p>
                        </div>

                        <Link href={`/book/${trip.id}`}>
                          <Button variant="action" size="sm" className="font-bold gap-1.5 px-5">
                            Book Now <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
