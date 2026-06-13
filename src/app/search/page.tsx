"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchTripsSchema, type SearchTripsInput } from "@/validators/trip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { TripDTO } from "@/dto/trip.dto";

interface SearchResult {
  items: TripDTO[];
  total: number;
}

export default function SearchPage() {
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<SearchTripsInput>({
    resolver: zodResolver(searchTripsSchema),
    defaultValues: { passengers: 1, page: 1, pageSize: 20 },
  });

  async function onSearch(data: SearchTripsInput) {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      origin: data.origin,
      destination: data.destination,
      date: data.date,
      passengers: String(data.passengers),
    });
    const res = await fetch(`/api/trips?${params}`);
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setError(json.error?.message ?? "Search failed"); return; }
    setResults(json.data);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Find your bus</h1>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSearch)} className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>From</Label>
                <Input {...register("origin")} placeholder="Chennai" />
                {errors.origin && <p className="text-xs text-red-500">{errors.origin.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>To</Label>
                <Input {...register("destination")} placeholder="Bangalore" />
                {errors.destination && <p className="text-xs text-red-500">{errors.destination.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Date</Label>
                <Input type="date" {...register("date")} />
                {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Passengers</Label>
                <Input type="number" min={1} max={10} {...register("passengers", { valueAsNumber: true })} />
              </div>
              {error && <p className="col-span-2 text-sm text-red-500">{error}</p>}
              <Button type="submit" className="col-span-2" disabled={loading}>
                {loading ? "Searching…" : "Search buses"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {results && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">{results.total} trips found</p>
            {results.items.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
            {results.items.length === 0 && (
              <p className="text-center text-slate-400 py-12">No buses available for this route and date.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TripCard({ trip }: { trip: TripDTO }) {
  const fare = `₹${(trip.basePriceMinor / 100).toFixed(0)}`;
  const dep = new Date(trip.departureAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const arr = new Date(trip.arrivalAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4">
        <div>
          <p className="font-semibold">{dep} → {arr}</p>
          <p className="text-sm text-slate-500">{trip.busName} · {trip.seatType}</p>
          <p className="text-xs text-slate-400 mt-1">{trip.availableSeats} seats left</p>
        </div>
        <div className="text-right space-y-2">
          <p className="text-lg font-bold">{fare}</p>
          <Badge variant="outline">{trip.status}</Badge>
          <div>
            <Link href={`/bookings/${trip.id}/book`}>
              <Button size="sm">Book</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
