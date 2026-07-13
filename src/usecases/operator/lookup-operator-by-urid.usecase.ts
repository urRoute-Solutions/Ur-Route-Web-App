import { NotFoundError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { routeRepository } from "@/repositories/route.repository";
import { tripRepository } from "@/repositories/trip.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { toOperatorDTO, type OperatorDTO } from "@/dto/operator.dto";

export interface OperatorLookupResult {
  operator: OperatorDTO;
  stats: { routes: number; trips: number; bookings: number };
  recentRoutes: { id: string; origin: string; destination: string; isActive: boolean }[];
  recentBookings: { id: string; pnr: string; status: string; totalFareMinor: number; createdAt: string }[];
}

/**
 * Read-only snapshot for support/incident staff who only have a URID to go
 * on — deliberately not the operator's own dashboard data shape, so there's
 * no risk of exposing operator-only actions to an agent.
 */
export async function lookupOperatorByUridUseCase(urid: string): Promise<OperatorLookupResult> {
  const operator = await operatorRepository.findByUrid(urid.toUpperCase());
  if (!operator) throw new NotFoundError("Operator");

  const [[routes, totalRoutes], [, totalTrips], [bookings, totalBookings]] = await Promise.all([
    routeRepository.listByOperator(operator.id, { page: 1, pageSize: 5 }),
    tripRepository.listByOperator(operator.id, { page: 1, pageSize: 1 }),
    bookingRepository.listByOperator(operator.id, { page: 1, pageSize: 5 }),
  ]);

  return {
    operator: toOperatorDTO(operator),
    stats: { routes: totalRoutes, trips: totalTrips, bookings: totalBookings },
    recentRoutes: routes.map((r) => ({ id: r.id, origin: r.origin, destination: r.destination, isActive: r.isActive })),
    recentBookings: bookings.map((b) => ({
      id: b.id,
      pnr: b.pnr,
      status: b.status,
      totalFareMinor: b.totalFareMinor,
      createdAt: b.createdAt.toISOString(),
    })),
  };
}
