import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { tripRepository } from "@/repositories/trip.repository";
import { toTripDTO, type TripDTO } from "@/dto/trip.dto";
import { auditService } from "@/services/audit.service";
import { rewardQueue } from "@/queues";
import { notificationService } from "@/services/notification.service";
import { prisma } from "@/lib/prisma";
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

  if (input.status === "COMPLETED") {
    const completedAt = new Date();

    const completedBookings = await prisma.$transaction(
      async (tx) => {
        await tx.trip.update({ where: { id: tripId }, data });

        const bookings = await tx.booking.findMany({
          where: { tripId, status: { in: ["PENDING", "CONFIRMED"] } },
          select: { id: true, userId: true },
        });

        await tx.booking.updateMany({
          where: { id: { in: bookings.map((b) => b.id) } },
          data: { status: "COMPLETED", completedAt },
        });

        return bookings;
      },
      { timeout: 15000 },
    );

    await Promise.all(
      completedBookings.map((b) =>
        Promise.all([
          rewardQueue.add("complete", { bookingId: b.id, userId: b.userId, operatorId }, { attempts: 3 }),
          notificationService.sendInApp(
            b.userId,
            "TRIP_COMPLETED",
            "How was your trip?",
            "Rate your journey and help other travellers.",
            { bookingId: b.id },
          ),
        ]),
      ),
    );

    const updated = await tripRepository.findByIdForOperator(tripId, operatorId);

    auditService.record({
      action: "TRIP_UPDATED",
      actorId: principal.userId,
      operatorId,
      entity: "Trip",
      entityId: tripId,
    });

    return toTripDTO(updated!);
  }

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
