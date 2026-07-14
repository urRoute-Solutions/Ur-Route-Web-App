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

  // Dedicated secret for the cron-triggered routes (/api/cron/*) — kept
  // separate from the JWT secrets so rotating one never silently affects
  // the other, and so a leaked cron secret can't be used to forge sessions.
  CRON_SECRET: z.string().min(16).optional(),

  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Razorpay — empty string treated same as absent (uses placeholder in dev)
  RAZORPAY_KEY_ID: z.string().optional().transform((v) => v || "rzp_test_placeholder"),
  RAZORPAY_KEY_SECRET: z.string().optional().transform((v) => v || "placeholder"),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().transform((v) => v || "placeholder"),

  // Resend (email)
  RESEND_API_KEY: z.string().optional().transform((v) => v || "re_placeholder"),
  EMAIL_FROM: z.string().optional().transform((v) => v || "noreply@urroute.in"),

  // Redis (BullMQ — direct ioredis, not Upstash)
  REDIS_URL: z.string().optional().transform((v) => v || "redis://localhost:6379"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Firebase Admin (FCM)
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  // Twilio (SMS)
  TWILIO_ACCOUNT_SID: z.string().optional().transform((v) => v || ""),
  TWILIO_AUTH_TOKEN: z.string().optional().transform((v) => v || ""),
  TWILIO_PHONE_NUMBER: z.string().optional().transform((v) => v || ""),

  // PostHog
  POSTHOG_API_KEY: z.string().optional(),

  // Anthropic (AI support chat)
  ANTHROPIC_API_KEY: z.string().optional(),

  // Google OAuth (Sign in with Google)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Client-exposed (NEXT_PUBLIC_*) — also readable server-side; validated
  // loosely here so getEnv() doesn't reject them when present in process.env.
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
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

/** Convenience alias for callers that prefer `env.FOO` syntax. */
export const env = new Proxy({} as z.infer<typeof serverSchema>, {
  get(_target, prop: string) {
    return getEnv()[prop as keyof z.infer<typeof serverSchema>];
  },
});
