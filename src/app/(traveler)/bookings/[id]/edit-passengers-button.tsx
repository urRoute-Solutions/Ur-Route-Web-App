"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit2, X, Check } from "lucide-react";

interface Passenger {
  name: string;
  age: number;
  gender: string;
  seatLabel: string;
  phone?: string;
}

interface Props {
  bookingId: string;
  passengers: Passenger[];
}

export function EditPassengersButton({ bookingId, passengers }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Passenger[]>(passengers);
  const [saving, setSaving] = useState(false);

  function update(idx: number, field: keyof Passenger, value: string | number) {
    setDraft((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  }

  async function save() {
    for (const p of draft) {
      if (!p.name || p.name.length < 2) { toast.error(`Enter a valid name for seat ${p.seatLabel}`); return; }
      if (!p.phone || !/^[6-9]\d{9}$/.test(p.phone)) { toast.error(`Enter a valid 10-digit mobile for ${p.name}`); return; }
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passengers: draft }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message ?? "Failed to update");
      setOpen(false);
      toast.success("Passenger details updated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="gap-2" onClick={() => { setDraft(passengers); setOpen(true); }}>
        <Edit2 className="h-3.5 w-3.5" /> Edit Passengers
      </Button>
    );
  }

  return (
    <div className="border border-border rounded-xl p-5 space-y-5 bg-muted/20">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm">Edit passenger details</p>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {draft.map((p, i) => (
        <div key={i} className="space-y-3 pb-4 border-b border-border last:border-0 last:pb-0">
          <p className="text-xs font-bold text-muted-foreground uppercase">Seat {p.seatLabel}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Full name</Label>
              <Input value={p.name} onChange={(e) => update(i, "name", e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Mobile</Label>
              <Input
                value={p.phone ?? ""}
                onChange={(e) => update(i, "phone", e.target.value)}
                placeholder="9xxxxxxxxx"
                maxLength={10}
                className="h-8 text-sm font-mono"
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={save} disabled={saving} className="gap-1.5">
          <Check className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save changes"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}
