import { Queue } from "bullmq";
import { getEnv } from "@/config/env";

const connection = { url: getEnv().REDIS_URL };

export const notificationQueue = new Queue("notifications", { connection });
export const rewardQueue = new Queue("rewards", { connection });
export const tripManifestQueue = new Queue("trip-manifest", { connection });
