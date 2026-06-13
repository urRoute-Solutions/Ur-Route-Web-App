import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireRole } from "@/lib/auth/session";
import { getRewardProgressUseCase } from "@/usecases/rewards/get-progress.usecase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const principal = await requireRole("TRAVELER");
    const operatorId = req.nextUrl.searchParams.get("operatorId") ?? undefined;
    const progress = await getRewardProgressUseCase(principal.userId, operatorId);
    return ok({ progress });
  } catch (error) {
    return handleError(error);
  }
}
