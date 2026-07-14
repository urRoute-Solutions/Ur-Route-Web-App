import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { aggregateDailyAnalytics } from "@/cron/aggregate-analytics";
import { getEnv } from "@/config/env";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-cron-secret");
    const configured = getEnv().CRON_SECRET;
    if (!configured || secret !== configured) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    await aggregateDailyAnalytics();
    return ok({ aggregated: true });
  } catch (error) {
    return handleError(error);
  }
}
