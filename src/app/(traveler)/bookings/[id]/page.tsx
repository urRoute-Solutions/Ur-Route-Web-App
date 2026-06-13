import { requireRole } from "@/lib/auth/session";
import { getBookingUseCase } from "@/usecases/bookings/get-booking.usecase";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CancelBookingButton } from "./cancel-button";
import { PayButton } from "./pay-button";
import { CheckCircle, MapPin, Users, Calendar, CreditCard, Tag } from "lucide-react";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const principal = await requireRole("TRAVELER");
  const { id } = await params;

  let booking;
  try {
    booking = await getBookingUseCase(id, principal);
  } catch {
    notFound();
  }

  const isPending = booking.status === "PENDING";
  const isConfirmed = booking.status === "CONFIRMED";
  const isCancellable = isPending || isConfirmed;
  const discountTotal = booking.discountMinor + booking.groupBonusMinor;

  return (
    <div className="p-6 max-w-2xl space-y-6">
      {/* Status banner */}
      <div className={`flex items-center gap-3 rounded-xl p-4 ${
        isConfirmed ? "bg-green-50 text-green-800 border border-green-200" :
        isPending ? "bg-amber-50 text-amber-800 border border-amber-200" :
        booking.status === "CANCELLED" ? "bg-red-50 text-red-800 border border-red-200" :
        "bg-slate-50 border"}`}>
        <CheckCircle className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">{
            isConfirmed ? "Booking Confirmed" :
            isPending ? "Payment Pending" :
            booking.status === "CANCELLED" ? "Booking Cancelled" : "Trip Completed"
          }</p>
          <p className="text-sm opacity-80">PNR: <span className="font-mono font-bold">{booking.pnr}</span></p>
        </div>
        <Badge className="ml-auto">{booking.status}</Badge>
      </div>

      {/* Fare breakdown */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" /> Fare Breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Base fare</span><span>₹{(booking.baseFareMinor / 100).toFixed(2)}</span></div>
          {discountTotal > 0 && (
            <div className="flex justify-between text-green-600"><span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> Loyalty discount</span><span>− ₹{(discountTotal / 100).toFixed(2)}</span></div>
          )}
          <div className="flex justify-between"><span className="text-muted-foreground">Tax (GST)</span><span>₹{(booking.taxMinor / 100).toFixed(2)}</span></div>
          <Separator />
          <div className="flex justify-between font-bold text-base"><span>Total</span><span>₹{(booking.totalFareMinor / 100).toFixed(2)}</span></div>
        </CardContent>
      </Card>

      {/* Trip details */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Journey Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{booking.passengerCount} passenger{booking.passengerCount > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{new Date(booking.createdAt).toLocaleDateString("en-IN", { dateStyle: "full" })}</span>
          </div>
          {booking.appliedLevel && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-reward shrink-0" />
              <span className="text-reward font-medium">Loyalty level {booking.appliedLevel.replace("LEVEL_", "L")} applied</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passengers */}
      {Array.isArray(booking.passengers) && (booking.passengers as unknown[]).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Passengers</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y">
              {(booking.passengers as Array<{ name: string; age: number; gender: string; seatLabel: string }>).map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground">{p.age}y · {p.gender} · Seat {p.seatLabel}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {isPending && <PayButton bookingId={booking.id} amountMinor={booking.totalFareMinor} />}
        {isCancellable && <CancelBookingButton bookingId={booking.id} />}
      </div>
    </div>
  );
}
