import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireRole } from "@/lib/auth/session";
import { getRewardHistoryUseCase } from "@/usecases/rewards/get-progress.usecase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const principal = await requireRole("TRAVELER");
    const { searchParams } = req.nextUrl;
    const result = await getRewardHistoryUseCase(principal.userId, {
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
    });
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
