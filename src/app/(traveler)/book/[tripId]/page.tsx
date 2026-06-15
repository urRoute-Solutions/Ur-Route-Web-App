"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Bus, ArrowRight, Users, CheckCircle, Lock, ChevronRight, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────
interface SeatInfo { id: string; label: string; deck: string; isBooked: boolean; isLadies: boolean; priceMinor: number }
interface OfferInfo {
  level: string; title: string; description: string | null;
  discountType: string; percentage: number | null; flatAmountMinor: number | null;
  maxCapMinor: number | null; groupBonusPerHead: number; groupBonusMaxHeads: number;
  unlockTripNumber: number;
}
interface TripInfo {
  id: string; departureAt: string; arrivalAt: string; basePriceMinor: number;
  busName: string; seatType: string; layout: string; amenities: string[];
  route: { origin: string; destination: string; distanceKm: number | null; boardingPoints: unknown[]; droppingPoints: unknown[] };
  operator: { id: string; name: string; rating: number };
  seats: SeatInfo[];
}
interface RewardProgress { currentLevel: string; completedTrips: number }
interface Passenger { name: string; age: string; gender: string; seatLabel: string }

// ── Level config ─────────────────────────────────────────────────────────────
const LEVEL_META: Record<string, { emoji: string; label: string; color: string; bg: string; ring: string }> = {
  LEVEL_1: { emoji: "🌱", label: "Level 1 · Welcome",   color: "text-slate-700 dark:text-slate-200",   bg: "bg-slate-100 dark:bg-slate-800",    ring: "ring-slate-400" },
  LEVEL_2: { emoji: "🌟", label: "Level 2 · Stay",      color: "text-blue-700 dark:text-blue-300",     bg: "bg-blue-50 dark:bg-blue-900/40",    ring: "ring-blue-400" },
  LEVEL_3: { emoji: "💎", label: "Level 3 · Loyalty",   color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-50 dark:bg-purple-900/40",ring: "ring-purple-400" },
  LEVEL_4: { emoji: "🏆", label: "Level 4 · Champion",  color: "text-amber-700 dark:text-amber-300",   bg: "bg-amber-50 dark:bg-amber-900/40",  ring: "ring-amber-400" },
};
const LEVEL_ORDER = ["LEVEL_1","LEVEL_2","LEVEL_3","LEVEL_4"];

function discountText(o: OfferInfo) {
  if (o.discountType === "PERCENTAGE" && o.percentage) return `${o.percentage}% off`;
  if (o.discountType === "FLAT" && o.flatAmountMinor) return `₹${(o.flatAmountMinor/100).toFixed(0)} off`;
  return "Special offer";
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  const steps = ["Your Deal", "Choose Seats", "Passenger Details"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
              i < step  ? "bg-primary text-white" :
              i === step ? "bg-primary text-white ring-4 ring-primary/20 scale-110" :
                          "bg-muted text-muted-foreground"
            )}>
              {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn("text-[10px] font-semibold whitespace-nowrap", i === step ? "text-primary" : "text-muted-foreground")}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn("h-0.5 flex-1 mx-2 mt-[-12px] rounded", i < step ? "bg-primary" : "bg-border")} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Your Deal ─────────────────────────────────────────────────────────
