import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { routeRepository } from "@/repositories/route.repository";
import { toRouteDTO, type RouteDTO } from "@/dto/route.dto";
import { auditService } from "@/services/audit.service";
import type { UpdateRouteInput } from "@/validators/route";
import type { AuthPrincipal } from "@/types/auth";

export async function updateRouteUseCase(
  operatorId: string,
  routeId: string,
  input: UpdateRouteInput,
  principal: AuthPrincipal,
): Promise<RouteDTO> {
  const operator = await operatorRepository.findById(operatorId);
  if (!operator) throw new NotFoundError("Operator");

  if (principal.role === "OPERATOR" && operator.ownerId !== principal.userId) {
    throw new ForbiddenError();
  }

  const route = await routeRepository.findById(routeId, operatorId);
  if (!route) throw new NotFoundError("Route");

  const updated = await routeRepository.update(routeId, operatorId, input);

  auditService.record({
    action: "ROUTE_UPDATED",
    actorId: principal.userId,
    operatorId,
    entity: "Route",
    entityId: routeId,
  });

  return toRouteDTO(updated);
}
