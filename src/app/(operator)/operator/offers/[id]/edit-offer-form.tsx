"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LEVEL_LABEL: Record<string, string> = {
  LEVEL_1: "L1 — Welcome",
  LEVEL_2: "L2 — Stay",
  LEVEL_3: "L3 — Loyalty",
  LEVEL_4: "L4 — Champion",
};

interface Props {
  templateId: string;
  operatorId: string;
  initial: {
    level: string;
    discountType: "PERCENTAGE" | "FLAT";
    percentage: string;
    flatAmount: string;
    maxCap: string;
    groupBonusPerHead: string;
    groupBonusMaxHeads: string;
    unlockTripNumber: string;
    rewardTripNumber: string;
  };
}

export function EditOfferForm({ templateId, operatorId, initial }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FLAT">(initial.discountType);
  const [form, setForm] = useState(initial);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      discountType,
      percentage: discountType === "PERCENTAGE" ? parseFloat(form.percentage) : null,
      flatAmountMinor: discountType === "FLAT" ? Math.round(parseFloat(form.flatAmount) * 100) : null,
      maxCapMinor: form.maxCap ? Math.round(parseFloat(form.maxCap) * 100) : null,
      groupBonusPerHead: parseFloat(form.groupBonusPerHead || "0"),
      groupBonusMaxHeads: parseInt(form.groupBonusMaxHeads || "0"),
      unlockTripNumber: parseInt(form.unlockTripNumber),
      rewardTripNumber: parseInt(form.rewardTripNumber),
    };
    const res = await fetch(`/api/operators/${operatorId}/offer-templates/${templateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setSaving(false);
    if (res.ok) {
      toast.success("Offer updated");
      router.push("/operator/offers");
    } else {
      toast.error(json.error?.issues?.[0]?.message ?? json.error?.message ?? "Failed to update offer");
    }
  }

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/operator/offers" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black">Edit Loyalty Offer</h1>
          <p className="text-xs text-muted-foreground">{LEVEL_LABEL[form.level] ?? form.level}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Unlock at trip #</Label>
            <Input value={form.unlockTripNumber} onChange={(e) => set("unlockTripNumber", e.target.value)} type="number" min="1" className="h-11" required />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Reward on trip #</Label>
            <Input value={form.rewardTripNumber} onChange={(e) => set("rewardTripNumber", e.target.value)} type="number" min="1" className="h-11" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Discount Type</Label>
          <div className="grid grid-cols-2 gap-3">
            {[{ value: "PERCENTAGE", label: "Percentage (%)" }, { value: "FLAT", label: "Flat Amount (₹)" }].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDiscountType(opt.value as "PERCENTAGE" | "FLAT")}
                className={cn(
                  "rounded-lg border px-4 py-3 text-sm font-semibold text-left transition-all",
                  discountType === opt.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {discountType === "PERCENTAGE" ? (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Discount Percentage</Label>
            <div className="relative">
              <Input value={form.percentage} onChange={(e) => set("percentage", e.target.value)} type="number" min="1" max="100" step="0.1" className="h-11 pr-10" required />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">%</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Flat Discount Amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">₹</span>
              <Input value={form.flatAmount} onChange={(e) => set("flatAmount", e.target.value)} type="number" min="1" step="0.01" className="h-11 pl-8" required />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Maximum cap <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">₹</span>
            <Input value={form.maxCap} onChange={(e) => set("maxCap", e.target.value)} type="number" min="0" step="0.01" className="h-11 pl-8" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Group bonus / person</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">₹</span>
              <Input value={form.groupBonusPerHead} onChange={(e) => set("groupBonusPerHead", e.target.value)} type="number" min="0" step="0.01" className="h-11 pl-8" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Max eligible people</Label>
            <Input value={form.groupBonusMaxHeads} onChange={(e) => set("groupBonusMaxHeads", e.target.value)} type="number" min="0" className="h-11" />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={saving} className="flex-1 font-semibold">
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Link href="/operator/offers">
            <Button type="button" variant="outline" className="px-5">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
