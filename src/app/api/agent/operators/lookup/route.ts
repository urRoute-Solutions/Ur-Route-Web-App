import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAgent } from "@/lib/auth/session";
import { ValidationError } from "@/lib/errors";
import { lookupOperatorByUridUseCase } from "@/usecases/operator/lookup-operator-by-urid.usecase";
import { auditService } from "@/services/audit.service";

export const runtime = "nodejs";

const URID_PATTERN = /^OPR-[A-Z]{7,9}$/;

export async function GET(req: NextRequest) {
  try {
    const principal = await requireAgent();
    const urid = (req.nextUrl.searchParams.get("urid") ?? "").trim().toUpperCase();
    if (!URID_PATTERN.test(urid)) {
      throw new ValidationError({ urid: ["Must be an operator URID, e.g. OPR-STBKNTY"] });
    }

    const result = await lookupOperatorByUridUseCase(urid);

    auditService.record({
      action: "OPERATOR_LOOKED_UP",
      actorId: principal.userId,
      operatorId: result.operator.id,
      entity: "Operator",
      entityId: result.operator.id,
      metadata: { urid },
    });

    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
