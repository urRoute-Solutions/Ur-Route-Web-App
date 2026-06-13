import { NotFoundError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { bookingRepository } from "@/repositories/booking.repository";
import { paymentService } from "@/services/payment.service";
import type { AuthPrincipal } from "@/types/auth";

export async function createPaymentOrderUseCase(
  bookingId: string,
  principal: AuthPrincipal,
) {
  const booking = await bookingRepository.findByIdForUser(bookingId, principal.userId);
  if (!booking) throw new NotFoundError("Booking");

  if (booking.status !== "PENDING") {
    throw new AppError("Booking is not in a payable state", 409, "BOOKING_NOT_PAYABLE");
  }

  // Idempotent: return existing order if already created.
  const existing = await prisma.payment.findUnique({ where: { bookingId } });
  if (existing?.razorpayOrderId) {
    return { orderId: existing.razorpayOrderId, amountMinor: existing.amountMinor };
  }

  const order = await paymentService.createOrder(booking.totalFareMinor, "INR", booking.pnr);

  await prisma.payment.upsert({
    where: { bookingId },
    create: {
      booking: { connect: { id: bookingId } },
      user: { connect: { id: principal.userId } },
      amountMinor: booking.totalFareMinor,
      razorpayOrderId: order.id,
      status: "CREATED",
    },
    update: { razorpayOrderId: order.id },
  });

  return { orderId: order.id, amountMinor: booking.totalFareMinor };
}
