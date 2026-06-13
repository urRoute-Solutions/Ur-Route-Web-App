import { tripRepository } from "@/repositories/trip.repository";
import { toTripDTO, type TripDTO } from "@/dto/trip.dto";
import type { SearchTripsInput } from "@/validators/trip";

export async function searchTripsUseCase(
  input: SearchTripsInput,
): Promise<{ items: TripDTO[]; total: number; page: number; pageSize: number }> {
  const [trips, total] = await tripRepository.search({
    origin: input.origin,
    destination: input.destination,
    date: input.date,
    minSeats: input.passengers,
    page: input.page,
    pageSize: input.pageSize,
  });

  return {
    items: trips.map(toTripDTO),
    total,
    page: input.page,
    pageSize: input.pageSize,
  };
}
