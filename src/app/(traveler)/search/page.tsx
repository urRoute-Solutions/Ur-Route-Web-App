"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Bus, ArrowRight } from "lucide-react";
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
      <h1 className="text-2xl font-bold">Search Buses</h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="grid sm:grid-cols-[1fr_1fr_auto_auto] gap-4 items-end">
            <div className="space-y-1.5">
              <Label>From</Label>
              <Input placeholder="Origin city" value={origin} onChange={(e) => setOrigin(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>To</Label>
              <Input placeholder="Destination city" value={destination} onChange={(e) => setDestination(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <Bus className="h-10 w-10 mx-auto text-muted-foreground/30" />
          <p className="font-medium">No buses found</p>
          <p className="text-sm text-muted-foreground">Try different dates or cities.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{results.length} bus{results.length > 1 ? "es" : ""} found</p>
          {results.map((trip) => {
            const dep = new Date(trip.departureAt);
            const arr = new Date(trip.arrivalAt);
            const dur = Math.round((arr.getTime() - dep.getTime()) / 60000);
            return (
              <Card key={trip.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between gap-4 py-4 px-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bus className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-semibold text-sm flex-wrap">
                        <span>{trip.route.origin}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span>{trip.route.destination}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{dep.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} – {arr.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                        <span>{Math.floor(dur / 60)}h {dur % 60}m</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{trip.operator.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="font-bold text-lg">₹{(trip.basePriceMinor / 100).toFixed(0)}</p>
                    <Badge variant={trip.availableSeats < 5 ? "destructive" : "secondary"} className="text-xs">
                      {trip.availableSeats} seat{trip.availableSeats !== 1 ? "s" : ""} left
                    </Badge>
                    <div>
                      <Link href={`/book/${trip.id}`}>
                        <Button size="sm" className="mt-1">Book</Button>
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
