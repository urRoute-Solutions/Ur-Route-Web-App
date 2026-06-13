import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { updateRouteSchema } from "@/validators/route";
import { updateRouteUseCase } from "@/usecases/routes/update-route.usecase";
import { deleteRouteUseCase } from "@/usecases/routes/delete-route.usecase";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; routeId: string }> },
) {
  try {
    const principal = await requireAuth();
    const { id, routeId } = await params;
    const input = updateRouteSchema.parse(await req.json());
    const route = await updateRouteUseCase(id, routeId, input, principal);
    return ok({ route });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; routeId: string }> },
) {
  try {
    const principal = await requireAuth();
    const { id, routeId } = await params;
    await deleteRouteUseCase(id, routeId, principal);
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
