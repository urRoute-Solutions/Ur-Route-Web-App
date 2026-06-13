import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { createOperatorSchema } from "@/validators/operator";
import { createOperatorUseCase } from "@/usecases/operator/create-operator.usecase";
import { listOperatorsUseCase } from "@/usecases/operator/list-operators.usecase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const principal = await requireRole("OPERATOR");
    const input = createOperatorSchema.parse(await req.json());
    const operator = await createOperatorUseCase(input, principal);
    return ok({ operator }, 201);
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const principal = await requireAuth();
    const { searchParams } = req.nextUrl;

    // Only admins can list all; operators and travelers see active ones only.
    const status =
      principal.role === "ADMIN"
        ? (searchParams.get("status") as "PENDING" | "ACTIVE" | "SUSPENDED" | null) ??
          undefined
        : "ACTIVE";

    const result = await listOperatorsUseCase({
      status,
      city: searchParams.get("city") ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
    });
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
