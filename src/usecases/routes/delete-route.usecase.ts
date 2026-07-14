import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { routeRepository } from "@/repositories/route.repository";
import { auditService } from "@/services/audit.service";
import { prisma } from "@/lib/prisma";
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

  // Deleting a route must not leave its already-generated trips live and
  // bookable — cancel every future, not-yet-departed trip in the same
  // transaction as the soft-delete. Past/departed trips are left alone since
  // they may already carry real bookings/history.
  const cancelledTrips = await prisma.$transaction(async (tx) => {
    await tx.route.update({
      where: { id: routeId },
      data: { deletedAt: new Date(), isActive: false },
    });

    const result = await tx.trip.updateMany({
      where: {
        routeId,
        departureAt: { gt: new Date() },
        status: "SCHEDULED",
      },
      data: { status: "CANCELLED" },
    });
    return result.count;
  }, { timeout: 15000 });

  auditService.record({
    action: "ROUTE_DELETED",
    actorId: principal.userId,
    operatorId,
    entity: "Route",
    entityId: routeId,
    metadata: { cancelledTrips },
  });
}
