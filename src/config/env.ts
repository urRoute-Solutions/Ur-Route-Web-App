import { z } from "zod";

/**
 * Validated environment.
 *
 * We parse env ONCE here and import the typed `env` object everywhere else.
 * A missing/invalid var fails fast at boot with a clear message instead of
 * surfacing as a cryptic `undefined` deep in a request. Client-exposed vars
 * (NEXT_PUBLIC_*) are validated separately and may be absent server-side.
 */
const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),

  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TTL: z.coerce.number().int().positive().default(1_209_600),

  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

// During `next build` and on the edge, secrets may not be present; only hard-fail
// at actual runtime use. We lazily validate to keep build/edge happy.
let cached: z.infer<typeof serverSchema> | null = null;

export function getEnv(): z.infer<typeof serverSchema> {
  if (cached) return cached;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
