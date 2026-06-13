import { Redis } from "@upstash/redis";
import { getEnv } from "@/config/env";

/**
 * Upstash Redis (REST) client — used for caching and rate limiting from both
 * edge and Node runtimes. Returns null when Upstash isn't configured (local
 * dev), letting callers degrade gracefully instead of crashing.
 */
let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client !== undefined) return client;
  const env = getEnv();
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    client = null;
    return client;
  }
  client = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  return client;
}
