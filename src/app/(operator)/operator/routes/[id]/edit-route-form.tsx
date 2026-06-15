"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

interface Props {
  routeId: string;
  operatorId: string;
  initial: {
    origin: string;
    destination: string;
    distanceKm: string;
    durationMin: string;
    isActive: boolean;
  };
}

export function EditRouteForm({ routeId, operatorId, initial }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(initial);

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

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
        durationMin: form.durationMin ? parseInt(form.durationMin) : undefined,
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

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-bold">Edit Route</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Route Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Origin city</Label>
                <Input value={form.origin} onChange={(e) => set("origin", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Destination city</Label>
                <Input value={form.destination} onChange={(e) => set("destination", e.target.value)} required />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Distance (km)</Label>
                <Input value={form.distanceKm} onChange={(e) => set("distanceKm", e.target.value)} type="number" min="1" />
              </div>
              <div className="space-y-1.5">
                <Label>Duration (minutes)</Label>
                <Input value={form.durationMin} onChange={(e) => set("durationMin", e.target.value)} type="number" min="1" />
              </div>
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
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
              <Link href="/operator/routes"><Button type="button" variant="ghost">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader><CardTitle className="text-base text-red-600">Danger zone</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Permanently delete this route. Any trips using it will be affected.</p>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting} className="gap-2">
            <Trash2 className="h-3.5 w-3.5" />
            {deleting ? "Deleting…" : "Delete route"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
