import { requireAgent } from "@/lib/auth/session";
import { userRepository } from "@/repositories/user.repository";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User, Mail, Phone, Wallet, Calendar, Shield, CheckCircle,
  XCircle, Clock, Ticket, ArrowRight, ExternalLink, Hash,
} from "lucide-react";

const STATUS_VARIANT: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  CONFIRMED: "default",
  CANCELLED: "destructive",
  COMPLETED: "secondary",
  PENDING: "outline",
};

export default async function AgentUserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAgent();
  const { id } = await params;

  const user = await userRepository.findById(id);
  if (!user) notFound();

  const bookings = await prisma.booking.findMany({
    where: { userId: id },
    include: { trip: { include: { route: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const totalSpend = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((s, b) => s + b.totalFareMinor, 0);
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED").length;
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BackButton fallback="/agent/dashboard" variant="default" />
        <div className="flex-1">
          <h1 className="text-xl font-black">{user.fullName}</h1>
          <p className="text-xs text-muted-foreground font-mono">{user.urid ?? "No URID"}</p>
        </div>
        <div className="flex items-center gap-2">
          {user.isActive ? (
            <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" /> Active</Badge>
          ) : (
            <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Inactive</Badge>
          )}
          {user.emailVerified && (
            <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" /> Verified</Badge>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Bookings", value: bookings.length, icon: Ticket, color: "text-primary bg-primary/5" },
          { label: "Completed", value: confirmedCount, icon: CheckCircle, color: "text-green-600 bg-green-50 dark:bg-green-950/30" },
          { label: "Cancelled", value: cancelledCount, icon: XCircle, color: "text-red-500 bg-red-50 dark:bg-red-950/30" },
          { label: "Total Spend", value: `₹${(totalSpend / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, icon: Wallet, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-extrabold leading-none">{value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Details */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" /> Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Full Name</p>
                  <p className="font-medium">{user.fullName}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Email</p>
                  <p className="break-all">{user.email}</p>
                  {!user.emailVerified && (
                    <p className="text-[10px] text-amber-500 font-semibold mt-0.5">Not verified</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Phone</p>
                  <p className="font-mono">{user.phone ?? "—"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <Hash className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">URID</p>
                  <p className="font-mono text-xs">{user.urid ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Role</p>
                  <p>{user.role}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <Wallet className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Wallet Balance</p>
                  <p className="font-bold text-green-600">
                    ₹{(user.walletBalanceMinor / 100).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Member Since</p>
                  <p className="text-xs">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {user.lastLoginAt && (
                <div className="flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Last Login</p>
                    <p className="text-xs">
                      {new Date(user.lastLoginAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
              <Separator />
              <div className="flex items-start gap-2">
                <Hash className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Referral Code</p>
                  <p className="font-mono text-xs">{user.referralCode}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Agent view — read only
          </p>
        </div>

        {/* Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Ticket className="h-4 w-4" /> Bookings ({bookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {bookings.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">No bookings yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {bookings.map((b) => {
                    const route = b.trip?.route;
                    return (
                      <div key={b.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold">{b.pnr}</span>
                            <Badge variant={STATUS_VARIANT[b.status] ?? "outline"} className="text-[10px] h-4">
                              {b.status}
                            </Badge>
                          </div>
                          {route && (
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              {route.origin}
                              <ArrowRight className="h-2.5 w-2.5" />
                              {route.destination}
                              {b.trip?.departureAt && (
                                <span className="ml-1">
                                  · {new Date(b.trip.departureAt).toLocaleDateString("en-IN", {
                                    day: "numeric", month: "short", year: "numeric",
                                  })}
                                </span>
                              )}
                            </p>
                          )}
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {b.passengerCount} pax · ₹{(b.totalFareMinor / 100).toFixed(0)} ·{" "}
                            {new Date(b.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </p>
                        </div>
                        <Link
                          href={`/agent/bookings/${b.id}`}
                          className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                          title="View booking detail"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
