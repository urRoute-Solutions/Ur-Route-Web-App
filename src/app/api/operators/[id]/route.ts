import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { updateOperatorSchema } from "@/validators/operator";
import { getOperatorUseCase } from "@/usecases/operator/get-operator.usecase";
import { updateOperatorUseCase } from "@/usecases/operator/update-operator.usecase";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const operator = await getOperatorUseCase(id);
    return ok({ operator });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const principal = await requireAuth();
    const { id } = await params;
    const input = updateOperatorSchema.parse(await req.json());
    const operator = await updateOperatorUseCase(id, input, principal);
    return ok({ operator });
  } catch (error) {
    return handleError(error);
  }
}
