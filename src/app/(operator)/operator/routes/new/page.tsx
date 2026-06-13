"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewRoutePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    origin: "", destination: "", distanceKm: "", durationMin: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: form.origin,
        destination: form.destination,
        distanceKm: form.distanceKm ? parseInt(form.distanceKm) : undefined,
        durationMin: form.durationMin ? parseInt(form.durationMin) : undefined,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (res.ok) {
      toast.success("Route created");
      router.push("/operator/routes");
    } else {
      toast.error(json.error?.message ?? "Failed to create route");
    }
  }

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/operator/routes" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold">Add Route</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Route Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Origin city</Label>
                <Input value={form.origin} onChange={(e) => set("origin", e.target.value)} placeholder="e.g. Chennai" required />
              </div>
              <div className="space-y-1.5">
                <Label>Destination city</Label>
                <Input value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="e.g. Bangalore" required />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Distance (km)</Label>
                <Input value={form.distanceKm} onChange={(e) => set("distanceKm", e.target.value)} type="number" min="1" step="0.1" placeholder="350" required />
              </div>
              <div className="space-y-1.5">
                <Label>Duration (minutes)</Label>
                <Input value={form.durationMin} onChange={(e) => set("durationMin", e.target.value)} type="number" min="1" placeholder="420" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create route"}</Button>
              <Link href="/operator/routes"><Button type="button" variant="ghost">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
