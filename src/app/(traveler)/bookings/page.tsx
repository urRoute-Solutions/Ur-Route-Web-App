"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Bus } from "lucide-react";
import type { BookingDTO } from "@/dto/booking.dto";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function BookingsPage() {
  const [status, setStatus] = useState("");
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: "20" });
    if (status) params.set("status", status);
    fetch(`/api/bookings?${params}`)
      .then((r) => r.json())
      .then((json) => {
        setBookings(json.data?.items ?? []);
        setTotal(json.data?.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <Link href="/search"><Button size="sm">+ New booking</Button></Link>
      </div>

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList className="flex-wrap h-auto gap-1">
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.length === 0 && (
            <div className="text-center py-16 space-y-3">
              <Bus className="h-10 w-10 mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground">No {status.toLowerCase() || ""} bookings found.</p>
              <Link href="/search"><Button variant="outline">Search buses</Button></Link>
            </div>
          )}
          {bookings.map((b) => (
            <Link key={b.id} href={`/bookings/${b.id}`}>
              <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                <CardContent className="flex items-center justify-between py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-mono font-semibold">{b.pnr}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {b.passengerCount} pax
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold">₹{(b.totalFareMinor / 100).toFixed(0)}</p>
                    <Badge variant={b.status === "CONFIRMED" ? "default" : b.status === "CANCELLED" ? "destructive" : "secondary"} className="text-xs">
                      {b.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {total > 20 && (
            <p className="text-sm text-center text-muted-foreground">Showing 20 of {total}</p>
          )}
        </div>
      )}
    </div>
  );
}
