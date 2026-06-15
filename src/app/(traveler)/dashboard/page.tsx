import { requireRole } from "@/lib/auth/session";
import { userRepository } from "@/repositories/user.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { rewardProgressRepository } from "@/repositories/reward-progress.repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { ArrowRight, Bus, Gift, Search, TrendingUp, Ticket, Users, Wallet } from "lucide-react";

const LEVEL_META: Record<string, { label: string; next: string; max: number; bar: string; badge: string }> = {
  LEVEL_1: { label: "Welcome", next: "Stay",     max: 4,  bar: "bg-slate-400", badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" },
  LEVEL_2: { label: "Stay",    next: "Loyalty",  max: 8,  bar: "bg-blue-500",  badge: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300" },
  LEVEL_3: { label: "Loyalty", next: "Champion", max: 12, bar: "bg-purple-500",badge: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300" },
  LEVEL_4: { label: "Champion",next: "Champion", max: 12, bar: "bg-amber-500", badge: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300" },
};

function statusVariant(status: string): "default" | "destructive" | "secondary" | "outline" {
  if (status === "CONFIRMED") return "default";
  if (status === "CANCELLED") return "destructive";
  return "secondary";
}

function greetingPart() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const principal = await requireRole("TRAVELER");

  const [user, [bookings, totalBookings], allProgress] = await Promise.all([
    userRepository.findById(principal.userId),
    bookingRepository.listByUser(principal.userId, { page: 1, pageSize: 5 }),
    rewardProgressRepository.listByUser(principal.userId),
  ]);

  const activeProgress = allProgress.filter((p) => p.status === "ACTIVE");
  const totalTrips = activeProgress.reduce((s, p) => s + p.completedTrips, 0);
  const firstName = user?.fullName?.split(" ")[0] ?? "there";
  const walletBalance = (user as { walletBalanceMinor?: number })?.walletBalanceMinor ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Greeting banner ──────────────────────────────────── */}
      <div className="bg-sidebar text-white">
        <div className="container py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/60 text-sm mb-1">{greetingPart()}</p>
              <h1 className="text-2xl font-extrabold tracking-tight">
                {firstName}
              </h1>
              <p className="text-white/50 text-sm mt-1">
                {totalBookings > 0
                  ? `You have ${totalBookings} booking${totalBookings !== 1 ? "s" : ""} so far.`
                  : "Start your first journey today."}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {walletBalance > 0 && (
                <div className="flex items-center gap-1.5 bg-white/10 text-white rounded-xl px-3 py-2">
                  <Wallet className="h-4 w-4 text-white/70" />
                  <div>
                    <p className="text-[10px] text-white/60 leading-none">Wallet</p>
                    <p className="text-sm font-bold leading-none mt-0.5">₹{(walletBalance / 100).toFixed(0)}</p>
                  </div>
                </div>
              )}
              <Link href="/search">
                <Button variant="action" className="font-semibold gap-2">
                  <Search className="h-4 w-4" />
                  Search Buses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">

        {/* ── Stats strip ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Ticket, label: "Total Bookings", value: totalBookings, color: "text-primary" },
            { icon: Bus, label: "Trips Completed", value: totalTrips, color: "text-action" },
            { icon: Users, label: "Operators Ridden", value: allProgress.length, color: "text-blue-500" },
            { icon: Gift, label: "Reward Levels Active", value: activeProgress.length, color: "text-amber-500" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-card border border-border rounded-xl p-5 flex items-start gap-4"
            >
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-tight">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Loyalty progress ─────────────────────────────────── */}
        {activeProgress.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Gift className="h-4 w-4 text-amber-500" />
                Loyalty Progress
              </h2>
              <Link href="/rewards" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {activeProgress.map((p) => {
                const meta = LEVEL_META[p.currentLevel];
                const pct = meta ? Math.min(100, (p.completedTrips / meta.max) * 100) : 0;
                return (
                  <div key={p.operatorId} className="bg-white dark:bg-card border border-border rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta?.badge ?? "bg-muted text-muted-foreground"}`}>
                        {meta?.label ?? p.currentLevel}
                      </span>
                      <span className="text-xs text-muted-foreground">{p.completedTrips} / {meta?.max ?? "?"} trips</span>
                    </div>
                    <Progress value={pct} className={`h-2 ${meta?.bar ?? ""}`} />
                    <p className="text-xs text-muted-foreground">
                      {meta && p.currentLevel !== "LEVEL_4"
                        ? `${Math.max(0, meta.max - p.completedTrips)} more trips to ${meta.next}`
                        : "Champion — you're at the top!"}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── CTA if no loyalty progress ───────────────────────── */}
        {allProgress.length === 0 && (
          <div className="bg-white dark:bg-card border border-dashed border-border rounded-xl p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <Bus className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="font-bold">Start your first journey</p>
            <p className="text-sm text-muted-foreground">Book a bus and start earning loyalty rewards.</p>
            <Link href="/search">
              <Button variant="action" className="mt-1">Search buses</Button>
            </Link>
          </div>
        )}

        {/* ── Recent bookings ───────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Recent Bookings
            </h2>
            <Link href="/bookings" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
              All bookings <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No bookings yet. Book your first bus!</p>
          ) : (
            <div className="bg-white dark:bg-card border border-border rounded-xl overflow-hidden">
              {bookings.map((b, idx) => (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className={`flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    idx !== bookings.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bus className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono font-semibold text-sm">{b.pnr}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {new Date(b.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })} · {b.passengerCount} pax
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-sm">₹{(b.totalFareMinor / 100).toFixed(0)}</p>
                    </div>
                    <Badge variant={statusVariant(b.status)} className="text-[10px]">
                      {b.status}
                    </Badge>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
