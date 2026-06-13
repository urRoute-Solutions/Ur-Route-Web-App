import { NotFoundError } from "@/lib/errors";
import { userRepository } from "@/repositories/user.repository";
import { toUserDTO, type UserDTO } from "@/dto/user.dto";

/** Fetch the authenticated user's own profile. */
export async function getProfileUseCase(userId: string): Promise<UserDTO> {
  const user = await userRepository.findById(userId);
  if (!user || user.deletedAt) throw new NotFoundError("User");
  return toUserDTO(user);
}