function StepDeal({
  trip, offers, progress, onNext,
}: {
  trip: TripInfo;
  offers: OfferInfo[];
  progress: RewardProgress | null;
  onNext: () => void;
}) {
  const dep = new Date(trip.departureAt);
  const arr = new Date(trip.arrivalAt);
  const durMins = Math.round((arr.getTime() - dep.getTime()) / 60000);
  const depStr = dep.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  const arrStr = arr.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

  const userLevel = progress?.currentLevel ?? "LEVEL_1";
  const completedTrips = progress?.completedTrips ?? 0;
  const activeOffer = offers.find((o) => o.level === userLevel) ?? offers[0];

  return (
    <div className="space-y-6">
      {/* Trip summary pill */}
      <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Bus className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">{trip.route.origin} → {trip.route.destination}</p>
          <p className="text-xs text-muted-foreground">{trip.operator.name} · {depStr} – {arrStr} · {Math.floor(durMins/60)}h {durMins%60}m</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-extrabold text-lg">₹{(trip.basePriceMinor/100).toFixed(0)}</p>
          <p className="text-[10px] text-muted-foreground">per seat</p>
        </div>
      </div>

      {/* Big flashy deal hero */}
      {activeOffer && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-action p-6 text-white">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-6 -translate-x-6" />
          <div className="relative">
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">🎁 Your Current Deal</p>
            <p className="font-black text-5xl leading-none mb-2">
              {activeOffer.discountType === "PERCENTAGE"
                ? `${activeOffer.percentage}% OFF`
                : `₹${((activeOffer.flatAmountMinor ?? 0)/100).toFixed(0)} OFF`}
            </p>
            <p className="text-white/80 text-sm font-semibold">{activeOffer.title}</p>
            {activeOffer.description && (
              <p className="text-white/60 text-xs mt-1">{activeOffer.description}</p>
            )}
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              {activeOffer.maxCapMinor && (
                <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  Max saving ₹{(activeOffer.maxCapMinor/100).toFixed(0)}
                </span>
              )}
              {activeOffer.groupBonusPerHead > 0 && (
                <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  👥 +{activeOffer.groupBonusPerHead}% per guest (up to {activeOffer.groupBonusMaxHeads})
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Your level + progress */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
          <p className="text-sm font-bold">Your Loyalty Journey</p>
          <span className="text-xs text-muted-foreground">{completedTrips} trip{completedTrips !== 1 ? "s" : ""} completed with this operator</span>
        </div>
        <div className="divide-y divide-border/50">
          {offers.map((offer, i) => {
            const meta = LEVEL_META[offer.level] ?? LEVEL_META["LEVEL_1"]!;
            const isActive = offer.level === userLevel;
            const isUnlocked = LEVEL_ORDER.indexOf(offer.level) <= LEVEL_ORDER.indexOf(userLevel);
            const isNext = LEVEL_ORDER.indexOf(offer.level) === LEVEL_ORDER.indexOf(userLevel) + 1;
            const tripsNeeded = offer.unlockTripNumber - completedTrips;

            return (
              <div key={offer.level} className={cn("flex items-start gap-3 px-4 py-3.5 transition-colors", isActive && "bg-primary/5")}>
                <div className={cn(
                  "shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ring-2 mt-0.5",
                  meta.bg, isActive ? meta.ring : "ring-border/50",
                  !isUnlocked && "opacity-50 grayscale"
                )}>
                  {meta.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-xs font-black uppercase tracking-wide", isActive ? meta.color : "text-muted-foreground")}>
                      {meta.label}
                    </span>
                    {isActive && <span className="text-[9px] font-black bg-primary text-white px-1.5 py-0.5 rounded-full">YOU ARE HERE</span>}
                    {isNext && tripsNeeded > 0 && (
                      <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-full">
                        {tripsNeeded} trip{tripsNeeded !== 1 ? "s" : ""} away!
                      </span>
                    )}
                  </div>
                  <p className={cn("text-sm font-bold mt-0.5", isUnlocked ? meta.color : "text-muted-foreground")}>
                    {discountText(offer)}
                  </p>
                  {offer.description && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{offer.description}</p>
                  )}
                  {offer.groupBonusPerHead > 0 && isUnlocked && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                      👥 +{offer.groupBonusPerHead}% per extra traveller
                    </p>
                  )}
                </div>
                <div className="shrink-0 mt-1">
                  {isUnlocked
                    ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                    : <Lock className={cn("h-4 w-4", isNext ? "text-amber-400" : "text-muted-foreground/40")} />
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Button onClick={onNext} size="lg" variant="action" className="w-full font-black text-base gap-2">
        Select Seats <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

// ── Step 2: Seat Map ──────────────────────────────────────────────────────────
function StepSeats({
  trip, selectedSeats, onToggle, onNext, onBack,
}: {
  trip: TripInfo;
  selectedSeats: string[];
  onToggle: (label: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const isSleeper = trip.seatType === "SLEEPER";
  const lower = trip.seats.filter((s) => s.deck === "LOWER");
  const upper = trip.seats.filter((s) => s.deck === "UPPER");
  const available = trip.seats.filter((s) => !s.isBooked).length;

  function SeatButton({ seat }: { seat: SeatInfo }) {
    const sel = selectedSeats.includes(seat.label);
    return (
      <button
        disabled={seat.isBooked}
        onClick={() => !seat.isBooked && onToggle(seat.label)}
        title={seat.label}
        className={cn(
          "rounded-lg border text-[11px] font-bold py-2 px-1 transition-all",
          seat.isBooked
            ? "bg-muted/60 text-muted-foreground/40 border-muted cursor-not-allowed"
            : sel
            ? "bg-primary text-white border-primary shadow-md scale-105"
            : "bg-background border-border hover:border-primary hover:bg-primary/5 hover:scale-105"
        )}
      >
        {seat.label}
        {seat.isLadies && !seat.isBooked && <span className="block text-[8px] text-pink-500">♀</span>}
      </button>
    );
  }

  return (
    <div className="space-y-5">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border border-border bg-background" />Available ({available})</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-primary" />Selected ({selectedSeats.length})</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-muted/60" />Booked</span>
        <span className="flex items-center gap-1.5"><span className="text-pink-500 text-sm">♀</span>Ladies</span>
      </div>

      {/* Deck layout */}
      {isSleeper ? (
        <div className="space-y-4">
          {[{ label: "Lower Deck", seats: lower }, { label: "Upper Deck", seats: upper }].map(({ label, seats }) => (
            <div key={label} className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2 bg-muted/30 border-b border-border">
                <p className="text-xs font-bold text-muted-foreground">{label}</p>
              </div>
              <div className="p-3 grid grid-cols-6 sm:grid-cols-8 gap-2">
                {seats.map((s) => <SeatButton key={s.id} seat={s} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-2 bg-muted/30 border-b border-border">
            <p className="text-xs font-bold text-muted-foreground">Seater Layout</p>
          </div>
          <div className="p-3 grid grid-cols-5 sm:grid-cols-8 gap-2">
            {trip.seats.map((s) => <SeatButton key={s.id} seat={s} />)}
          </div>
        </div>
      )}

      {/* Selected count */}
      {selectedSeats.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-bold text-sm text-primary">{selectedSeats.length} seat{selectedSeats.length !== 1 ? "s" : ""} selected</p>
            <p className="text-xs text-muted-foreground">{selectedSeats.join(", ")}</p>
          </div>
          <p className="font-extrabold text-lg">₹{(trip.basePriceMinor * selectedSeats.length / 100).toFixed(0)}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">← Back</Button>
        <Button
          onClick={onNext}
          variant="action"
          disabled={selectedSeats.length === 0}
          className="flex-[2] font-black gap-2"
        >
          Continue <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Step 3: Passenger Details + Fare Summary ──────────────────────────────────
function StepPassengers({
  trip, selectedSeats, passengers, offers, progress,
  onChange, onSubmit, onBack, submitting,
}: {
  trip: TripInfo;
  selectedSeats: string[];
  passengers: Passenger[];
  offers: OfferInfo[];
  progress: RewardProgress | null;
  onChange: (idx: number, field: keyof Passenger, value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}) {
  const userLevel = progress?.currentLevel ?? "LEVEL_1";
  const activeOffer = offers.find((o) => o.level === userLevel) ?? offers[0];
  const baseTotalMinor = trip.basePriceMinor * selectedSeats.length;

  let discountMinor = 0;
  if (activeOffer) {
    if (activeOffer.discountType === "PERCENTAGE" && activeOffer.percentage) {
      discountMinor = Math.round(baseTotalMinor * (activeOffer.percentage / 100));
      if (activeOffer.maxCapMinor) discountMinor = Math.min(discountMinor, activeOffer.maxCapMinor);
    } else if (activeOffer.discountType === "FLAT" && activeOffer.flatAmountMinor) {
      discountMinor = activeOffer.flatAmountMinor;
    }
  }

  const guestCount = Math.max(0, selectedSeats.length - 1);
  let groupBonusMinor = 0;
  if (activeOffer && activeOffer.groupBonusPerHead > 0 && guestCount > 0) {
    const heads = Math.min(guestCount, activeOffer.groupBonusMaxHeads);
    groupBonusMinor = Math.round(baseTotalMinor * (activeOffer.groupBonusPerHead / 100) * heads);
  }

  const totalDiscountMinor = discountMinor + groupBonusMinor;
  const estimatedTotal = Math.max(0, baseTotalMinor - totalDiscountMinor);

  return (
    <div className="space-y-6">
      {/* Passenger forms */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-bold">Passenger Details</p>
        </div>
        <div className="divide-y divide-border">
          {passengers.map((p, i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center shrink-0">{i+1}</span>
                <p className="text-sm font-semibold">Seat {p.seatLabel}</p>
                {i === 0 && <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full">Primary Traveller</span>}
                {i > 0 && <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded-full">👥 Guest</span>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Full name (as on ID)</Label>
                  <Input value={p.name} onChange={(e) => onChange(i, "name", e.target.value)} placeholder="Full name" className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Age</Label>
                  <Input value={p.age} onChange={(e) => onChange(i, "age", e.target.value)} placeholder="Age" type="number" min="1" max="120" className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Gender</Label>
                  <Select value={p.gender} onValueChange={(v) => onChange(i, "gender", v)}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fare breakdown */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 bg-muted/30 border-b border-border">
          <p className="text-sm font-bold">Fare Summary</p>
        </div>
        <div className="px-4 py-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{selectedSeats.length} seat{selectedSeats.length !== 1?"s":""} × ₹{(trip.basePriceMinor/100).toFixed(0)}</span>
            <span>₹{(baseTotalMinor/100).toFixed(0)}</span>
          </div>
          {discountMinor > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>🎁 {activeOffer?.title} ({discountText(activeOffer!)})</span>
              <span>− ₹{(discountMinor/100).toFixed(0)}</span>
            </div>
          )}
          {groupBonusMinor > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>👥 Group bonus ({guestCount} guest{guestCount>1?"s":""} × {activeOffer?.groupBonusPerHead}%)</span>
              <span>− ₹{(groupBonusMinor/100).toFixed(0)}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 flex justify-between font-black text-base">
            <span>Estimated Total</span>
            <span className="text-primary">₹{(estimatedTotal/100).toFixed(0)}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">* Final discount applied at payment. Taxes may apply.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">← Back</Button>
        <Button
          onClick={onSubmit}
          variant="action"
          disabled={submitting}
          className="flex-[2] font-black gap-2"
          size="lg"
        >
          {submitting ? "Creating booking…" : `Confirm & Pay ₹${(estimatedTotal/100).toFixed(0)}`}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BookTripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [trip, setTrip] = useState<TripInfo | null>(null);
  const [offers, setOffers] = useState<OfferInfo[]>([]);
  const [progress, setProgress] = useState<RewardProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/trips/${tripId}`).then((r) => r.json()),
    ]).then(([tripJson]) => {
      const t = tripJson.data?.trip ?? null;
      setTrip(t);
      if (t?.operator?.id) {
        Promise.all([
          fetch(`/api/operators/${t.operator.id}/offer-templates`).then((r) => r.ok ? r.json() : null),
          fetch(`/api/rewards/progress?operatorId=${t.operator.id}`).then((r) => r.ok ? r.json() : null),
        ]).then(([offersJson, progressJson]) => {
          if (offersJson?.data?.templates) setOffers(offersJson.data.templates);
          if (progressJson?.data?.progress) setProgress(progressJson.data.progress);
        }).catch(() => {});
      }
      setLoading(false);
    });
  }, [tripId]);

  function toggleSeat(label: string) {
    setSelectedSeats((prev) => {
      if (prev.includes(label)) {
        const next = prev.filter((s) => s !== label);
        setPassengers((ps) => ps.slice(0, next.length));
        return next;
      }
      const next = [...prev, label];
      setPassengers((ps) => [...ps, { name: "", age: "", gender: "", seatLabel: label }]);
      return next;
    });
  }

  function updatePassenger(idx: number, field: keyof Passenger, value: string) {
    setPassengers((ps) => ps.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  }

  async function handleSubmit() {
    const valid = passengers.every((p) => p.name && p.age && p.gender);
    if (!valid) { toast.error("Fill in all passenger details"); return; }
    if (!trip) return;
    const seatIds = selectedSeats
      .map((label) => trip.seats.find((s) => s.label === label)?.id)
      .filter(Boolean) as string[];
    if (seatIds.length !== selectedSeats.length) {
      toast.error("Seat selection error, please try again");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripId,
        seatIds,
        passengers: passengers.map((p) => ({ name: p.name, age: parseInt(p.age), gender: p.gender, seatLabel: p.seatLabel })),
      }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (res.ok) {
      toast.success("Booking created! Proceeding to payment…");
      router.push(`/bookings/${json.data.booking.id}`);
    } else {
      toast.error(json.error?.message ?? "Booking failed");
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }
  if (!trip) return <div className="p-6 text-muted-foreground">Trip not found.</div>;

  const stepLabels = ["Your Deal", "Choose Seats", "Passenger Details"];

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-black">{stepLabels[step]}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {trip.route.origin} → {trip.route.destination} · {new Date(trip.departureAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>

      <StepBar step={step} />

      {step === 0 && (
        <StepDeal
          trip={trip}
          offers={offers}
          progress={progress}
          onNext={() => setStep(1)}
        />
      )}
      {step === 1 && (
        <StepSeats
          trip={trip}
          selectedSeats={selectedSeats}
          onToggle={toggleSeat}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}
      {step === 2 && (
        <StepPassengers
          trip={trip}
          selectedSeats={selectedSeats}
          passengers={passengers}
          offers={offers}
          progress={progress}
          onChange={updatePassenger}
          onSubmit={handleSubmit}
          onBack={() => setStep(1)}
          submitting={submitting}
        />
      )}
    </div>
  );
}
