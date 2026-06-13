"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RouteOption { id: string; origin: string; destination: string }

export default function NewTripPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [form, setForm] = useState({
    routeId: "", departureAt: "", arrivalAt: "", totalSeats: "40", priceMinor: "",
  });

  useEffect(() => {
    fetch("/api/routes?pageSize=100")
      .then((r) => r.json())
      .then((j) => setRoutes(j.data?.items ?? []));
  }, []);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        routeId: form.routeId,
        departureAt: new Date(form.departureAt).toISOString(),
        arrivalAt: new Date(form.arrivalAt).toISOString(),
        totalSeats: parseInt(form.totalSeats),
        basePriceMinor: Math.round(parseFloat(form.priceMinor) * 100),
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (res.ok) {
      toast.success("Trip scheduled");
      router.push("/operator/trips");
    } else {
      toast.error(json.error?.message ?? "Failed to create trip");
    }
  }

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/operator/trips" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold">Schedule Trip</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Trip Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Route</Label>
              <Select value={form.routeId} onValueChange={(v) => set("routeId", v)} required>
                <SelectTrigger><SelectValue placeholder="Select a route" /></SelectTrigger>
                <SelectContent>
                  {routes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.origin} → {r.destination}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {routes.length === 0 && (
                <p className="text-xs text-muted-foreground">No routes found. <Link href="/operator/routes/new" className="text-primary hover:underline">Create one first</Link>.</p>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Departure</Label>
                <Input type="datetime-local" value={form.departureAt} onChange={(e) => set("departureAt", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Arrival</Label>
                <Input type="datetime-local" value={form.arrivalAt} onChange={(e) => set("arrivalAt", e.target.value)} required />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Total seats</Label>
                <Input value={form.totalSeats} onChange={(e) => set("totalSeats", e.target.value)} type="number" min="1" max="80" required />
              </div>
              <div className="space-y-1.5">
                <Label>Price per seat (₹)</Label>
                <Input value={form.priceMinor} onChange={(e) => set("priceMinor", e.target.value)} type="number" min="1" step="0.01" placeholder="500" required />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving || !form.routeId}>{saving ? "Scheduling…" : "Schedule trip"}</Button>
              <Link href="/operator/trips"><Button type="button" variant="ghost">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
