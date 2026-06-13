import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { toOperatorDTO, type OperatorDTO } from "@/dto/operator.dto";
import { auditService } from "@/services/audit.service";
import type { UpdateOperatorInput } from "@/validators/operator";
import type { AuthPrincipal } from "@/types/auth";

export async function updateOperatorUseCase(
  operatorId: string,
  input: UpdateOperatorInput,
  principal: AuthPrincipal,
): Promise<OperatorDTO> {
  const operator = await operatorRepository.findById(operatorId);
  if (!operator) throw new NotFoundError("Operator");

  // Operator can only edit their own; admin can edit any.
  if (principal.role === "OPERATOR" && operator.ownerId !== principal.userId) {
    throw new ForbiddenError();
  }

  const updated = await operatorRepository.update(operatorId, input);

  auditService.record({
    action: "OPERATOR_UPDATED",
    actorId: principal.userId,
    operatorId: operator.id,
    entity: "Operator",
    entityId: operator.id,
  });

  return toOperatorDTO(updated);
}
