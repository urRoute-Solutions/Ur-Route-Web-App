import { requireOperator } from "@/lib/auth/session";
import { bookingRepository } from "@/repositories/booking.repository";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function OperatorBookingsPage() {
  const { operatorId } = await requireOperator();
  const [bookings, total] = await bookingRepository.listByOperator(operatorId, { page: 1, pageSize: 50 });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Bookings <span className="text-slate-400 text-base">({total})</span></h1>
        <div className="space-y-3">
          {bookings.length === 0 && <p className="text-slate-400 text-center py-12">No bookings yet.</p>}
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-mono font-medium">{b.pnr}</p>
                  <p className="text-xs text-slate-400">{new Date(b.createdAt).toLocaleDateString("en-IN")} · {b.passengerCount} pax</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{(b.totalFareMinor / 100).toFixed(0)}</p>
                  <Badge variant={b.status === "CONFIRMED" ? "default" : "outline"} className="text-xs">{b.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
