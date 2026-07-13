import { ConflictError, ForbiddenError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { toOperatorDTO, type OperatorDTO } from "@/dto/operator.dto";
import { auditService } from "@/services/audit.service";
import { generateUrid } from "@/utils/ids";
import type { CreateOperatorInput } from "@/validators/operator";
import type { AuthPrincipal } from "@/types/auth";

async function uniqueUrid(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const urid = generateUrid("OPR");
    if (!(await operatorRepository.findByUrid(urid))) return urid;
  }
  return generateUrid("OPR", 9); // fallback: longer code, negligible collision odds
}

export async function createOperatorUseCase(
  input: CreateOperatorInput,
  principal: AuthPrincipal,
): Promise<OperatorDTO> {
  if (principal.role !== "OPERATOR") {
    throw new ForbiddenError("Only OPERATOR accounts can create an operator profile");
  }

  if (await operatorRepository.findByOwnerId(principal.userId)) {
    throw new ConflictError("This account already has an operator profile");
  }

  if (await operatorRepository.findBySlug(input.slug)) {
    throw new ConflictError("This slug is already taken");
  }

  const operator = await operatorRepository.create({
    owner: { connect: { id: principal.userId } },
    name: input.name,
    slug: input.slug,
    urid: await uniqueUrid(),
    description: input.description,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    address: input.address,
    city: input.city,
    status: "PENDING",
  });

  auditService.record({
    action: "OPERATOR_CREATED",
    actorId: principal.userId,
    operatorId: operator.id,
    entity: "Operator",
    entityId: operator.id,
  });

  return toOperatorDTO(operator);
}
