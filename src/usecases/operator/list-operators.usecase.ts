import type { Operator } from "@prisma/client";
import { operatorRepository } from "@/repositories/operator.repository";
import { toOperatorDTO, type OperatorDTO } from "@/dto/operator.dto";

interface ListOperatorsInput {
  status?: Operator["status"];
  city?: string;
  page?: number;
  pageSize?: number;
}

export async function listOperatorsUseCase(
  input: ListOperatorsInput = {},
): Promise<{ items: OperatorDTO[]; total: number; page: number; pageSize: number }> {
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 20;

  const [operators, total] = await operatorRepository.list({
    status: input.status,
    city: input.city,
    page,
    pageSize,
  });

  return { items: operators.map(toOperatorDTO), total, page, pageSize };
}
