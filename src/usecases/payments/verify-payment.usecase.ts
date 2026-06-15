import { AppError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { paymentService } from "@/services/payment.service";
import { completeBookingRewardsUseCase } from "@/usecases/rewards/complete-booking.usecase";

const REFERRAL_CREDIT_MINOR = 5000; // ₹50 per successful referral

interface VerifyInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export async function verifyPaymentUseCase(input: VerifyInput) {
  const isValid = paymentService.verifySignature(
    input.razorpayOrderId,
    input.razorpayPaymentId,
    input.razorpaySignature,
  );

  if (!isValid) throw new AppError("Invalid payment signature", 400, "INVALID_SIGNATURE");

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: input.razorpayOrderId },
    include: { booking: true },
  });
  if (!payment) throw new NotFoundError("Payment");

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId: input.razorpayPaymentId,
        razorpaySignature: input.razorpaySignature,
        status: "PAID",
        paidAt: new Date(),
      },
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CONFIRMED" },
    });

    // Referral credit: credit ₹50 to referrer on the referee's FIRST confirmed booking.
    const booker = await tx.user.findUnique({
      where: { id: payment.userId },
      select: { referredById: true },
    });
    if (booker?.referredById) {
      const previousConfirmed = await tx.booking.count({
        where: {
          userId: payment.userId,
          status: "CONFIRMED",
          id: { not: payment.bookingId },
        },
      });
      if (previousConfirmed === 0) {
        await tx.user.update({
          where: { id: booker.referredById },
          data: { walletBalanceMinor: { increment: REFERRAL_CREDIT_MINOR } },
        });
        await tx.notification.create({
          data: {
            user: { connect: { id: booker.referredById } },
            channel: "IN_APP",
            type: "REFERRAL_CREDIT",
            title: "Referral bonus earned!",
            body: "Your friend just completed their first booking. ₹50 has been added to your wallet.",
            data: {},
            status: "SENT",
            sentAt: new Date(),
          },
        });
      }
    }
  }, { timeout: 15000 });

  return { bookingId: payment.bookingId, pnr: payment.booking.pnr };
}
