import { requireRole } from "@/lib/auth/session";
import { rewardProgressRepository } from "@/repositories/reward-progress.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Gift, Star, Lock, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const LEVEL_META = {
  LEVEL_1: { label: "Welcome", color: "bg-slate-400", textColor: "text-slate-600", max: 4 },
  LEVEL_2: { label: "Stay", color: "bg-blue-500", textColor: "text-blue-600", max: 8 },
  LEVEL_3: { label: "Loyalty", color: "bg-purple-500", textColor: "text-purple-600", max: 12 },
  LEVEL_4: { label: "Champion", color: "bg-amber-500", textColor: "text-amber-600", max: 12 },
} as const;

const LEVEL_ORDER: Array<keyof typeof LEVEL_META> = ["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4"];

export default async function RewardsPage() {
  const principal = await requireRole("TRAVELER");

  const allProgress = await rewardProgressRepository.listByUser(principal.userId);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 space-y-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <div className="flex items-center gap-3">
        <Gift className="h-6 w-6 text-reward" />
        <h1 className="text-2xl font-bold">My Rewards</h1>
      </div>

      {allProgress.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <Star className="h-12 w-12 mx-auto text-muted-foreground/30" />
            <p className="font-medium">No loyalty progress yet</p>
            <p className="text-sm text-muted-foreground">Book your first trip to start earning rewards.</p>
          </CardContent>
        </Card>
      )}

      {allProgress.map((prog) => {
        const meta = LEVEL_META[prog.currentLevel as keyof typeof LEVEL_META];
        const pct = meta ? Math.min(100, (prog.completedTrips / meta.max) * 100) : 0;
        const currentIdx = LEVEL_ORDER.indexOf(prog.currentLevel as keyof typeof LEVEL_META);

        return (
          <Card key={prog.operatorId}>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base">{prog.operatorId}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={prog.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                    {prog.status}
                  </Badge>
                  <Badge variant="outline" className={`font-semibold ${meta?.textColor ?? ""}`}>
                    {meta?.label ?? prog.currentLevel}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{prog.completedTrips} trips completed</span>
                  {prog.currentLevel !== "LEVEL_4" && (
                    <span className="text-muted-foreground">{meta ? meta.max - prog.completedTrips : 0} to next level</span>
                  )}
                </div>
                <Progress value={pct} className="h-3" />
              </div>

              {/* Level journey */}
              <div className="grid grid-cols-4 gap-2">
                {LEVEL_ORDER.map((lvl, idx) => {
                  const lvlMeta = LEVEL_META[lvl];
                  const reached = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div key={lvl} className={`rounded-lg p-3 text-center space-y-1 border ${isCurrent ? "border-primary shadow-sm" : "border-border"} ${reached ? "" : "opacity-40"}`}>
                      {reached ? (
                        <CheckCircle className="h-5 w-5 mx-auto text-green-500" />
                      ) : (
                        <Lock className="h-5 w-5 mx-auto text-muted-foreground" />
                      )}
                      <p className={`text-xs font-semibold ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>{lvlMeta.label}</p>
                      <p className="text-[10px] text-muted-foreground">L{idx + 1}</p>
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground">
                {prog.status === "FROZEN" && prog.frozenAt && (
                  <p className="text-amber-600">Progress frozen on {new Date(prog.frozenAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}. Book with this operator to resume.</p>
                )}
                {prog.status === "ACTIVE" && (
                  <p>Keep booking with this operator to level up and earn discounts.</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
