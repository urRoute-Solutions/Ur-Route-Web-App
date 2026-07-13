import type { Prisma, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * User data access. Users are GLOBAL (not tenant-scoped) — a traveler rides
 * many operators. All Prisma access to the users table funnels through here.
 */
export const userRepository = {
  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  },

  /** Resolve a login identifier that may be email OR phone. */
  findByIdentifier(identifier: string): Promise<User | null> {
    const value = identifier.trim();
    return prisma.user.findFirst({
      where: {
        OR: [{ email: value.toLowerCase() }, { phone: value }],
        deletedAt: null,
      },
    });
  },

  findByReferralCode(code: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { referralCode: code } });
  },

  findByUrid(urid: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { urid } });
  },

  create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  },

  touchLastLogin(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  },

  setEmailVerified(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { emailVerified: true },
    });
  },

  /**
   * The operator (tenant) id managed by an OPERATOR-role user, if any.
   * Used to stamp `operatorId` into the principal/JWT at login.
   */
  async getManagedOperatorId(userId: string): Promise<string | null> {
    const op = await prisma.operator.findUnique({
      where: { ownerId: userId },
      select: { id: true },
    });
    return op?.id ?? null;
  },
};
