import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { bookingRepository } from "@/repositories/booking.repository";
import { toBookingDTO, type BookingDTO } from "@/dto/booking.dto";
import type { AuthPrincipal } from "@/types/auth";

export async function getBookingUseCase(
  bookingId: string,
  principal: AuthPrincipal,
): Promise<BookingDTO> {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking");

  if (principal.role === "TRAVELER" && booking.userId !== principal.userId) {
    throw new ForbiddenError();
  }
  if (principal.role === "OPERATOR" && booking.operatorId !== principal.operatorId) {
    throw new ForbiddenError();
  }

  return toBookingDTO(booking);
}
