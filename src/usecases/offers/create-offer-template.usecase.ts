import { ForbiddenError, NotFoundError, ConflictError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { offerTemplateRepository } from "@/repositories/offer-template.repository";
import { toOfferTemplateDTO, type OfferTemplateDTO } from "@/dto/reward.dto";
import { auditService } from "@/services/audit.service";
import type { CreateOfferTemplateInput } from "@/validators/offer-template";
import type { AuthPrincipal } from "@/types/auth";

export async function createOfferTemplateUseCase(
  operatorId: string,
  input: CreateOfferTemplateInput,
  principal: AuthPrincipal,
): Promise<OfferTemplateDTO> {
  const operator = await operatorRepository.findById(operatorId);
  if (!operator) throw new NotFoundError("Operator");
  if (principal.role === "OPERATOR" && operator.ownerId !== principal.userId) throw new ForbiddenError();

  const existing = await offerTemplateRepository.findByOperatorAndLevel(operatorId, input.level);
  if (existing) throw new ConflictError(`An offer for ${input.level} already exists`);

  const template = await offerTemplateRepository.create({
    operator: { connect: { id: operatorId } },
    level: input.level,
    title: input.title,
    description: input.description,
    discountType: input.discountType,
    percentage: input.percentage,
    flatAmountMinor: input.flatAmountMinor,
    maxCapMinor: input.maxCapMinor,
    groupBonusPerHead: input.groupBonusPerHead,
    groupBonusMaxHeads: input.groupBonusMaxHeads,
    unlockTripNumber: input.unlockTripNumber,
    rewardTripNumber: input.rewardTripNumber,
  });

  auditService.record({ action: "OFFER_TEMPLATE_CREATED", actorId: principal.userId, operatorId, entity: "OfferTemplate", entityId: template.id });
  return toOfferTemplateDTO(template);
}
