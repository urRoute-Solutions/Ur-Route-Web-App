import { requireOperator } from "@/lib/auth/session";
import { offerTemplateRepository } from "@/repositories/offer-template.repository";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Gift, Plus, Tag } from "lucide-react";

const LEVEL_LABELS: Record<string, string> = {
  LEVEL_1: "L1 Welcome",
  LEVEL_2: "L2 Stay",
  LEVEL_3: "L3 Loyalty",
  LEVEL_4: "L4 Champion",
};

export default async function OperatorOffersPage() {
  const { operatorId } = await requireOperator();
  const offers = await offerTemplateRepository.listByOperator(operatorId);

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Loyalty Offers</h1>
        <Link href="/operator/offers/new">
          <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add offer</Button>
        </Link>
      </div>

      {offers.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <Gift className="h-10 w-10 mx-auto text-muted-foreground/30" />
            <p className="font-medium">No loyalty offers yet</p>
            <p className="text-sm text-muted-foreground">Create offers to reward loyal travellers and boost retention.</p>
            <Link href="/operator/offers/new"><Button variant="outline">+ Add offer</Button></Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {offers.map((o) => (
          <Card key={o.id}>
            <CardContent className="flex items-center justify-between py-4 px-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-reward/10 flex items-center justify-center shrink-0">
                  <Tag className="h-4 w-4 text-reward" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-semibold">{LEVEL_LABELS[o.level] ?? o.level}</Badge>
                    <span className="text-sm font-medium">
                      {o.discountType === "PERCENTAGE"
                        ? `${o.percentage}% off`
                        : `₹${((o.flatAmountMinor ?? 0) / 100).toFixed(0)} flat off`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Unlocks at trip {o.unlockTripNumber} · Reward on trip {o.rewardTripNumber}
                    {o.maxCapMinor ? ` · Max ₹${(o.maxCapMinor / 100).toFixed(0)}` : ""}
                    {o.groupBonusPerHead > 0 ? ` · ₹${(o.groupBonusPerHead / 100).toFixed(0)}/head group bonus` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={o.isActive ? "default" : "secondary"} className="text-xs">{o.isActive ? "Active" : "Inactive"}</Badge>
                <Link href={`/operator/offers/${o.id}`} className="text-xs text-primary hover:underline">Edit</Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
