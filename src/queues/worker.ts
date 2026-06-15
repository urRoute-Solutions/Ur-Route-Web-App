/**
 * Long-lived worker process — run on Render (not Vercel).
 * Start with: pnpm worker
 */
import { startNotificationWorker, startRewardWorker, startTripManifestWorker } from "./processors";
import { logger } from "@/lib/logger";

const notificationWorker = startNotificationWorker();
const rewardWorker = startRewardWorker();
const tripManifestWorker = startTripManifestWorker();

logger.info("Workers started", { queues: ["notifications", "rewards", "trip-manifest"] });

async function shutdown() {
  logger.info("Shutting down workers…");
  await Promise.all([notificationWorker.close(), rewardWorker.close(), tripManifestWorker.close()]);
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
