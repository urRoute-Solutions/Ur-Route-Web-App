"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Clock } from "lucide-react";
import { CityAutocomplete } from "./city-autocomplete";
import { TimeField } from "./time-field";
import { DateField } from "./date-field";
import { RoutePreviewCard, RouteSuccessCard, type RouteSummary } from "./route-preview";
import { computeDurationMinutes, formatDuration } from "./duration";

type Step = "form" | "preview" | "success";

function todayYMD(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const EMPTY_FORM = {
  origin: "",
  destination: "",
  distanceKm: "",
  fareRupees: "",
  departureTime: "",
  arrivalTime: "",
  availableFrom: "",
  availableUntil: "",
};

export default function NewRoutePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [operatorName, setOperatorName] = useState("Your company");
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    fetch("/api/operators/me")
      .then((r) => r.json())
      .then((json) => {
        const name = json.data?.operator?.name;
        if (name) setOperatorName(name);
      })
      .catch(() => {});
  }, []);

  function set<K extends keyof typeof form>(field: K, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const durationMinutes = useMemo(
    () => computeDurationMinutes(form.departureTime, form.arrivalTime),
    [form.departureTime, form.arrivalTime],
  );

  const errors = useMemo(() => {
    const e: Partial<Record<keyof typeof form, string>> = {};
    if (!form.origin.trim()) e.origin = "Origin city is required";
    if (!form.destination.trim()) e.destination = "Destination city is required";
    if (
      form.origin.trim() &&
      form.destination.trim() &&
      form.origin.trim().toLowerCase() === form.destination.trim().toLowerCase()
    ) {
      e.destination = "Origin and destination cannot be the same";
    }
    const distance = parseFloat(form.distanceKm);
    if (!form.distanceKm || Number.isNaN(distance) || distance <= 0) {
      e.distanceKm = "Enter a positive distance";
    }
    const fare = parseFloat(form.fareRupees);
    if (!form.fareRupees || Number.isNaN(fare) || fare <= 0) {
      e.fareRupees = "Enter a positive fare";
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.departureTime)) e.departureTime = "Departure time is required";
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.arrivalTime)) e.arrivalTime = "Arrival time is required";
    if (!form.availableFrom) {
      e.availableFrom = "Available From is required";
    } else if (form.availableFrom < todayYMD()) {
      e.availableFrom = "Available From cannot be in the past";
    }
    if (form.availableUntil && form.availableUntil <= form.availableFrom) {
      e.availableUntil = "Available Until must be after Available From";
    }
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const summary: RouteSummary = {
    operatorName,
    origin: form.origin,
    destination: form.destination,
    departureTime: form.departureTime,
    arrivalTime: form.arrivalTime,
    durationMinutes,
    distanceKm: form.distanceKm,
    fareRupees: form.fareRupees,
    availableFrom: form.availableFrom,
    availableUntil: form.availableUntil,
  };

  function handleCreateRouteClick(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!isValid) return;
    setStep("preview");
  }

  function handleEdit() {
    setStep("form");
  }

  function handleCancelFromPreview() {
    setForm(EMPTY_FORM);
    setSubmitted(false);
    router.push("/operator/routes");
  }

  async function handlePublish() {
    setSaving(true);
    const res = await fetch("/api/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: form.origin,
        destination: form.destination,
        distanceKm: parseInt(form.distanceKm, 10),
        durationMin: durationMinutes ?? undefined,
        basePriceMinor: Math.round(parseFloat(form.fareRupees) * 100),
        departureTime: form.departureTime,
        arrivalTime: form.arrivalTime,
        availableFrom: new Date(`${form.availableFrom}T00:00:00`).toISOString(),
        availableUntil: form.availableUntil
          ? new Date(`${form.availableUntil}T00:00:00`).toISOString()
          : undefined,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (res.ok) {
      setStep("success");
    } else {
      toast.error(json.error?.message ?? "Failed to publish route");
    }
  }

  const titles: Record<Step, string> = {
    form: "Add Route",
    preview: "Preview Route",
    success: "Route Published",
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-bold">{titles[step]}</h1>
      </div>

      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader><CardTitle className="text-base">Route Details</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCreateRouteClick} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <CityAutocomplete
                      label="Origin city"
                      value={form.origin}
                      onChange={(v) => set("origin", v)}
                      placeholder="e.g. Chennai"
                      error={submitted ? errors.origin : undefined}
                    />
                    <CityAutocomplete
                      label="Destination city"
                      value={form.destination}
                      onChange={(v) => set("destination", v)}
                      placeholder="e.g. Bangalore"
                      error={submitted ? errors.destination : undefined}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Distance (km)</Label>
                      <Input
                        value={form.distanceKm}
                        onChange={(e) => set("distanceKm", e.target.value)}
                        type="number"
                        min="1"
                        step="1"
                        placeholder="420"
                      />
                      {submitted && errors.distanceKm && (
                        <p className="text-xs text-destructive">{errors.distanceKm}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Fare per seat (₹)</Label>
                      <Input
                        value={form.fareRupees}
                        onChange={(e) => set("fareRupees", e.target.value)}
                        type="number"
                        min="1"
                        step="1"
                        placeholder="899"
                      />
                      {submitted && errors.fareRupees && (
                        <p className="text-xs text-destructive">{errors.fareRupees}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <TimeField
                      label="Departure Time"
                      value={form.departureTime}
                      onChange={(v) => set("departureTime", v)}
                      error={submitted ? errors.departureTime : undefined}
                    />
                    <TimeField
                      label="Arrival Time"
                      value={form.arrivalTime}
                      onChange={(v) => set("arrivalTime", v)}
                      error={submitted ? errors.arrivalTime : undefined}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Estimated Journey Duration</Label>
                    <div className="flex h-9 items-center gap-2 rounded-md border border-dashed border-input bg-muted/40 px-3 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(durationMinutes)}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <DateField
                      label="Available From"
                      value={form.availableFrom}
                      onChange={(v) => set("availableFrom", v)}
                      minDate={todayYMD()}
                      error={submitted ? errors.availableFrom : undefined}
                    />
                    <DateField
                      label="Available Until"
                      value={form.availableUntil}
                      onChange={(v) => set("availableUntil", v)}
                      minDate={form.availableFrom || todayYMD()}
                      optional
                      error={submitted ? errors.availableUntil : undefined}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2">
                    This route will only be visible to travelers during the selected availability period.
                    Leave &ldquo;Available Until&rdquo; empty to keep it active until you disable it manually.
                  </p>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={submitted && !isValid}>Create Route</Button>
                    <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === "preview" && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <RoutePreviewCard summary={summary} />
            <div className="flex gap-3">
              <Button type="button" onClick={handlePublish} disabled={saving || !isValid}>
                {saving ? "Publishing…" : "Done / Publish Route"}
              </Button>
              <Button type="button" variant="outline" onClick={handleEdit}>Edit</Button>
              <Button type="button" variant="ghost" onClick={handleCancelFromPreview}>Cancel</Button>
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <RouteSuccessCard summary={summary} />
            <Button type="button" onClick={() => router.push("/operator/routes")}>
              Go to Routes
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
