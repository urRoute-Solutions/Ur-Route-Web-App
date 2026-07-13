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

  // `status` is admin-only — an operator can never self-activate/suspend.
  const { status, ...rest } = input;
  const data = principal.role === "ADMIN" ? { ...rest, status } : rest;

  const updated = await operatorRepository.update(operatorId, data);

  if (status && principal.role === "ADMIN" && status !== operator.status) {
    auditService.record({
      action: "OPERATOR_STATUS_CHANGED",
      actorId: principal.userId,
      operatorId: operator.id,
      entity: "Operator",
      entityId: operator.id,
      metadata: { from: operator.status, to: status },
    });
  }

  auditService.record({
    action: "OPERATOR_UPDATED",
    actorId: principal.userId,
    operatorId: operator.id,
    entity: "Operator",
    entityId: operator.id,
  });

  return toOperatorDTO(updated);
}
