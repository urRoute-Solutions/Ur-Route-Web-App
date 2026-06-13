import type { Booking } from "@prisma/client";
import { bookingRepository } from "@/repositories/booking.repository";
import { toBookingDTO, type BookingDTO } from "@/dto/booking.dto";
import type { AuthPrincipal } from "@/types/auth";

export async function listBookingsUseCase(
  principal: AuthPrincipal,
  params: { status?: Booking["status"]; page?: number; pageSize?: number },
): Promise<{ items: BookingDTO[]; total: number; page: number; pageSize: number }> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  let bookings: Booking[];
  let total: number;

  if (principal.role === "TRAVELER") {
    [bookings, total] = await bookingRepository.listByUser(principal.userId, {
      status: params.status,
      page,
      pageSize,
    });
  } else {
    // OPERATOR or ADMIN
    const operatorId = principal.operatorId ?? "";
    [bookings, total] = await bookingRepository.listByOperator(operatorId, {
      status: params.status,
      page,
      pageSize,
    });
  }

  return { items: bookings.map(toBookingDTO), total, page, pageSize };
}
