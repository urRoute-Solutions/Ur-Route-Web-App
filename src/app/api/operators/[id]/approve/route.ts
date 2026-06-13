import { z } from "zod";
import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth/session";
import { approveOperatorUseCase } from "@/usecases/operator/approve-operator.usecase";

export const runtime = "nodejs";

const schema = z.object({
  action: z.enum(["approve", "suspend"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const principal = await requireAdmin();
    const { id } = await params;
    const { action } = schema.parse(await req.json());
    const operator = await approveOperatorUseCase(id, action, principal);
    return ok({ operator });
  } catch (error) {
    return handleError(error);
  }
}
