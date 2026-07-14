"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Printer, ArrowLeft, Bus, Users, CheckCircle2, Circle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  const [operatorId, setOperatorId] = useState<string | null>(null);
  // Set of seatLabels that have boarded
  const [boarded, setBoarded] = useState<Set<string>>(new Set());
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const meRes = await fetch("/api/operators/me");
    if (!meRes.ok) { setError("Not authenticated as operator"); return; }
    const me = await meRes.json();
    const opId = me.data?.operator?.id;
    if (!opId) { setError("Operator not found"); return; }
    setOperatorId(opId);

    const [manifestRes, boardingRes] = await Promise.all([
      fetch(`/api/operators/${opId}/trips/${tripId}/manifest`),
      fetch(`/api/trips/${tripId}/boarding`),
    ]);

    if (!manifestRes.ok) { setError("Failed to load manifest"); return; }
    const json = await manifestRes.json();
    setData(json.data);

    if (boardingRes.ok) {
      const bJson = await boardingRes.json();
      setBoarded(new Set((bJson.data?.entries ?? []).map((e: { seatLabel: string }) => e.seatLabel)));
    }
  }, [tripId]);

  useEffect(() => { load(); }, [load]);

  async function toggleBoarding(passenger: PassengerRow) {
    const { seatLabel, pnr } = passenger;
    if (toggling.has(seatLabel)) return;

    const willBoard = !boarded.has(seatLabel);
    setToggling((prev) => new Set([...prev, seatLabel]));

    try {
      const res = await fetch(`/api/trips/${tripId}/boarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pnr, seatLabel, boarded: willBoard }),
      });
      if (!res.ok) throw new Error("Update failed");
      setBoarded((prev) => {
        const next = new Set(prev);
        willBoard ? next.add(seatLabel) : next.delete(seatLabel);
        return next;
      });
    } catch {
      toast.error("Failed to update boarding status");
    } finally {
      setToggling((prev) => { const next = new Set(prev); next.delete(seatLabel); return next; });
    }
  }

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
  const totalBoarded = boarded.size;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-size: 12px; }
          .print-container { padding: 0; }
          tr.boarded td { background: #f0fdf4 !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
        <Link href="/operator/trips">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Trips
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => load()}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button onClick={() => window.print()} size="sm" className="gap-2">
            <Printer className="h-4 w-4" /> Print / Save PDF
          </Button>
        </div>
      </div>

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
            <div><span className="text-muted-foreground">Route:</span>{" "}<span className="font-semibold">{trip.origin} → {trip.destination}</span></div>
            <div><span className="text-muted-foreground">Departure:</span>{" "}<span className="font-semibold">{depStr}</span></div>
            <div><span className="text-muted-foreground">Arrival:</span>{" "}<span className="font-semibold">{arrStr}</span></div>
            <div><span className="text-muted-foreground">Contact:</span>{" "}<span className="font-semibold">{trip.operator.contactEmail}</span></div>
          </div>

          {/* Live boarding counter */}
          <div className="flex items-center gap-4 pt-1 border-t border-border text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-bold text-green-600 dark:text-green-400">{totalBoarded}</span>
              <span className="text-muted-foreground">/ {data.totalPassengers} boarded</span>
            </div>
            {totalBoarded === data.totalPassengers && data.totalPassengers > 0 && (
              <span className="text-green-600 dark:text-green-400 font-semibold text-xs">All aboard!</span>
            )}
          </div>

          {/* Progress bar */}
          {data.totalPassengers > 0 && (
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${(totalBoarded / data.totalPassengers) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Passenger table */}
        {passengers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No confirmed bookings yet.</div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  {["#", "PNR", "Seat", "Name", "Age", "Gender", "Mobile", "Board"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {passengers.map((p, i) => {
                  const isBoarded = boarded.has(p.seatLabel);
                  const isToggling = toggling.has(p.seatLabel);
                  return (
                    <tr
                      key={`${p.pnr}-${p.seatLabel}`}
                      className={cn(
                        "transition-colors",
                        isBoarded ? "bg-green-50 dark:bg-green-900/10 boarded" : "hover:bg-muted/20",
                      )}
                    >
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-mono font-bold text-primary">{p.pnr}</td>
                      <td className="px-4 py-3 font-semibold">{p.seatLabel}</td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3">{p.age}</td>
                      <td className="px-4 py-3 capitalize">{p.gender.toLowerCase()}</td>
                      <td className="px-4 py-3 font-mono">{p.phone}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleBoarding(p)}
                          disabled={isToggling}
                          className={cn(
                            "no-print rounded-full transition-all",
                            isToggling && "opacity-50 cursor-not-allowed",
                          )}
                          title={isBoarded ? "Mark as not boarded" : "Mark as boarded"}
                        >
                          {isBoarded
                            ? <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            : <Circle className="h-5 w-5 text-muted-foreground/40 hover:text-muted-foreground" />
                          }
                        </button>
                        {/* Print: static checkbox */}
                        <div className={cn("print-only w-4 h-4 rounded border-2 border-border inline-block", isBoarded && "bg-green-500 border-green-500")} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center no-print">
          Tap the circle next to each passenger to mark them as boarded. Changes save instantly.
        </p>
        <p className="text-xs text-muted-foreground text-center">
          Generated {new Date().toLocaleString("en-IN")} · urRoute Operations
        </p>
      </div>
    </>
  );
}
