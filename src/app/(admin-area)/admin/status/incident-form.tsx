"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Service { id: string; name: string }

export function IncidentForm({ services }: { services: Service[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", body: "",
    impact: "MINOR" as "MINOR" | "MAJOR" | "CRITICAL",
    serviceStatus: "" as "" | "DEGRADED" | "PARTIAL_OUTAGE" | "MAJOR_OUTAGE",
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  function toggleService(id: string) {
    setSelectedServices((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (selectedServices.length === 0) { toast.error("Select at least one affected service"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/status/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        body: form.body,
        impact: form.impact,
        serviceIds: selectedServices,
        serviceStatus: form.serviceStatus || undefined,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Incident created");
      setOpen(false);
      setForm({ title: "", body: "", impact: "MINOR", serviceStatus: "" });
      setSelectedServices([]);
      router.refresh();
    } else {
      toast.error("Failed to create incident");
    }
  }

  if (!open) {
    return (
      <Button size="sm" variant="destructive" className="gap-2" onClick={() => setOpen(true)}>
        <AlertTriangle className="h-4 w-4" /> Create Incident
      </Button>
    );
  }

  return (
    <form onSubmit={handleCreate} className="rounded-xl border border-destructive/30 bg-card p-5 space-y-4 w-full">
      <p className="text-sm font-bold text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> New Incident</p>
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Payment processing delays" required />
      </div>
      <div className="space-y-1.5">
        <Label>Initial update / description</Label>
        <textarea
          rows={3}
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          placeholder="We are investigating reports of…"
          required
          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Impact</Label>
          <div className="flex gap-2">
            {(["MINOR", "MAJOR", "CRITICAL"] as const).map((v) => (
              <button key={v} type="button" onClick={() => setForm((f) => ({ ...f, impact: v }))}
                className={cn("flex-1 rounded-lg border py-2 text-xs font-semibold transition-all",
                  form.impact === v ? "border-destructive bg-destructive/10 text-destructive" : "border-border text-muted-foreground hover:border-destructive/40"
                )}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Set service status</Label>
          <select
            value={form.serviceStatus}
            onChange={(e) => setForm((f) => ({ ...f, serviceStatus: e.target.value as typeof form.serviceStatus }))}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none"
          >
            <option value="">No change</option>
            <option value="DEGRADED">Degraded</option>
            <option value="PARTIAL_OUTAGE">Partial Outage</option>
            <option value="MAJOR_OUTAGE">Major Outage</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Affected services</Label>
        <div className="flex flex-wrap gap-2">
          {services.map((s) => (
            <button key={s.id} type="button" onClick={() => toggleService(s.id)}
              className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                selectedServices.includes(s.id) ? "border-destructive bg-destructive/10 text-destructive" : "border-border text-muted-foreground hover:border-destructive/40"
              )}>
              {s.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="destructive" disabled={saving}>{saving ? "Creating…" : "Create Incident"}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
