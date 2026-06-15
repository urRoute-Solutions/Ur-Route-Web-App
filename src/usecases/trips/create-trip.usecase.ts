import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { routeRepository } from "@/repositories/route.repository";
import { tripRepository } from "@/repositories/trip.repository";
import { toTripDTO, type TripDTO } from "@/dto/trip.dto";
import { auditService } from "@/services/audit.service";
import { tripManifestQueue } from "@/queues";
import { getEnv } from "@/config/env";
import type { CreateTripInput } from "@/validators/trip";
import type { AuthPrincipal } from "@/types/auth";

export async function createTripUseCase(
  operatorId: string,
  input: CreateTripInput,
  principal: AuthPrincipal,
): Promise<TripDTO> {
  const operator = await operatorRepository.findById(operatorId);
  if (!operator) throw new NotFoundError("Operator");

  if (principal.role === "OPERATOR" && operator.ownerId !== principal.userId) {
    throw new ForbiddenError();
  }

  if (operator.status !== "ACTIVE") {
    throw new ForbiddenError("Operator account must be active to create trips");
  }

  const route = await routeRepository.findById(input.routeId, operatorId);
  if (!route) throw new NotFoundError("Route");

  const departure = new Date(input.departureAt);
  const arrival = new Date(input.arrivalAt);
  if (arrival <= departure) {
    throw new ValidationError({ arrivalAt: "Arrival must be after departure" });
  }

  const trip = await tripRepository.createWithSeats(
    {
      operator: { connect: { id: operatorId } },
      route: { connect: { id: input.routeId } },
      busName: input.busName,
      seatType: input.seatType,
      layout: input.layout,
      totalSeats: input.seats.length,
      availableSeats: input.seats.length,
      basePriceMinor: input.basePriceMinor,
      departureAt: departure,
      arrivalAt: arrival,
      amenities: input.amenities,
    },
    input.seats.map((s) => ({
      label: s.label,
      deck: s.deck,
      priceMinor: s.priceMinor,
      isLadies: s.isLadies,
    })),
  );

  auditService.record({
    action: "TRIP_CREATED",
    actorId: principal.userId,
    operatorId,
    entity: "Trip",
    entityId: trip.id,
  });

  // Schedule manifest email 1 hour before departure
  const msUntilManifest = departure.getTime() - Date.now() - 60 * 60 * 1000;
  if (msUntilManifest > 0) {
    await tripManifestQueue.add(
      "send-manifest",
      {
        tripId: trip.id,
        operatorEmail: operator.contactEmail,
        appUrl: getEnv().APP_URL,
      },
      { delay: msUntilManifest, attempts: 3, backoff: { type: "exponential", delay: 5000 } },
    ).catch(() => {}); // queue failure must not block trip creation
  }

  return toTripDTO(trip);
}
