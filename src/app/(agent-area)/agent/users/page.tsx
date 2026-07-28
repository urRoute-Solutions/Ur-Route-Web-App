import { requireAgent } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import {
  Search, User, Mail, Phone, CheckCircle, XCircle,
  Hash, ChevronRight, Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

async function searchUsers(q: string) {
  if (!q.trim()) return [];
  const term = q.trim();
  return prisma.user.findMany({
    where: {
      deletedAt: null,
      role: "TRAVELER",
      OR: [
        { fullName: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
        { phone: { contains: term } },
        { urid: { equals: term.toUpperCase() } },
        { referralCode: { equals: term.toUpperCase() } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 40,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      urid: true,
      isActive: true,
      emailVerified: true,
      walletBalanceMinor: true,
      createdAt: true,
      _count: { select: { bookings: true } },
    },
  });
}

export default async function AgentUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAgent();
  const { q = "" } = await searchParams;
  const users = await searchUsers(q);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <BackButton fallback="/agent/dashboard" variant="default" />
        <div>
          <h1 className="text-xl font-black text-white">User Search</h1>
          <p className="text-xs text-slate-400 mt-0.5">Search by name, email, phone, or URID</p>
        </div>
      </div>

      <form method="GET" className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Name, email, phone, or URID…"
            autoFocus
            className={cn(
              "w-full h-10 pl-9 pr-4 rounded-lg text-sm bg-slate-900 border border-slate-700",
              "text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent"
            )}
          />
        </div>
        <button
          type="submit"
          className="h-10 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
        >
          Search
        </button>
      </form>

      {q && users.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-800 py-14 text-center">
          <User className="mx-auto h-8 w-8 text-slate-600 mb-3" />
          <p className="text-slate-300 font-semibold">No users found</p>
          <p className="text-slate-500 text-sm mt-1">Try a different name, email, or phone number.</p>
        </div>
      )}

      {!q && (
        <div className="rounded-xl border border-dashed border-slate-800 py-14 text-center">
          <Search className="mx-auto h-8 w-8 text-slate-600 mb-3" />
          <p className="text-slate-300 font-semibold">Enter a search term above</p>
          <p className="text-slate-500 text-sm mt-1">You can search by name, email, phone number, or URID.</p>
        </div>
      )}

      {users.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 font-medium">
            {users.length} result{users.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
          </p>
          <div className="rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
            {users.map((u) => (
              <Link
                key={u.id}
                href={`/agent/users/${u.id}`}
                className="flex items-center gap-4 px-4 py-3.5 bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 text-blue-400 font-extrabold text-sm">
                  {u.fullName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-white">{u.fullName}</span>
                    {u.isActive ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-400">
                        <CheckCircle className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-400">
                        <XCircle className="h-3 w-3" /> Inactive
                      </span>
                    )}
                    {!u.emailVerified && (
                      <span className="text-[10px] font-bold text-amber-400">Unverified</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Mail className="h-3 w-3" /> {u.email}
                    </span>
                    {u.phone && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Phone className="h-3 w-3" /> {u.phone}
                      </span>
                    )}
                    {u.urid && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                        <Hash className="h-3 w-3" /> {u.urid}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right hidden sm:block">
                  <p className="text-xs text-slate-300 font-semibold">
                    {u._count.bookings} booking{u._count.bookings !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                    <Wallet className="h-3 w-3" />
                    ₹{(u.walletBalanceMinor / 100).toFixed(0)}
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
