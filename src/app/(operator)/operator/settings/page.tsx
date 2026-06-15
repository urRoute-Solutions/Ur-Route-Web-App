"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Settings, Clock } from "lucide-react";

interface Tier {
  hoursBeforeDeparture: number;
  refundPct: number;
}

export default function OperatorSettingsPage() {
  const [operatorId, setOperatorId] = useState<string | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/operators/me")
      .then((r) => r.json())
      .then((d) => {
        const id = d.data?.operator?.id;
        if (!id) return;
        setOperatorId(id);
        return fetch(`/api/operators/${id}/cancellation-policy`).then((r) => r.json());
      })
      .then((d) => {
        if (d?.data?.tiers) setTiers(d.data.tiers);
      })
      .catch(() => toast.error("Failed to load settings"));
  }, []);

  function addTier() {
    setTiers((prev) => [...prev, { hoursBeforeDeparture: 0, refundPct: 0 }]);
  }

  function removeTier(idx: number) {
    setTiers((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateTier(idx: number, field: keyof Tier, value: number) {
    setTiers((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  }

  async function save() {
    if (!operatorId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/operators/${operatorId}/cancellation-policy`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiers }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message ?? "Save failed");
      setTiers(d.data.tiers);
      toast.success("Cancellation policy saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Operator Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage cancellation policy and other preferences.</p>
      </div>

      <section className="bg-white dark:bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold">Cancellation Refund Policy</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Define how much of the fare is refunded to the traveler's wallet based on how far in advance they cancel.
          Tiers are evaluated from the most generous (furthest from departure) to least generous.
        </p>

        <div className="space-y-3">
          {tiers.map((tier, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">Hours before departure</Label>
                <Input
                  type="number"
                  min={0}
                  value={tier.hoursBeforeDeparture}
                  onChange={(e) => updateTier(i, "hoursBeforeDeparture", Number(e.target.value))}
                  className="h-9"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">Refund %</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={tier.refundPct}
                  onChange={(e) => updateTier(i, "refundPct", Number(e.target.value))}
                  className="h-9"
                />
              </div>
              <div className="pt-5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:bg-destructive/10"
                  onClick={() => removeTier(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-1 border-t border-border">
          <Button variant="outline" size="sm" onClick={addTier} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add tier
          </Button>
          <Button size="sm" onClick={save} disabled={saving || !operatorId}>
            {saving ? "Saving..." : "Save policy"}
          </Button>
        </div>

        {tiers.length > 0 && (
          <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground text-xs mb-1">Preview</p>
            {[...tiers].sort((a, b) => b.hoursBeforeDeparture - a.hoursBeforeDeparture).map((t, i) => (
              <p key={i}>
                Cancel &gt;{t.hoursBeforeDeparture}h before departure →{" "}
                <span className="font-semibold text-foreground">{t.refundPct}% refund</span>
              </p>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
