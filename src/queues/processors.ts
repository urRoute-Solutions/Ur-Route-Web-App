import { Worker } from "bullmq";
import { getEnv } from "@/config/env";
import { notificationService } from "@/services/notification.service";
import { completeBookingRewardsUseCase } from "@/usecases/rewards/complete-booking.usecase";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const connection = { url: getEnv().REDIS_URL };

export function startNotificationWorker() {
  return new Worker(
    "notifications",
    async (job) => {
      const { type, userId, email, data } = job.data as {
        type: string;
        userId: string;
        email: string;
        data: Record<string, unknown>;
      };

      if (type === "BOOKING_CONFIRMED") {
        await notificationService.sendBookingConfirmation(userId, email, data as Parameters<typeof notificationService.sendBookingConfirmation>[2]);
      } else if (type === "REWARD_UNLOCKED") {
        await notificationService.sendRewardUnlocked(userId, email, data.rewardTitle as string);
      }
    },
    { connection },
  );
}

export function startRewardWorker() {
  return new Worker(
    "rewards",
    async (job) => {
      const { bookingId, userId, operatorId } = job.data as {
        bookingId: string;
        userId: string;
        operatorId: string;
      };
      await completeBookingRewardsUseCase(bookingId, userId, operatorId);
    },
    { connection },
  );
}

export function startTripManifestWorker() {
  return new Worker(
    "trip-manifest",
    async (job) => {
      const { tripId, operatorEmail, appUrl } = job.data as {
        tripId: string;
        operatorEmail: string;
        appUrl: string;
      };

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          route: true,
          bookings: {
            where: { status: { in: ["PENDING", "CONFIRMED"] } },
            select: { pnr: true, passengers: true },
          },
        },
      });
      if (!trip) return;

      const passengers = trip.bookings.flatMap((b) => {
        const ps = b.passengers as Array<{ name: string; age: number; gender: string; seatLabel: string; phone?: string }>;
        return ps.map((p) => ({
          pnr: b.pnr,
          seatLabel: p.seatLabel,
          name: p.name,
          age: p.age,
          gender: p.gender,
          phone: p.phone ?? "-",
        }));
      });

      await notificationService.sendTripManifest(
        operatorEmail,
        {
          busName: trip.busName,
          origin: trip.route.origin,
          destination: trip.route.destination,
          departureAt: trip.departureAt.toISOString(),
          manifestUrl: `${appUrl}/operator/trips/${tripId}/manifest`,
        },
        passengers,
      );

      logger.info("Trip manifest email sent", { tripId, operatorEmail, passengerCount: passengers.length });
    },
    { connection },
  );
}

process.on("uncaughtException", (err) => logger.error("Worker uncaught exception", { err }));
process.on("unhandledRejection", (err) => logger.error("Worker unhandled rejection", { err }));
