import { requireAuth } from "@/lib/auth/session";
import { getTicketUseCase } from "@/usecases/bookings/get-ticket.usecase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bus, MapPin, Clock, Users, Phone, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

const STATUS_COLOR: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-800 border-green-200",
  COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const principal = await requireAuth();
  const { id } = await params;

  let ticket;
  try {
    ticket = await getTicketUseCase(id, principal);
  } catch {
    notFound();
  }

  const qrData = encodeURIComponent(ticket.pnr);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=160x160&margin=8&color=1B2D78`;

  const discountTotal = ticket.discountMinor + ticket.groupBonusMinor;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4 print:bg-white print:py-0">
      {/* Back + Print — hidden on print */}
      <div className="max-w-lg mx-auto mb-4 flex items-center justify-between print:hidden">
        <Link
          href={`/bookings/${ticket.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to booking
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-colors"
        >
          <Download className="h-3.5 w-3.5" /> Save / Print
        </button>
      </div>

      {/* Ticket card */}
      <div className="max-w-lg mx-auto bg-white dark:bg-card rounded-2xl shadow-xl overflow-hidden border border-border print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="bg-[#1B2D78] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <Logo size="default" variant="white" />
            <span className={cn("rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wide", STATUS_COLOR[ticket.status])}>
              {ticket.status}
            </span>
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-white/60">Boarding Pass</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-2xl font-black">{ticket.route.origin}</span>
            <div className="flex-1 flex items-center gap-1">
              <div className="h-px flex-1 border-t border-dashed border-white/30" />
              <Bus className="h-4 w-4 text-white/50" />
              <div className="h-px flex-1 border-t border-dashed border-white/30" />
            </div>
            <span className="text-2xl font-black">{ticket.route.destination}</span>
          </div>
          <p className="mt-1 text-sm text-white/70">{ticket.operator.name}</p>
        </div>

        {/* Tear line */}
        <div className="relative h-6 bg-slate-100 dark:bg-slate-800/50">
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-950 border border-border" />
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-950 border border-border" />
          <div className="h-px border-t border-dashed border-border mx-6 mt-3" />
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* PNR + QR */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">PNR / Booking Ref</p>
              <p className="mt-1 text-3xl font-black font-mono tracking-widest text-[#1B2D78] dark:text-blue-400">{ticket.pnr}</p>
              <p className="mt-1 text-xs text-muted-foreground">Booked {new Date(ticket.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
            <img
              src={qrUrl}
              alt={`QR code for ${ticket.pnr}`}
              width={80}
              height={80}
              className="rounded-lg border border-border shrink-0"
            />
          </div>

          {/* Journey grid */}
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 dark:bg-muted/30 p-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Departure
              </p>
              <p className="mt-1 font-black text-lg text-foreground">{fmtTime(ticket.trip.departureAt)}</p>
              <p className="text-xs text-muted-foreground">{fmtDate(ticket.trip.departureAt)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Arrival
              </p>
              <p className="mt-1 font-black text-lg text-foreground">{fmtTime(ticket.trip.arrivalAt)}</p>
              <p className="text-xs text-muted-foreground">{fmtDate(ticket.trip.arrivalAt)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Bus className="h-3 w-3" /> Bus
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">{ticket.trip.busName}</p>
              <p className="text-xs text-muted-foreground">{ticket.trip.seatType} · {ticket.trip.layout}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" /> Passengers
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">{ticket.passengerCount}</p>
            </div>
          </div>

          {/* Boarding / Dropping */}
          {(ticket.boardingPoint || ticket.droppingPoint) && (
            <div className="flex gap-4">
              {ticket.boardingPoint && (
                <div className="flex-1 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-green-700 dark:text-green-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Boarding
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-green-900 dark:text-green-200">{ticket.boardingPoint.name}</p>
                  {ticket.boardingPoint.time && <p className="text-xs text-green-700 dark:text-green-400">{ticket.boardingPoint.time}</p>}
                </div>
              )}
              {ticket.droppingPoint && (
                <div className="flex-1 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-700 dark:text-red-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Drop-off
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-red-900 dark:text-red-200">{ticket.droppingPoint.name}</p>
                </div>
              )}
            </div>
          )}

          {/* Passengers list */}
          {ticket.passengers.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Passengers</p>
              <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                {ticket.passengers.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="font-semibold text-foreground">{p.name}</span>
                    <span className="text-muted-foreground text-xs">{p.age}y · {p.gender} · Seat {p.seatLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fare */}
          <div className="rounded-xl border border-border p-4 space-y-1.5 text-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Fare Summary</p>
            <div className="flex justify-between text-muted-foreground">
              <span>Base fare</span><span>₹{(ticket.baseFareMinor / 100).toFixed(2)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Loyalty discount{ticket.appliedLevel ? ` (${ticket.appliedLevel.replace("LEVEL_", "L")})` : ""}</span>
                <span>− ₹{(discountTotal / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>GST</span><span>₹{(ticket.taxMinor / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-base border-t border-border pt-1.5 mt-1.5">
              <span>Total Paid</span><span>₹{(ticket.totalFareMinor / 100).toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <span>urRoute · support@urroute.in</span>
            {ticket.operator.contactPhone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> {ticket.operator.contactPhone}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
