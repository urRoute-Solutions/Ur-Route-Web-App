import { ConflictError } from "@/lib/errors";
import { userRepository } from "@/repositories/user.repository";
import { auditService } from "@/services/audit.service";
import { toUserDTO, type UserDTO } from "@/dto/user.dto";
import type { UpdateProfileInput } from "@/validators/profile";

/** Update the authenticated user's own profile (PATCH semantics). */
export async function updateProfileUseCase(
  userId: string,
  input: UpdateProfileInput,
): Promise<UserDTO> {
  // Phone is unique — guard against collision with another account.
  if (input.phone) {
    const existing = await userRepository.findByIdentifier(input.phone);
    if (existing && existing.id !== userId) {
      throw new ConflictError("Phone number already in use");
    }
  }

  const user = await userRepository.update(userId, {
    ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
    ...(input.birthday !== undefined ? { birthday: input.birthday } : {}),
  });

  auditService.record({
    action: "PROFILE_UPDATED",
    actorId: userId,
    entity: "User",
    entityId: userId,
    metadata: { fields: Object.keys(input) },
  });

  return toUserDTO(user);
}
