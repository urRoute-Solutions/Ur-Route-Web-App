import { requireOperator } from "@/lib/auth/session";
import { offerTemplateRepository } from "@/repositories/offer-template.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const LEVEL_LABELS: Record<string, string> = {
  LEVEL_1: "L1 · Welcome",
  LEVEL_2: "L2 · Stay",
  LEVEL_3: "L3 · Loyalty",
  LEVEL_4: "L4 · Champion",
};

export default async function OperatorOffersPage() {
  const { operatorId } = await requireOperator();
  const templates = await offerTemplateRepository.listByOperator(operatorId);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Loyalty Offers</h1>
          <Link href="/operator/offers/new"><Button>+ Add Offer</Button></Link>
        </div>
        <p className="text-sm text-slate-500">Configure the discount and perks travelers receive at each loyalty level.</p>
        <div className="grid gap-4">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  {LEVEL_LABELS[t.level] ?? t.level}
                  <Badge variant={t.isActive ? "default" : "secondary"}>{t.isActive ? "Active" : "Inactive"}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{t.title}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {t.discountType === "PERCENTAGE" ? `${t.percentage}% off` : `₹${((t.flatAmountMinor ?? 0) / 100).toFixed(0)} flat`}
                  {t.maxCapMinor ? ` (max ₹${(t.maxCapMinor / 100).toFixed(0)})` : ""}
                  {t.groupBonusPerHead > 0 ? ` + ${t.groupBonusPerHead}% per extra pax` : ""}
                </p>
                <p className="text-xs text-slate-400 mt-1">Unlocks at trip {t.unlockTripNumber} · Reward at trip {t.rewardTripNumber}</p>
              </CardContent>
            </Card>
          ))}
          {templates.length === 0 && (
            <p className="text-slate-400 text-center py-12">No offers configured yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
