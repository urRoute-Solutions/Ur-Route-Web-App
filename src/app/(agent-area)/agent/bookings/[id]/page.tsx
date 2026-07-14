import { requireAgent } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CheckCircle, MapPin, Users, Calendar, CreditCard, Tag, Ticket, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "@/components/ui/back-button";

const STATUS_VARIANT: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  CONFIRMED: "default",
  CANCELLED: "destructive",
  COMPLETED: "secondary",
  PENDING: "outline",
};

const STATUS_COLOR: Record<string, string> = {
  CONFIRMED: "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800",
  PENDING: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800",
  CANCELLED: "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800",
  COMPLETED: "bg-slate-50 border dark:bg-muted/30",
};

export default async function AgentBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAgent();
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { trip: { include: { route: true } } },
  });
  if (!booking) notFound();

  const trip = booking.trip;
  const route = trip?.route;
  const discountTotal = booking.discountMinor + booking.groupBonusMinor;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-6 space-y-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <BackButton fallback="/agent/dashboard" variant="default" />
        <div className="flex-1">
          <h1 className="text-xl font-black">Booking Detail</h1>
          <p className="text-xs text-muted-foreground font-mono">{booking.pnr}</p>
        </div>
        <Badge variant={STATUS_VARIANT[booking.status] ?? "outline"}>
          {booking.status}
        </Badge>
      </div>

      {/* Status banner */}
      <div className={`flex items-center gap-3 rounded-xl p-4 border ${STATUS_COLOR[booking.status] ?? "bg-slate-50 border dark:bg-muted/30"}`}>
        <CheckCircle className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">
            {booking.status === "CONFIRMED" ? "Booking Confirmed" :
             booking.status === "PENDING" ? "Payment Pending" :
             booking.status === "CANCELLED" ? "Booking Cancelled" : "Trip Completed"}
          </p>
          <p className="text-xs opacity-80">
            Booked on {new Date(booking.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
          </p>
        </div>
      </div>

      {/* Journey */}
      {route && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Journey Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="h-6 w-px bg-border" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <p className="font-semibold">{route.origin}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">{route.destination}</p>
                </div>
              </div>
            </div>
            {trip.departureAt && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                <span>
                  {new Date(trip.departureAt).toLocaleDateString("en-IN", {
                    weekday: "short", year: "numeric", month: "short", day: "numeric",
                  })}
                  {" "}
                  {new Date(trip.departureAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit", minute: "2-digit", hour12: true,
                  })}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              <span>{booking.passengerCount} passenger{booking.passengerCount > 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                Booked {new Date(booking.createdAt).toLocaleDateString("en-IN", { dateStyle: "full" })}
              </span>
            </div>
            {booking.appliedLevel && (
              <div className="flex items-center gap-2 text-amber-600">
                <Tag className="h-4 w-4 shrink-0" />
                <span className="font-medium">
                  Loyalty level {booking.appliedLevel.replace("LEVEL_", "L")} applied
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fare breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Fare Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base fare</span>
            <span>₹{(booking.baseFareMinor / 100).toFixed(2)}</span>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" /> Discount
              </span>
              <span>− ₹{(discountTotal / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (GST)</span>
            <span>₹{(booking.taxMinor / 100).toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span>₹{(booking.totalFareMinor / 100).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Passengers */}
      {Array.isArray(booking.passengers) && (booking.passengers as unknown[]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Ticket className="h-4 w-4" /> Passengers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {(booking.passengers as Array<{ name: string; age: number; gender: string; seatLabel: string; phone?: string }>).map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <span className="font-medium">{p.name}</span>
                    {p.phone && (
                      <span className="text-xs text-muted-foreground ml-2 font-mono">{p.phone}</span>
                    )}
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {p.age}y · {p.gender} · Seat {p.seatLabel}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent note */}
      <p className="text-center text-xs text-muted-foreground">
        Viewing as support agent — read-only access
      </p>
    </div>
  );
}
