import type { User } from "@prisma/client";

/**
 * Public-safe user shape. NEVER return a raw Prisma `User` to a client —
 * it carries `passwordHash`. Map through this DTO at the boundary.
 */
export interface UserDTO {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  role: User["role"];
  avatarUrl: string | null;
  referralCode: string;
  emailVerified: boolean;
  createdAt: string;
}

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    fullName: user.fullName,
    role: user.role,
    avatarUrl: user.avatarUrl,
    referralCode: user.referralCode,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
  };
}
