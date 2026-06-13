import { AppError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { paymentService } from "@/services/payment.service";
import { completeBookingRewardsUseCase } from "@/usecases/rewards/complete-booking.usecase";

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
  });

  return { bookingId: payment.bookingId, pnr: payment.booking.pnr };
}
