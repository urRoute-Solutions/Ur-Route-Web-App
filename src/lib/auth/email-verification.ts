import crypto from "crypto";
import { getRedis } from "@/lib/redis";
import { getEnv } from "@/config/env";
import { AppError } from "@/lib/errors";

const TOKEN_TTL = 24 * 60 * 60; // 24 hours

function redisKey(token: string) {
  return `verify:email:${token}`;
}

/** Generates a token, stores it in Redis, and returns the full verification URL. */
export async function createVerificationToken(userId: string): Promise<string> {
  const redis = getRedis();
  if (!redis) throw new AppError("Email verification is not configured", 503, "AUTH_PROVIDER_UNAVAILABLE");

  const token = crypto.randomBytes(32).toString("hex");
  await redis.set(redisKey(token), userId, { ex: TOKEN_TTL });

  const { APP_URL } = getEnv();
  return `${APP_URL}/api/auth/verify-email?token=${token}`;
}

/** Validates a token, returns the userId and deletes it (single-use). Returns null if invalid/expired. */
export async function consumeVerificationToken(token: string): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;

  const key = redisKey(token);
  const userId = await redis.get<string>(key);
  if (!userId) return null;

  await redis.del(key);
  return userId;
}
