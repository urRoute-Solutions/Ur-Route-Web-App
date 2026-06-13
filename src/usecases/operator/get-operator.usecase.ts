import { NotFoundError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { toOperatorDTO, type OperatorDTO } from "@/dto/operator.dto";

export async function getOperatorUseCase(idOrSlug: string): Promise<OperatorDTO> {
  const operator =
    (await operatorRepository.findById(idOrSlug)) ??
    (await operatorRepository.findBySlug(idOrSlug));

  if (!operator) throw new NotFoundError("Operator");
  return toOperatorDTO(operator);
}
