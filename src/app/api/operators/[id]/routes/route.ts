import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { createRouteSchema } from "@/validators/route";
import { createRouteUseCase } from "@/usecases/routes/create-route.usecase";
import { listRoutesUseCase } from "@/usecases/routes/list-routes.usecase";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const principal = await requireAuth();
    const { id } = await params;
    const input = createRouteSchema.parse(await req.json());
    const route = await createRouteUseCase(id, input, principal);
    return ok({ route }, 201);
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = req.nextUrl;
    const result = await listRoutesUseCase(id, {
      isActive: searchParams.has("isActive")
        ? searchParams.get("isActive") === "true"
        : undefined,
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
    });
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
