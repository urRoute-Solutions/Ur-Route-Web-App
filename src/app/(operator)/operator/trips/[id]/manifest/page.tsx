"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Printer, ArrowLeft, Bus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PassengerRow {
  pnr: string;
  bookingStatus: string;
  seatLabel: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
}

interface TripInfo {
  busName: string;
  origin: string;
  destination: string;
  departureAt: string;
  arrivalAt: string;
  totalSeats: number;
  availableSeats: number;
  operator: { name: string; contactEmail: string; contactPhone?: string };
}

interface ManifestData {
  trip: TripInfo;
  passengers: PassengerRow[];
  totalPassengers: number;
}

export default function TripManifestPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const [data, setData] = useState<ManifestData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    // We need operatorId — fetch it from /api/operators/me
    const meRes = await fetch("/api/operators/me");
    if (!meRes.ok) { setError("Not authenticated as operator"); return; }
    const me = await meRes.json();
    const opId = me.data?.operator?.id;
    if (!opId) { setError("Operator not found"); return; }

    const res = await fetch(`/api/operators/${opId}/trips/${tripId}/manifest`);
    if (!res.ok) { setError("Failed to load manifest"); return; }
    const json = await res.json();
    setData(json.data);
  }, [tripId]);

  useEffect(() => { load(); }, [load]);

  if (error) return (
    <div className="p-8 text-center space-y-4">
      <p className="text-destructive font-medium">{error}</p>
      <Link href="/operator/trips"><Button variant="outline" size="sm">Back to trips</Button></Link>
    </div>
  );

  if (!data) return (
    <div className="p-8 text-center text-muted-foreground">Loading manifest...</div>
  );

  const { trip, passengers } = data;
  const dep = new Date(trip.departureAt);
  const arr = new Date(trip.arrivalAt);
  const depStr = dep.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const arrStr = arr.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-size: 12px; }
          .print-container { padding: 0; }
        }
      `}</style>

      {/* Toolbar — hidden on print */}
      <div className="no-print flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
        <Link href="/operator/trips">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Trips
          </Button>
        </Link>
        <Button onClick={() => window.print()} size="sm" className="gap-2">
          <Printer className="h-4 w-4" /> Print / Save PDF
        </Button>
      </div>

      {/* Manifest content */}
      <div className="print-container max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Passenger Manifest</h1>
              <p className="text-sm text-muted-foreground">{trip.operator.name} · {trip.busName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Route:</span>{" "}
              <span className="font-semibold">{trip.origin} → {trip.destination}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Departure:</span>{" "}
              <span className="font-semibold">{depStr}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Arrival:</span>{" "}
              <span className="font-semibold">{arrStr}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Contact:</span>{" "}
              <span className="font-semibold">{trip.operator.contactEmail}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-1 border-t border-border text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-bold">{data.totalPassengers}</span>
              <span className="text-muted-foreground">passengers boarded</span>
            </div>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{trip.totalSeats - data.totalPassengers} seats empty</span>
          </div>
        </div>

        {/* Passenger table */}
        {passengers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No confirmed bookings yet.</div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">PNR</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Seat</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Age</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Gender</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Mobile</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">Boarded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {passengers.map((p, i) => (
                  <tr key={`${p.pnr}-${p.seatLabel}`} className="hover:bg-muted/20">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 font-mono font-bold text-primary">{p.pnr}</td>
                    <td className="px-4 py-3 font-semibold">{p.seatLabel}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">{p.age}</td>
                    <td className="px-4 py-3 capitalize">{p.gender.toLowerCase()}</td>
                    <td className="px-4 py-3 font-mono">{p.phone}</td>
                    <td className="px-4 py-3">
                      <div className="w-4 h-4 rounded border-2 border-border" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Generated {new Date().toLocaleString("en-IN")} · urRoute Operations
        </p>
      </div>
    </>
  );
}
