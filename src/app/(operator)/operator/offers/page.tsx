import { requireOperator } from "@/lib/auth/session";
import { offerTemplateRepository } from "@/repositories/offer-template.repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Tag, Settings2, Gift, Zap, CheckCircle, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoyaltyLevel } from "@prisma/client";

const TIER_META: Array<{
  level: LoyaltyLevel;
  code: string;
  name: string;
  range: string;
  desc: string;
  gradient: string;
  ringClass: string;
  softBg: string;
  textAccent: string;
}> = [
  {
    level: "LEVEL_1",
    code: "L1",
    name: "Welcome",
    range: "Trips 1–4",
    desc: "First-time reward for new loyal customers. Set a percentage or flat discount to greet them.",
    gradient: "from-slate-400 to-slate-500",
    ringClass: "ring-slate-200 dark:ring-slate-700",
    softBg: "bg-slate-50 dark:bg-slate-900/40",
    textAccent: "text-slate-600 dark:text-slate-400",
  },
  {
    level: "LEVEL_2",
    code: "L2",
    name: "Stay",
    range: "Trips 5–8",
    desc: "Reward customers who keep coming back. Add group bonuses to encourage co-travel.",
    gradient: "from-blue-400 to-blue-600",
    ringClass: "ring-blue-200 dark:ring-blue-800",
    softBg: "bg-blue-50 dark:bg-blue-900/30",
    textAccent: "text-blue-600 dark:text-blue-400",
  },
  {
    level: "LEVEL_3",
    code: "L3",
    name: "Loyalty",
    range: "Trips 9–12",
    desc: "Your proven loyal riders. Offer a flat reward or a higher discount to acknowledge their commitment.",
    gradient: "from-violet-400 to-purple-600",
    ringClass: "ring-purple-200 dark:ring-purple-800",
    softBg: "bg-purple-50 dark:bg-purple-900/30",
    textAccent: "text-purple-600 dark:text-purple-400",
  },
  {
    level: "LEVEL_4",
    code: "L4",
    name: "Champion",
    range: "Trips 13+",
    desc: "Top-tier customers who chose you above all others. Give them your best deal — they've earned it.",
    gradient: "from-amber-400 to-orange-500",
    ringClass: "ring-amber-200 dark:ring-amber-800",
    softBg: "bg-amber-50 dark:bg-amber-900/30",
    textAccent: "text-amber-600 dark:text-amber-400",
  },
];

export default async function OperatorOffersPage() {
  const { operatorId } = await requireOperator();
  const offers = await offerTemplateRepository.listByOperator(operatorId);

  const byLevel = new Map(offers.map((o) => [o.level, o]));
  const configured = offers.length;

  return (
    <div className="p-6 max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Loyalty Offer Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set your exclusive reward for each loyalty tier. Travelers see these as they earn points with you.
          </p>
        </div>
        <Link href="/operator/offers/new">
          <Button variant="action" className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add offer
          </Button>
        </Link>
      </div>

      {/* Progress summary */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-action/10">
          <Gift className="h-5 w-5 text-action" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            {configured === 4
              ? "All 4 tiers configured — travelers can start earning!"
              : `${configured} of 4 tiers configured`}
          </p>
          <p className="text-xs text-muted-foreground">
            Travelers only see a tier&apos;s reward after you configure it here.
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {TIER_META.map((t) => (
            <div
              key={t.level}
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                byLevel.has(t.level) ? "bg-action" : "bg-muted-foreground/20"
              )}
              title={t.name}
            />
          ))}
        </div>
      </div>

      {/* Tier cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {TIER_META.map((tier, i) => {
          const offer = byLevel.get(tier.level);
          const isConfigured = Boolean(offer);

          return (
            <div
              key={tier.level}
              className={cn(
                "relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all",
                isConfigured
                  ? "border-border shadow-sm"
                  : "border-dashed border-border/60 opacity-80"
              )}
            >
              {/* Gradient accent bar */}
              <div className={cn("h-1 w-full bg-gradient-to-r", tier.gradient, !isConfigured && "opacity-30")} />

              <div className="flex flex-col gap-4 p-5">
                {/* Tier header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black text-white bg-gradient-to-br shadow-md",
                        tier.gradient,
                        !isConfigured && "opacity-50"
                      )}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{tier.name}</p>
                      <p className={cn("text-xs font-medium", tier.textAccent)}>
                        {tier.range}
                      </p>
                    </div>
                  </div>

                  {isConfigured ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-action/10 px-2.5 py-1 text-xs font-semibold text-action">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      <CircleDashed className="h-3.5 w-3.5" />
                      Not set
                    </span>
                  )}
                </div>

                {/* Tier description */}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {tier.desc}
                </p>

                {/* Offer details or CTA */}
                {offer ? (
                  <div className={cn("rounded-xl p-4 space-y-3", tier.softBg)}>
                    <div className="flex items-center gap-2">
                      <Tag className={cn("h-4 w-4 shrink-0", tier.textAccent)} />
                      <span className="text-sm font-bold text-foreground">
                        {offer.discountType === "PERCENTAGE"
                          ? `${offer.percentage}% off`
                          : `₹${((offer.flatAmountMinor ?? 0) / 100).toFixed(0)} flat off`}
                      </span>
                      {offer.maxCapMinor ? (
                        <span className="text-xs text-muted-foreground">
                          (max ₹{(offer.maxCapMinor / 100).toFixed(0)})
                        </span>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span>Unlocks at trip <strong className="text-foreground">#{offer.unlockTripNumber}</strong></span>
                      <span>Reward on trip <strong className="text-foreground">#{offer.rewardTripNumber}</strong></span>
                      {offer.groupBonusPerHead > 0 ? (
                        <span className="col-span-2 flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-action" />
                          ₹{(offer.groupBonusPerHead / 100).toFixed(0)}/head group bonus
                          {offer.groupBonusMaxHeads > 0 ? ` (up to ${offer.groupBonusMaxHeads} people)` : ""}
                        </span>
                      ) : null}
                    </div>

                    <Link href={`/operator/offers/${offer.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-3 text-xs mt-1">
                        <Settings2 className="h-3.5 w-3.5" />
                        Edit offer
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link href={`/operator/offers/new?level=${tier.level}`}>
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary"
                    >
                      <Plus className="h-4 w-4" />
                      Set {tier.name} offer
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-4">
        <Zap className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p className="font-semibold">These offers are exclusive to your travelers.</p>
          <p>Travelers who book with you climb your loyalty ladder — L1 through L4. Each tier&apos;s reward is applied automatically at the trip you specify. Group bonuses stack on top of tier discounts.</p>
        </div>
      </div>
    </div>
  );
}
