import { ok, handleError } from "@/lib/http";
import { requireOperator } from "@/lib/auth/session";
import { getOperatorUseCase } from "@/usecases/operator/get-operator.usecase";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { operatorId } = await requireOperator();
    const operator = await getOperatorUseCase(operatorId);
    return ok({ operator });
  } catch (error) {
    return handleError(error);
  }
}
