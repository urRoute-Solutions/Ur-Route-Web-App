"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Eye } from "lucide-react";
import { CityAutocomplete } from "../new/city-autocomplete";
import { TimeField } from "../new/time-field";
import { DateField } from "../new/date-field";
import { RoutePreviewCard } from "../new/route-preview";
import { computeDurationMinutes } from "../new/duration";

interface Props {
  routeId: string;
  operatorId: string;
  initial: {
    origin: string;
    destination: string;
    distanceKm: string;
    fareRupees: string;
    departureTime: string;
    arrivalTime: string;
    availableFrom: string;
    availableUntil: string;
    isActive: boolean;
  };
}

export function EditRouteForm({ routeId, operatorId, initial }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [operatorName, setOperatorName] = useState("Your company");
  const [form, setForm] = useState(initial);

  useEffect(() => {
    fetch("/api/operators/me")
      .then((r) => r.json())
      .then((json) => { const n = json.data?.operator?.name; if (n) setOperatorName(n); })
      .catch(() => {});
  }, []);

  function set<K extends keyof typeof form>(field: K, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const durationMinutes = useMemo(
    () => computeDurationMinutes(form.departureTime, form.arrivalTime),
    [form.departureTime, form.arrivalTime],
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/operators/${operatorId}/routes/${routeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: form.origin,
        destination: form.destination,
        distanceKm: form.distanceKm ? parseInt(form.distanceKm) : undefined,
        basePriceMinor: form.fareRupees ? Math.round(parseFloat(form.fareRupees) * 100) : undefined,
        departureTime: form.departureTime || undefined,
        arrivalTime: form.arrivalTime || undefined,
        availableFrom: form.availableFrom ? new Date(form.availableFrom).toISOString() : undefined,
        availableUntil: form.availableUntil ? new Date(form.availableUntil).toISOString() : undefined,
        isActive: form.isActive,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Route updated");
      router.push("/operator/routes");
    } else {
      const json = await res.json();
      toast.error(json.error?.message ?? "Failed to update route");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this route? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/operators/${operatorId}/routes/${routeId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      toast.success("Route deleted");
      router.push("/operator/routes");
    } else {
      toast.error("Failed to delete route");
    }
  }

  const previewSummary = {
    operatorName,
    origin: form.origin,
    destination: form.destination,
    distanceKm: form.distanceKm,
    fareRupees: form.fareRupees,
    departureTime: form.departureTime,
    arrivalTime: form.arrivalTime,
    availableFrom: form.availableFrom,
    availableUntil: form.availableUntil,
    durationMinutes,
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Edit Route</h1>
            <p className="text-xs text-muted-foreground">{form.origin || "—"} → {form.destination || "—"}</p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setShowPreview(!showPreview)}>
          <Eye className="h-3.5 w-3.5" />
          {showPreview ? "Hide preview" : "Preview"}
        </Button>
      </div>

      {showPreview && (
        <RoutePreviewCard summary={previewSummary} />
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Route Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <CityAutocomplete label="Origin city" value={form.origin} onChange={(v) => set("origin", v)} placeholder="e.g. Chennai" />
              <CityAutocomplete label="Destination city" value={form.destination} onChange={(v) => set("destination", v)} placeholder="e.g. Bengaluru" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Distance (km)</Label>
                <Input value={form.distanceKm} onChange={(e) => set("distanceKm", e.target.value)} type="number" min="1" placeholder="346" />
              </div>
              <div className="space-y-1.5">
                <Label>Base fare (₹) <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">₹</span>
                  <Input value={form.fareRupees} onChange={(e) => set("fareRupees", e.target.value)} type="number" min="1" step="0.01" className="pl-7" placeholder="850" required />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <TimeField label="Departure time" value={form.departureTime} onChange={(v) => set("departureTime", v)} />
              <div className="space-y-1.5">
                <TimeField label="Arrival time" value={form.arrivalTime} onChange={(v) => set("arrivalTime", v)} />
                {durationMinutes != null && (
                  <p className="text-xs text-muted-foreground">
                    Duration: {Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m
                    {durationMinutes < 0 && " (next day arrival)"}
                  </p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <DateField label="Available from" value={form.availableFrom} onChange={(v) => set("availableFrom", v)} />
              <DateField label="Available until" value={form.availableUntil} onChange={(v) => set("availableUntil", v)} optional />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="isActive" className="font-normal cursor-pointer">Route is active</Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving || deleting} className="flex-1 font-semibold">
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader><CardTitle className="text-base text-destructive">Danger zone</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Permanently delete this route. Any trips using it will be affected.</p>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting || saving} className="gap-2">
            <Trash2 className="h-3.5 w-3.5" />
            {deleting ? "Deleting…" : "Delete route"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
