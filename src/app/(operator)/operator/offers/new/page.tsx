"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Info, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const LEVELS = [
  { value: "LEVEL_1", label: "L1 — Welcome (Trips 1–4)" },
  { value: "LEVEL_2", label: "L2 — Stay (Trips 5–8)" },
  { value: "LEVEL_3", label: "L3 — Loyalty (Trips 9–12)" },
  { value: "LEVEL_4", label: "L4 — Champion (Trips 13+)" },
];

export default function NewOfferPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedLevel = searchParams.get("level") ?? "";

  const [saving, setSaving] = useState(false);
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FLAT">("PERCENTAGE");
  const [form, setForm] = useState({
    level: preselectedLevel,
    unlockTripNumber: "",
    rewardTripNumber: "",
    percentage: "",
    flatAmount: "",
    maxCap: "",
    groupBonusPerHead: "",
    groupBonusMaxHeads: "",
  });

  useEffect(() => {
    if (preselectedLevel) setForm((f) => ({ ...f, level: preselectedLevel }));
  }, [preselectedLevel]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const levelTitles: Record<string, string> = {
      LEVEL_1: "Welcome Offer",
      LEVEL_2: "Stay Reward",
      LEVEL_3: "Loyalty Bonus",
      LEVEL_4: "Champion Deal",
    };
    const body = {
      level: form.level,
      title: levelTitles[form.level] ?? form.level,
      unlockTripNumber: parseInt(form.unlockTripNumber),
      rewardTripNumber: parseInt(form.rewardTripNumber),
      discountType,
      percentage: discountType === "PERCENTAGE" ? parseFloat(form.percentage) : null,
      flatAmountMinor:
        discountType === "FLAT"
          ? Math.round(parseFloat(form.flatAmount) * 100)
          : null,
      maxCapMinor: form.maxCap
        ? Math.round(parseFloat(form.maxCap) * 100)
        : null,
      groupBonusPerHead: parseFloat(form.groupBonusPerHead || "0"),
      groupBonusMaxHeads: parseInt(form.groupBonusMaxHeads || "0"),
    };
    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setSaving(false);
    if (res.ok) {
      toast.success("Offer created");
      router.push("/operator/offers");
    } else {
      const detail =
        json.error?.issues?.[0]?.message ??
        json.error?.message ??
        "Failed to create offer";
      toast.error(detail);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 sm:px-6 py-6 space-y-6">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-black text-foreground">Add Loyalty Offer</h1>
          <p className="text-xs text-muted-foreground">
            Set your reward for a loyalty tier — travelers earn it automatically.
          </p>
        </div>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        {/* Tier */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">
            Loyalty Tier <span className="text-destructive">*</span>
          </Label>
          <Select
            value={form.level}
            onValueChange={(v) => set("level", v)}
            required
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Choose a tier" />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trip thresholds */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Unlock at trip # <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.unlockTripNumber}
              onChange={(e) => set("unlockTripNumber", e.target.value)}
              type="number"
              min="1"
              placeholder="e.g. 3"
              className="h-11"
              required
            />
            <p className="text-xs text-muted-foreground">
              Traveler sees this tier from trip #
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Reward on trip # <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.rewardTripNumber}
              onChange={(e) => set("rewardTripNumber", e.target.value)}
              type="number"
              min="1"
              placeholder="e.g. 4"
              className="h-11"
              required
            />
            <p className="text-xs text-muted-foreground">
              Discount is applied on this trip
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-3 text-xs font-medium text-muted-foreground">
              Discount Configuration
            </span>
          </div>
        </div>

        {/* Discount type */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Discount Type</Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "PERCENTAGE", label: "Percentage (%)" },
              { value: "FLAT", label: "Flat Amount (₹)" },
            ].map((opt) => (
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

        {/* Discount value */}
        <div className="space-y-2">
          {discountType === "PERCENTAGE" ? (
            <>
              <Label className="text-sm font-semibold">
                Discount Percentage <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  value={form.percentage}
                  onChange={(e) => set("percentage", e.target.value)}
                  type="number"
                  min="1"
                  max="100"
                  step="0.1"
                  placeholder="10"
                  className="h-11 pr-10"
                  required
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  %
                </span>
              </div>
            </>
          ) : (
            <>
              <Label className="text-sm font-semibold">
                Flat Discount Amount <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  ₹
                </span>
                <Input
                  value={form.flatAmount}
                  onChange={(e) => set("flatAmount", e.target.value)}
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="150"
                  className="h-11 pl-8"
                  required
                />
              </div>
            </>
          )}
        </div>

        {/* Max cap */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">
            Maximum Discount Cap{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
              ₹
            </span>
            <Input
              value={form.maxCap}
              onChange={(e) => set("maxCap", e.target.value)}
              type="number"
              min="0"
              step="0.01"
              placeholder="200"
              className="h-11 pl-8"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Caps the total discount even if the percentage yields more. Useful for high-fare routes.
          </p>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-3 text-xs font-medium text-muted-foreground">
              Group Travel Bonus
              <span className="ml-1.5 text-muted-foreground/60">(optional)</span>
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 shrink-0 text-action mt-0.5" />
            <p className="text-xs text-muted-foreground">
              When a traveler books multiple seats in one trip, apply a per-person bonus on top of their tier discount.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Bonus per extra person</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  ₹
                </span>
                <Input
                  value={form.groupBonusPerHead}
                  onChange={(e) => set("groupBonusPerHead", e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="50"
                  className="h-11 pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Max eligible people</Label>
              <Input
                value={form.groupBonusMaxHeads}
                onChange={(e) => set("groupBonusMaxHeads", e.target.value)}
                type="number"
                min="0"
                placeholder="6"
                className="h-11"
              />
            </div>
          </div>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-3">
          <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            This offer is <strong>exclusive to your travelers</strong>. Other operators have their own configurations. Travelers see your offer when they view their loyalty progress with you.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            type="submit"
            variant="action"
            disabled={saving || !form.level}
            className="flex-1 font-semibold"
          >
            {saving ? "Saving…" : "Create Offer"}
          </Button>
          <Button type="button" variant="outline" className="px-5" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
