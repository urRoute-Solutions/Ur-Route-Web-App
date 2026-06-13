import { requireRole } from "@/lib/auth/session";
import { rewardProgressRepository } from "@/repositories/reward-progress.repository";
import { rewardHistoryRepository } from "@/repositories/reward-history.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LEVEL_META: Record<string, { label: string; color: string; trips: number }> = {
  LEVEL_1: { label: "Welcome", color: "bg-slate-200", trips: 0 },
  LEVEL_2: { label: "Stay", color: "bg-blue-200", trips: 4 },
  LEVEL_3: { label: "Loyalty", color: "bg-purple-200", trips: 8 },
  LEVEL_4: { label: "Champion", color: "bg-amber-200", trips: 12 },
};

export default async function RewardsPage() {
  const principal = await requireRole("TRAVELER");

  const [progress, [history]] = await Promise.all([
    rewardProgressRepository.listByUser(principal.userId),
    rewardHistoryRepository.listByUser(principal.userId, { page: 1, pageSize: 20 }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold">My Rewards</h1>

        {progress.map((p) => {
          const meta = LEVEL_META[p.currentLevel];
          return (
            <Card key={p.operatorId}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${meta?.color}`} />
                  {meta?.label ?? p.currentLevel}
                  {p.status === "FROZEN" && <Badge variant="secondary">Frozen</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (p.completedTrips / 12) * 100)}%` }}
                  />
                </div>
                <p className="text-sm text-slate-500">{p.completedTrips} trips · {p.cycleCount} cycles</p>
              </CardContent>
            </Card>
          );
        })}

        <section>
          <h2 className="text-lg font-semibold mb-3">Reward History</h2>
          <div className="space-y-3">
            {history.length === 0 && (
              <p className="text-slate-400 text-center py-8">No rewards yet — keep riding!</p>
            )}
            {history.map((h) => (
              <Card key={h.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{h.title}</p>
                    <p className="text-xs text-slate-500">{new Date(h.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <Badge variant={h.status === "REDEEMED" ? "default" : "outline"}>{h.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
