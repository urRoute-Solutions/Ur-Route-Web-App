import { z } from "zod";
import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/errors";
import { getOperatorAnalyticsUseCase } from "@/usecases/analytics/get-analytics.usecase";
import { operatorRepository } from "@/repositories/operator.repository";

export const runtime = "nodejs";

const schema = z.object({
  from: z.string().date(),
  to: z.string().date(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const principal = await requireAuth();
    const { id } = await params;

    if (principal.role === "OPERATOR") {
      const op = await operatorRepository.findById(id);
      if (!op || op.ownerId !== principal.userId) throw new ForbiddenError();
    } else if (principal.role !== "ADMIN") {
      throw new ForbiddenError();
    }

    const { searchParams } = req.nextUrl;
    const { from, to } = schema.parse({
      from: searchParams.get("from") ?? new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
      to: searchParams.get("to") ?? new Date().toISOString().split("T")[0],
    });

    const data = await getOperatorAnalyticsUseCase(id, { from, to });
    return ok({ analytics: data });
  } catch (error) {
    return handleError(error);
  }
}
