import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { offerTemplateRepository } from "@/repositories/offer-template.repository";
import { toOfferTemplateDTO, type OfferTemplateDTO } from "@/dto/reward.dto";
import { auditService } from "@/services/audit.service";
import type { UpdateOfferTemplateInput } from "@/validators/offer-template";
import type { AuthPrincipal } from "@/types/auth";

export async function updateOfferTemplateUseCase(
  operatorId: string,
  templateId: string,
  input: UpdateOfferTemplateInput,
  principal: AuthPrincipal,
): Promise<OfferTemplateDTO> {
  const operator = await operatorRepository.findById(operatorId);
  if (!operator) throw new NotFoundError("Operator");
  if (principal.role === "OPERATOR" && operator.ownerId !== principal.userId) throw new ForbiddenError();

  const template = await offerTemplateRepository.findById(templateId);
  if (!template || template.operatorId !== operatorId) throw new NotFoundError("OfferTemplate");

  const updated = await offerTemplateRepository.update(templateId, input);
  auditService.record({ action: "OFFER_TEMPLATE_UPDATED", actorId: principal.userId, operatorId, entity: "OfferTemplate", entityId: templateId });
  return toOfferTemplateDTO(updated);
}
