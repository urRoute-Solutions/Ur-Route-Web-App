"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const LEVELS = [
  { value: "LEVEL_1", label: "L1 Welcome" },
  { value: "LEVEL_2", label: "L2 Stay" },
  { value: "LEVEL_3", label: "L3 Loyalty" },
  { value: "LEVEL_4", label: "L4 Champion" },
];

export default function NewOfferPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FLAT">("PERCENTAGE");
  const [form, setForm] = useState({
    level: "", unlockTripNumber: "", rewardTripNumber: "",
    percentage: "", flatAmount: "", maxCap: "",
    groupBonusPerHead: "0", groupBonusMaxHeads: "0",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      level: form.level,
      unlockTripNumber: parseInt(form.unlockTripNumber),
      rewardTripNumber: parseInt(form.rewardTripNumber),
      discountType,
      percentage: discountType === "PERCENTAGE" ? parseFloat(form.percentage) : null,
      flatAmountMinor: discountType === "FLAT" ? Math.round(parseFloat(form.flatAmount) * 100) : null,
      maxCapMinor: form.maxCap ? Math.round(parseFloat(form.maxCap) * 100) : null,
      groupBonusPerHead: Math.round(parseFloat(form.groupBonusPerHead || "0") * 100),
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
      const detail = json.error?.issues?.[0]?.message ?? json.error?.message ?? "Failed to create offer";
      toast.error(detail);
    }
  }

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/operator/offers" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold">Add Loyalty Offer</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Offer Configuration</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Loyalty Level</Label>
              <Select value={form.level} onValueChange={(v) => set("level", v)} required>
                <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Unlock at trip #</Label>
                <Input value={form.unlockTripNumber} onChange={(e) => set("unlockTripNumber", e.target.value)} type="number" min="1" placeholder="3" required />
              </div>
              <div className="space-y-1.5">
                <Label>Reward on trip #</Label>
                <Input value={form.rewardTripNumber} onChange={(e) => set("rewardTripNumber", e.target.value)} type="number" min="1" placeholder="4" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Discount type</Label>
              <Select value={discountType} onValueChange={(v: "PERCENTAGE" | "FLAT") => setDiscountType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FLAT">Flat amount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {discountType === "PERCENTAGE" ? (
              <div className="space-y-1.5">
                <Label>Discount %</Label>
                <Input value={form.percentage} onChange={(e) => set("percentage", e.target.value)} type="number" min="1" max="100" step="0.1" placeholder="10" required />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Flat discount (₹)</Label>
                <Input value={form.flatAmount} onChange={(e) => set("flatAmount", e.target.value)} type="number" min="1" step="0.01" placeholder="50" required />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Max cap (₹) — optional</Label>
              <Input value={form.maxCap} onChange={(e) => set("maxCap", e.target.value)} type="number" min="0" step="0.01" placeholder="200" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Group bonus per head (₹)</Label>
                <Input value={form.groupBonusPerHead} onChange={(e) => set("groupBonusPerHead", e.target.value)} type="number" min="0" step="0.01" placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Max group heads</Label>
                <Input value={form.groupBonusMaxHeads} onChange={(e) => set("groupBonusMaxHeads", e.target.value)} type="number" min="0" placeholder="0" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving || !form.level}>{saving ? "Saving…" : "Create offer"}</Button>
              <Link href="/operator/offers"><Button type="button" variant="ghost">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
