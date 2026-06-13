import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth/session";
import { listOperatorsUseCase } from "@/usecases/operator/list-operators.usecase";
import type { Operator } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;
    const result = await listOperatorsUseCase({
      status: (searchParams.get("status") as Operator["status"] | null) ?? undefined,
      city: searchParams.get("city") ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 50),
    });
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
