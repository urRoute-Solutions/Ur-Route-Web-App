import { requireOperator } from "@/lib/auth/session";
import { userRepository } from "@/repositories/user.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { routeRepository } from "@/repositories/route.repository";
import { tripRepository } from "@/repositories/trip.repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight, MapPin, Bus, Users, TrendingUp,
  Plus, CalendarDays, IndianRupee, BookOpen,
} from "lucide-react";

function greetingPart() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function OperatorDashboardPage() {
  const { operatorId, userId } = await requireOperator();

  const [user, [routes, totalRoutes], [trips, totalTrips], [recentBookings, totalBookings]] =
    await Promise.all([
      userRepository.findById(userId),
      routeRepository.listByOperator(operatorId, { page: 1, pageSize: 5 }),
      tripRepository.listByOperator(operatorId, { page: 1, pageSize: 5 }),
      bookingRepository.listByOperator(operatorId, { page: 1, pageSize: 5 }),
    ]);

  const confirmedBookings = recentBookings.filter((b) => b.status === "CONFIRMED").length;
  const revenue = recentBookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((s, b) => s + b.totalFareMinor, 0);

  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  const STATS = [
    { icon: MapPin,       label: "Routes",         value: totalRoutes,   color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-950/30",   href: "/operator/routes" },
    { icon: Bus,          label: "Trips",           value: totalTrips,    color: "text-primary",    bg: "bg-primary/5",                     href: "/operator/trips" },
    { icon: BookOpen,     label: "Bookings",        value: totalBookings, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30",href: "/operator/bookings" },
    { icon: IndianRupee,  label: "Revenue (recent)",value: `₹${(revenue/100).toLocaleString("en-IN",{maximumFractionDigits:0})}`, color: "text-action", bg: "bg-action/5", href: "/operator/revenue" },
  ];

  function statusVariant(status: string): "default" | "destructive" | "secondary" | "outline" {
    if (status === "CONFIRMED") return "default";
    if (status === "CANCELLED") return "destructive";
    return "secondary";
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Greeting banner ── */}
      <div className="bg-sidebar text-white">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/60 text-sm mb-1">{greetingPart()}</p>
              <h1 className="text-2xl font-extrabold tracking-tight">{firstName}</h1>
              <p className="text-white/50 text-sm mt-1">
                {totalBookings > 0
                  ? `${totalBookings} booking${totalBookings !== 1 ? "s" : ""} across ${totalRoutes} route${totalRoutes !== 1 ? "s" : ""}.`
                  : "Add your first route and start accepting bookings."}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/operator/trips/new">
                <Button variant="outline" size="sm" className="gap-1.5 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  <Plus className="h-3.5 w-3.5" /> Add Trip
                </Button>
              </Link>
              <Link href="/operator/routes/new">
                <Button variant="action" size="sm" className="gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Add Route
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ icon: Icon, label, value, color, bg, href }) => (
            <Link
              key={label}
              href={href}
              className="group bg-white dark:bg-card border border-border rounded-xl p-5 flex items-start gap-4 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-tight">{label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Recent content grid ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent routes */}
          <div className="bg-white dark:bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" /> Routes
              </h2>
              <Link href="/operator/routes" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {routes.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-muted-foreground">No routes yet.</p>
                <Link href="/operator/routes/new" className="text-sm text-primary hover:underline font-medium">
                  Add your first route →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {routes.map((r) => (
                  <Link
                    key={r.id}
                    href={`/operator/routes/${r.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {r.origin}
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      {r.destination}
                    </div>
                    <Badge variant={r.isActive ? "default" : "secondary"} className="text-xs">
                      {r.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent bookings */}
          <div className="bg-white dark:bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Recent Bookings
              </h2>
              <Link href="/operator/bookings" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {recentBookings.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-muted-foreground">No bookings yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="font-mono text-sm font-semibold">{b.pnr}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {b.passengerCount} pax · {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="text-sm font-bold">₹{(b.totalFareMinor / 100).toFixed(0)}</p>
                        <Badge variant={statusVariant(b.status)} className="text-[10px]">{b.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick links ── */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: CalendarDays, label: "Schedule a Trip", href: "/operator/trips/new", desc: "Add departure, seats, pricing" },
            { icon: Users, label: "Loyalty Offers", href: "/operator/offers", desc: "Set tier discounts & group bonuses" },
            { icon: TrendingUp, label: "Analytics", href: "/operator/analytics", desc: "Booking trends and seat occupancy" },
          ].map(({ icon: Icon, label, href, desc }) => (
            <Link
              key={label}
              href={href}
              className="group flex items-start gap-3 bg-white dark:bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto mt-1 shrink-0 group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
