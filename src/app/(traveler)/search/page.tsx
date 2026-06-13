"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Bus, ArrowRight, Star, Users } from "lucide-react";
import Link from "next/link";

interface TripResult {
  id: string;
  departureAt: string;
  arrivalAt: string;
  availableSeats: number;
  basePriceMinor: number;
  route: { origin: string; destination: string };
  operator: { name: string };
}

const LEVEL_BADGE: Record<string, { label: string; color: string }> = {
  LEVEL_1: { label: "L1 · 11% off", color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" },
  LEVEL_2: { label: "L2 · Group bonus", color: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300" },
  LEVEL_3: { label: "L3 · ₹150 reward", color: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300" },
  LEVEL_4: { label: "L4 · 15% off", color: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300" },
};

function OperatorInitial({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shrink-0">
      <span className="text-xs font-extrabold text-white">{initials}</span>
    </div>
  );
}

export default function SearchPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [results, setResults] = useState<TripResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    const params = new URLSearchParams({ origin, destination, date, pageSize: "20" });
    const res = await fetch(`/api/trips?${params}`);
    const json = await res.json();
    setResults(json.data?.items ?? []);
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Search Buses</h1>
        <p className="text-muted-foreground text-sm mt-1">Find buses and earn loyalty rewards on every booking.</p>
      </div>

      {/* Search form */}
      <Card className="border-border shadow-sm">
        <CardContent className="pt-5 pb-5">
          <form onSubmit={handleSearch} className="grid sm:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">From</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Origin city"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="pl-9 h-11"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">To</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Destination city"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-9 h-11"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <Button type="submit" variant="action" disabled={loading} className="h-11 gap-2 font-semibold">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && searched && results.length === 0 && (
        <div className="text-center py-20 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Bus className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="font-semibold">No buses found</p>
          <p className="text-sm text-muted-foreground">Try different dates or cities.</p>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {results.length} bus{results.length !== 1 ? "es" : ""} found
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
            </p>
          </div>

          {results.map((trip) => {
            const dep = new Date(trip.departureAt);
            const arr = new Date(trip.arrivalAt);
            const dur = Math.round((arr.getTime() - dep.getTime()) / 60000);
            const hours = Math.floor(dur / 60);
            const mins = dur % 60;
            const seatsLow = trip.availableSeats <= 5;
            const level = LEVEL_BADGE["LEVEL_1"] ?? { label: "L1 · 11% off", color: "bg-slate-100 text-slate-700" };

            return (
              <Card
                key={trip.id}
                className="hover:shadow-md transition-all border-border overflow-hidden group"
              >
                {/* Top green accent bar — visible if discount active */}
                <div className="h-0.5 w-full bg-gradient-to-r from-sidebar-active to-sidebar-active/50" />

                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Operator info */}
                    <div className="flex items-start gap-3 min-w-0">
                      <OperatorInitial name={trip.operator.name} />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{trip.operator.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">AC Sleeper · 2+1</p>

                        {/* Route + timing */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span className="font-semibold text-sm">{trip.route.origin}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="font-semibold text-sm">{trip.route.destination}</span>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {dep.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            {" – "}
                            {arr.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span>{hours}h {mins}m</span>
                        </div>

                        {/* Discount badge */}
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${level.color}`}>
                            {level.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" /> Group bonus available
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price + seats + CTA */}
                    <div className="text-right shrink-0 space-y-2">
                      <div>
                        <p className="text-xl font-extrabold tracking-tight">
                          ₹{(trip.basePriceMinor / 100).toFixed(0)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">per seat</p>
                      </div>

                      <div className="flex items-center justify-end gap-1.5">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            seatsLow
                              ? "bg-destructive/10 text-destructive"
                              : "bg-action/10 text-action"
                          }`}
                        >
                          {trip.availableSeats} seat{trip.availableSeats !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Fake rating */}
                      <div className="flex items-center justify-end gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium">4.3</span>
                      </div>

                      <Link href={`/book/${trip.id}`}>
                        <Button variant="action" size="sm" className="mt-1 font-semibold w-full">
                          Book now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
