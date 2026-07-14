import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { offerTemplateRepository } from "@/repositories/offer-template.repository";
import { auditService } from "@/services/audit.service";
import type { AuthPrincipal } from "@/types/auth";

export async function deleteOfferTemplateUseCase(
  operatorId: string,
  templateId: string,
  principal: AuthPrincipal,
): Promise<void> {
  const operator = await operatorRepository.findById(operatorId);
  if (!operator) throw new NotFoundError("Operator");
  if (principal.role === "OPERATOR" && operator.ownerId !== principal.userId) throw new ForbiddenError();

  const template = await offerTemplateRepository.findById(templateId);
  if (!template || template.operatorId !== operatorId) throw new NotFoundError("OfferTemplate");

  await offerTemplateRepository.deactivate(templateId);
  auditService.record({ action: "OFFER_TEMPLATE_DELETED", actorId: principal.userId, operatorId, entity: "OfferTemplate", entityId: templateId });
}
