import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireOperator } from "@/lib/auth/session";
import { createRouteSchema } from "@/validators/route";
import { createRouteUseCase } from "@/usecases/routes/create-route.usecase";
import { listRoutesUseCase } from "@/usecases/routes/list-routes.usecase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const principal = await requireOperator();
    const { searchParams } = req.nextUrl;
    const result = await listRoutesUseCase(principal.operatorId, {
      isActive: searchParams.has("isActive") ? searchParams.get("isActive") === "true" : undefined,
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 100),
    });
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const principal = await requireOperator();
    const input = createRouteSchema.parse(await req.json());
    const route = await createRouteUseCase(principal.operatorId, input, principal);
    return ok({ route }, 201);
  } catch (error) {
    return handleError(error);
  }
}
