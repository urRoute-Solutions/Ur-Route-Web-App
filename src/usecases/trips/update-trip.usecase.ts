import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { tripRepository } from "@/repositories/trip.repository";
import { toTripDTO, type TripDTO } from "@/dto/trip.dto";
import { auditService } from "@/services/audit.service";
import type { UpdateTripInput } from "@/validators/trip";
import type { AuthPrincipal } from "@/types/auth";

export async function updateTripUseCase(
  operatorId: string,
  tripId: string,
  input: UpdateTripInput,
  principal: AuthPrincipal,
): Promise<TripDTO> {
  const operator = await operatorRepository.findById(operatorId);
  if (!operator) throw new NotFoundError("Operator");

  if (principal.role === "OPERATOR" && operator.ownerId !== principal.userId) {
    throw new ForbiddenError();
  }

  const trip = await tripRepository.findByIdForOperator(tripId, operatorId);
  if (!trip) throw new NotFoundError("Trip");

  const data: Record<string, unknown> = { ...input };
  if (input.departureAt) data.departureAt = new Date(input.departureAt);
  if (input.arrivalAt) data.arrivalAt = new Date(input.arrivalAt);

  const updated = await tripRepository.update(tripId, data);

  auditService.record({
    action: "TRIP_UPDATED",
    actorId: principal.userId,
    operatorId,
    entity: "Trip",
    entityId: tripId,
  });

  return toTripDTO(updated);
}
