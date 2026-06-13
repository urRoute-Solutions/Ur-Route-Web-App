import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { routeRepository } from "@/repositories/route.repository";
import { auditService } from "@/services/audit.service";
import type { AuthPrincipal } from "@/types/auth";

export async function deleteRouteUseCase(
  operatorId: string,
  routeId: string,
  principal: AuthPrincipal,
): Promise<void> {
  const operator = await operatorRepository.findById(operatorId);
  if (!operator) throw new NotFoundError("Operator");

  if (principal.role === "OPERATOR" && operator.ownerId !== principal.userId) {
    throw new ForbiddenError();
  }

  const route = await routeRepository.findById(routeId, operatorId);
  if (!route) throw new NotFoundError("Route");

  await routeRepository.softDelete(routeId, operatorId);

  auditService.record({
    action: "ROUTE_DELETED",
    actorId: principal.userId,
    operatorId,
    entity: "Route",
    entityId: routeId,
  });
}
