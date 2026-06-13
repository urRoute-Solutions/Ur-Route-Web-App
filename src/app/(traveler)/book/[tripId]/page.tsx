"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Bus, Users, ArrowRight } from "lucide-react";

interface SeatInfo { id: string; label: string; isBooked: boolean }
interface TripInfo {
  id: string; departureAt: string; arrivalAt: string; basePriceMinor: number;
  busName: string;
  route: { origin: string; destination: string };
  operator: { name: string };
  seats: SeatInfo[];
}

interface Passenger { name: string; age: string; gender: string; seatLabel: string }

export default function BookTripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<TripInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/trips/${tripId}`)
      .then((r) => r.json())
      .then((json) => setTrip(json.data?.trip ?? null))
      .finally(() => setLoading(false));
  }, [tripId]);

  function toggleSeat(label: string) {
    setSelectedSeats((prev) => {
      if (prev.includes(label)) {
        const next = prev.filter((s) => s !== label);
        setPassengers((ps) => ps.slice(0, next.length));
        return next;
      }
      const next = [...prev, label];
      setPassengers((ps) => [...ps, { name: "", age: "", gender: "", seatLabel: label }]);
      return next;
    });
  }

  function updatePassenger(idx: number, field: keyof Passenger, value: string) {
    setPassengers((ps) => ps.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  }

  async function handleBook() {
    if (selectedSeats.length === 0) { toast.error("Select at least one seat"); return; }
    const valid = passengers.every((p) => p.name && p.age && p.gender);
    if (!valid) { toast.error("Fill in all passenger details"); return; }

    setSubmitting(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripId,
        seatLabels: selectedSeats,
        passengers: passengers.map((p) => ({
          name: p.name,
          age: parseInt(p.age),
          gender: p.gender,
          seatLabel: p.seatLabel,
        })),
      }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (res.ok) {
      toast.success("Booking created! Proceed to payment.");
      router.push(`/bookings/${json.data.booking.id}`);
    } else {
      toast.error(json.error?.message ?? "Booking failed");
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }
  if (!trip) return <div className="p-6 text-muted-foreground">Trip not found.</div>;

  const dep = new Date(trip.departureAt);
  const arr = new Date(trip.arrivalAt);
  const totalMinor = trip.basePriceMinor * selectedSeats.length;
  const availableSeats = trip.seats.filter((s) => !s.isBooked);

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Select Seats</h1>

      {/* Trip summary */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <Bus className="h-5 w-5 text-primary shrink-0" />
            <div className="flex items-center gap-2 font-semibold">
              {trip.route.origin}
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              {trip.route.destination}
            </div>
            <span className="ml-auto font-bold">₹{(trip.basePriceMinor / 100).toFixed(0)}/seat</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground flex gap-4 pl-8">
            <span>{dep.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} – {arr.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            <span>{trip.operator.name}</span>
          </div>
        </CardContent>
      </Card>

      {/* Seat grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Choose Seats</span>
            <span className="text-sm font-normal text-muted-foreground">{availableSeats.length} available</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-2">
            {trip.seats.map((seat) => {
              const isSelected = selectedSeats.includes(seat.label);
              return (
                <button
                  key={seat.id}
                  disabled={seat.isBooked}
                  onClick={() => !seat.isBooked && toggleSeat(seat.label)}
                  className={`rounded p-1.5 text-xs font-mono font-semibold transition-colors border ${
                    seat.isBooked
                      ? "bg-muted text-muted-foreground border-muted cursor-not-allowed"
                      : isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  {seat.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-border bg-background" /> Available</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary" /> Selected</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted" /> Taken</span>
          </div>
        </CardContent>
      </Card>

      {/* Passenger details */}
      {passengers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Passenger Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {passengers.map((p, i) => (
              <div key={i} className="space-y-3 pb-4 border-b last:border-0 last:pb-0">
                <p className="text-sm font-medium text-muted-foreground">Seat {p.seatLabel}</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3 space-y-1">
                    <Label>Full name</Label>
                    <Input value={p.name} onChange={(e) => updatePassenger(i, "name", e.target.value)} placeholder="As on ID" required />
                  </div>
                  <div className="space-y-1">
                    <Label>Age</Label>
                    <Input value={p.age} onChange={(e) => updatePassenger(i, "age", e.target.value)} placeholder="Age" type="number" min="1" max="120" required />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <Label>Gender</Label>
                    <Select value={p.gender} onValueChange={(v) => updatePassenger(i, "gender", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Fare summary + book */}
      {selectedSeats.length > 0 && (
        <Card>
          <CardContent className="pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{selectedSeats.length} × ₹{(trip.basePriceMinor / 100).toFixed(0)}</span>
              <span>₹{(totalMinor / 100).toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Loyalty discount may apply at checkout</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total (est.)</span>
              <span>₹{(totalMinor / 100).toFixed(0)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleBook} disabled={submitting || selectedSeats.length === 0} className="w-full" size="lg">
        {submitting ? "Creating booking…" : `Book ${selectedSeats.length > 0 ? `${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""}` : "seats"}`}
      </Button>
    </div>
  );
}
