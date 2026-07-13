import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAgent } from "@/lib/auth/session";
import { NotFoundError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { supportTicketRepository } from "@/repositories/support-ticket.repository";
import { routeRepository } from "@/repositories/route.repository";
import { offerTemplateRepository } from "@/repositories/offer-template.repository";
import { toOperatorDTO } from "@/dto/operator.dto";
import { agentUpdateOperatorSchema } from "@/validators/operator";
import { agentUpdateOperatorUseCase } from "@/usecases/operator/agent-update-operator.usecase";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAgent();
    const { id } = await params;
    const ticket = await supportTicketRepository.getById(id);
    if (!ticket) throw new NotFoundError("Ticket");
    if (ticket.subjectEntityType !== "OPERATOR" || !ticket.operatorId) return ok({ operator: null });

    const operator = await operatorRepository.findById(ticket.operatorId);
    if (!operator) return ok({ operator: null });

    const [[routes], offerLevels] = await Promise.all([
      routeRepository.listByOperator(operator.id, { page: 1, pageSize: 10 }),
      offerTemplateRepository.listByOperator(operator.id),
    ]);

    return ok({
      operator: toOperatorDTO(operator),
      routes: routes.map((r) => ({
        id: r.id,
        origin: r.origin,
        destination: r.destination,
        isActive: r.isActive,
      })),
      offerLevels: offerLevels.map((o) => ({
        level: o.level,
        title: o.title,
        discountType: o.discountType,
        percentage: o.percentage,
        flatAmountMinor: o.flatAmountMinor,
        maxCapMinor: o.maxCapMinor,
        groupBonusPerHead: o.groupBonusPerHead,
        groupBonusMaxHeads: o.groupBonusMaxHeads,
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const principal = await requireAgent();
    const { id } = await params;
    const input = agentUpdateOperatorSchema.parse(await req.json());
    const result = await agentUpdateOperatorUseCase(id, input, principal);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
