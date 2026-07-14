import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAgent } from "@/lib/auth/session";
import { NotFoundError } from "@/lib/errors";
import { userRepository } from "@/repositories/user.repository";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAgent();
    const { id } = await params;
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError("User");

    const bookings = await prisma.booking.findMany({
      where: { userId: id },
      include: { trip: { include: { route: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return ok({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        urid: user.urid,
        role: user.role,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        walletBalanceMinor: user.walletBalanceMinor,
        referralCode: user.referralCode,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      },
      bookings: bookings.map((b) => ({
        id: b.id,
        pnr: b.pnr,
        status: b.status,
        totalFareMinor: b.totalFareMinor,
        passengerCount: b.passengerCount,
        createdAt: b.createdAt.toISOString(),
        origin: b.trip?.route?.origin ?? null,
        destination: b.trip?.route?.destination ?? null,
        departureAt: b.trip?.departureAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}
