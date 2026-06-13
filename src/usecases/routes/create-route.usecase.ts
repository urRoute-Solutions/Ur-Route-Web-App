import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { routeRepository } from "@/repositories/route.repository";
import { toRouteDTO, type RouteDTO } from "@/dto/route.dto";
import { auditService } from "@/services/audit.service";
import type { CreateRouteInput } from "@/validators/route";
import type { AuthPrincipal } from "@/types/auth";

export async function createRouteUseCase(
  operatorId: string,
  input: CreateRouteInput,
  principal: AuthPrincipal,
): Promise<RouteDTO> {
  const operator = await operatorRepository.findById(operatorId);
  if (!operator) throw new NotFoundError("Operator");

  if (principal.role === "OPERATOR" && operator.ownerId !== principal.userId) {
    throw new ForbiddenError();
  }

  if (operator.status !== "ACTIVE") {
    throw new ForbiddenError("Operator account must be active to create routes");
  }

  const route = await routeRepository.create({
    operator: { connect: { id: operatorId } },
    origin: input.origin,
    destination: input.destination,
    distanceKm: input.distanceKm,
    durationMin: input.durationMin,
    boardingPoints: input.boardingPoints,
    droppingPoints: input.droppingPoints,
  });

  auditService.record({
    action: "ROUTE_CREATED",
    actorId: principal.userId,
    operatorId,
    entity: "Route",
    entityId: route.id,
  });

  return toRouteDTO(route);
}
