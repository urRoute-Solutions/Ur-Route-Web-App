import { z } from "zod";
import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth/session";
import { getPlatformAnalyticsUseCase } from "@/usecases/analytics/get-analytics.usecase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;
    const from = searchParams.get("from") ?? new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]!;
    const to = searchParams.get("to") ?? new Date().toISOString().split("T")[0]!;
    const data = await getPlatformAnalyticsUseCase({ from, to });
    return ok({ analytics: data });
  } catch (error) {
    return handleError(error);
  }
}
