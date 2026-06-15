import { z } from "zod";
import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const tierSchema = z.object({
  hoursBeforeDeparture: z.number().int().min(0),
  refundPct: z.number().int().min(0).max(100),
});

const putSchema = z.object({
  tiers: z
    .array(tierSchema)
    .min(1)
    .max(10)
    .refine(
      (tiers) => tiers.some((t) => t.hoursBeforeDeparture === 0),
      "Must include a tier with hoursBeforeDeparture=0 (last resort refund)",
    ),
});

async function assertOwner(operatorId: string, userId: string) {
  const op = await prisma.operator.findUnique({ where: { id: operatorId }, select: { ownerId: true } });
  if (!op) throw new NotFoundError("Operator");
  if (op.ownerId !== userId) throw new ForbiddenError();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId, role } = await requireAuth();
    const { id: operatorId } = await params;
    if (role !== "ADMIN") await assertOwner(operatorId, userId);

    const policy = await prisma.cancellationPolicy.findUnique({ where: { operatorId } });

    // Return default tiers if no policy is set yet
    const defaultTiers = [
      { hoursBeforeDeparture: 24, refundPct: 100 },
      { hoursBeforeDeparture: 4, refundPct: 50 },
      { hoursBeforeDeparture: 0, refundPct: 0 },
    ];

    return ok({ tiers: policy ? policy.tiers : defaultTiers });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await requireAuth();
    const { id: operatorId } = await params;
    await assertOwner(operatorId, userId);

    const { tiers } = putSchema.parse(await req.json());

    // Sort descending by hours so the cancel logic can apply the first matching tier
    const sorted = [...tiers].sort((a, b) => b.hoursBeforeDeparture - a.hoursBeforeDeparture);

    const policy = await prisma.cancellationPolicy.upsert({
      where: { operatorId },
      create: { operatorId, tiers: sorted },
      update: { tiers: sorted },
    });

    return ok({ tiers: policy.tiers });
  } catch (error) {
    return handleError(error);
  }
}
