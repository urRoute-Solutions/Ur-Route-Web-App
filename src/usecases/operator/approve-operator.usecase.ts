import { NotFoundError, ConflictError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { toOperatorDTO, type OperatorDTO } from "@/dto/operator.dto";
import { auditService } from "@/services/audit.service";
import type { AuthPrincipal } from "@/types/auth";

export async function approveOperatorUseCase(
  operatorId: string,
  action: "approve" | "suspend",
  principal: AuthPrincipal,
): Promise<OperatorDTO> {
  const operator = await operatorRepository.findById(operatorId);
  if (!operator) throw new NotFoundError("Operator");

  if (action === "approve" && operator.status === "ACTIVE") {
    throw new ConflictError("Operator is already active");
  }

  const status = action === "approve" ? "ACTIVE" : "SUSPENDED";
  const updated = await operatorRepository.update(operatorId, { status });

  auditService.record({
    action: action === "approve" ? "OPERATOR_APPROVED" : "OPERATOR_SUSPENDED",
    actorId: principal.userId,
    operatorId: operator.id,
    entity: "Operator",
    entityId: operator.id,
  });

  return toOperatorDTO(updated);
}
