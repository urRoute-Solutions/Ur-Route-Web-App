import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "@/lib/redis";
import { RateLimitError } from "@/lib/errors";

/**
 * Sliding-window rate limiting backed by Upstash.
 *
 * Limiters are lazily built and cached. When Redis isn't configured (local
 * dev) limiting is a no-op so the app still runs — production MUST set Upstash
 * env vars. Tune windows per endpoint sensitivity; auth is the strictest.
 */
type Bucket = "auth" | "api" | "payment";

const WINDOWS: Record<Bucket, { limit: number; window: `${number} ${"s" | "m"}` }> =
  {
    auth: { limit: 10, window: "1 m" }, // login/register attempts
    api: { limit: 100, window: "1 m" }, // general API
    payment: { limit: 20, window: "1 m" },
  };

const cache = new Map<Bucket, Ratelimit>();

function limiter(bucket: Bucket): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  let rl = cache.get(bucket);
  if (!rl) {
    const cfg = WINDOWS[bucket];
    rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(cfg.limit, cfg.window),
      prefix: `rl:${bucket}`,
      analytics: false,
    });
    cache.set(bucket, rl);
  }
  return rl;
}

/**
 * Enforce a rate limit for `identifier` (usually client IP, optionally + route).
 * Throws RateLimitError (429) when exhausted. No-op when Redis is absent.
 */
export async function enforceRateLimit(
  bucket: Bucket,
  identifier: string,
): Promise<void> {
  const rl = limiter(bucket);
  if (!rl) return;
  const { success } = await rl.limit(identifier);
  if (!success) throw new RateLimitError();
}
