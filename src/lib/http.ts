import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/** Standard success envelope. */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/** Standard error envelope. */
function fail(
  message: string,
  status: number,
  code: string,
  details?: unknown,
) {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status },
  );
}

/**
 * Central error → HTTP mapper. Wrap every route handler body in try/catch and
 * funnel the error here so responses are consistent and internals never leak.
 */
export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return fail("Validation failed", 422, "VALIDATION_ERROR", error.flatten());
  }
  if (error instanceof AppError) {
    return fail(error.message, error.status, error.code, error.details);
  }
  if (error instanceof SyntaxError) {
    // Thrown by `await req.json()` on a malformed body — a client mistake,
    // not a server fault, so it shouldn't fall through to a 500.
    return fail("Malformed JSON in request body", 400, "BAD_REQUEST");
  }
  logger.error("Unhandled error in route handler", { error });
  return fail("Internal server error", 500, "INTERNAL_ERROR");
}
