import { requireOperator } from "@/lib/auth/session";
import { bookingRepository } from "@/repositories/booking.repository";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default async function OperatorBookingsPage() {
  const { operatorId } = await requireOperator();
  const [bookings, total] = await bookingRepository.listByOperator(operatorId, { page: 1, pageSize: 50 });

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-sm text-muted-foreground">{total} total</p>
      </div>

      {bookings.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <Users className="h-10 w-10 mx-auto text-muted-foreground/30" />
            <p className="font-medium">No bookings yet</p>
            <p className="text-sm text-muted-foreground">Bookings will appear here when travellers book your trips.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {bookings.map((b) => (
          <Card key={b.id}>
            <CardContent className="flex items-center justify-between py-4 px-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-mono font-semibold text-sm">{b.pnr}</p>
                  <p className="text-xs text-muted-foreground">{b.passengerCount} pax · {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="font-bold text-sm">₹{(b.totalFareMinor / 100).toFixed(0)}</p>
                <Badge variant={b.status === "CONFIRMED" ? "default" : b.status === "CANCELLED" ? "destructive" : "secondary"} className="text-xs">
                  {b.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {total > 50 && <p className="text-sm text-center text-muted-foreground">Showing 50 of {total}</p>}
      </div>
    </div>
  );
}
