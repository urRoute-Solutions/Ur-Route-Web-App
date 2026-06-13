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

process.on("uncaughtException", (err) => logger.error("Worker uncaught exception", { err }));
process.on("unhandledRejection", (err) => logger.error("Worker unhandled rejection", { err }));
