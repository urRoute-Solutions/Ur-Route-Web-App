"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bus, ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingDTO } from "@/dto/booking.dto";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function statusVariant(status: string): "default" | "destructive" | "secondary" | "outline" {
  if (status === "CONFIRMED")  return "default";
  if (status === "CANCELLED")  return "destructive";
  if (status === "COMPLETED")  return "secondary";
  return "outline";
}

function statusDot(status: string) {
  if (status === "CONFIRMED")  return "bg-action";
  if (status === "CANCELLED")  return "bg-destructive";
  if (status === "COMPLETED")  return "bg-blue-500";
  return "bg-amber-400";
}

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
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-white dark:bg-card border-b border-border">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">My Bookings</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {total > 0 ? `${total} total booking${total !== 1 ? "s" : ""}` : "No bookings yet"}
              </p>
            </div>
            <Link href="/search">
              <Button variant="action" size="sm" className="gap-1.5 font-semibold">
                <Plus className="h-3.5 w-3.5" />
                New Booking
              </Button>
            </Link>
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-1 mt-5 overflow-x-auto pb-px">
            {STATUS_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setStatus(t.value)}
                className={cn(
                  "shrink-0 text-sm font-medium px-4 py-1.5 rounded-full transition-all",
                  status === t.value
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <Bus className="h-10 w-10 text-muted-foreground/25" />
            </div>
            <p className="font-bold text-lg">No bookings found</p>
            <p className="text-sm text-muted-foreground max-w-[300px] mx-auto">
              {status
                ? `You have no ${status.toLowerCase()} bookings.`
                : "You haven't booked any trips yet. Find your next journey!"}
            </p>
            <Link href="/search">
              <Button variant="action" className="mt-2 font-semibold">Search buses</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-card border border-border rounded-xl overflow-hidden">
            {bookings.map((b, idx) => (
              <Link
                key={b.id}
                href={`/bookings/${b.id}`}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors group",
                  idx !== bookings.length - 1 && "border-b border-border"
                )}
              >
                {/* Status dot + PNR */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className={cn("w-2.5 h-2.5 rounded-full", statusDot(b.status))} />
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Bus className="h-4.5 w-4.5 text-primary" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-mono font-bold text-sm tracking-wide">{b.pnr}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {new Date(b.createdAt).toLocaleDateString("en-IN", {
                        weekday: "short", day: "numeric", month: "short", year: "numeric"
                      })}
                      {" · "}
                      {b.passengerCount} pax
                    </p>
                  </div>
                </div>

                {/* Amount + status badge + arrow */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="font-extrabold text-sm">₹{(b.totalFareMinor / 100).toFixed(0)}</p>
                  </div>
                  <Badge variant={statusVariant(b.status)} className="text-[10px] font-semibold">
                    {b.status}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}

            {total > 20 && (
              <div className="px-5 py-3 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">Showing 20 of {total} bookings</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
