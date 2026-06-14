import { z } from "zod";
import { type NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { AppError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const createSchema = z.object({
  bookingId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const input = createSchema.parse(await req.json());

    const booking = await prisma.booking.findUnique({
      where: { id: input.bookingId },
      include: { review: true },
    });

    if (!booking) throw new NotFoundError("Booking");
    if (booking.userId !== userId) throw new ForbiddenError();
    if (booking.status !== "COMPLETED") {
      throw new AppError("Reviews can only be submitted for completed trips", 400, "NOT_COMPLETED");
    }
    if (booking.review) {
      throw new AppError("You have already reviewed this trip", 409, "ALREADY_REVIEWED");
    }

    const review = await prisma.review.create({
      data: {
        operatorId: booking.operatorId,
        userId,
        bookingId: booking.id,
        rating: input.rating,
        comment: input.comment,
      },
    });

    // Update operator aggregate rating
    const { _avg } = await prisma.review.aggregate({
      where: { operatorId: booking.operatorId },
      _avg: { rating: true },
    });
    await prisma.operator.update({
      where: { id: booking.operatorId },
      data: { rating: _avg.rating ?? 0 },
    });

    return ok({ review }, 201);
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const operatorId = searchParams.get("operatorId");
    if (!operatorId) throw new AppError("operatorId is required", 400, "BAD_REQUEST");

    const reviews = await prisma.review.findMany({
      where: { operatorId },
      include: { user: { select: { fullName: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return ok({ reviews });
  } catch (error) {
    return handleError(error);
  }
}
