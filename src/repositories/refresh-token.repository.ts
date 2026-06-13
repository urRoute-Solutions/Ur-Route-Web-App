import type { RefreshToken } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Refresh-token persistence with rotation support.
 *
 * Security model:
 *  • Tokens are stored HASHED (sha-256) — see auth/hash.ts.
 *  • Each refresh issues a new row and marks the old `revokedAt` + `replacedById`.
 *  • If a token that's ALREADY revoked is presented (reuse), we revoke the whole
 *    `familyId` — a strong signal the refresh cookie was stolen.
 */
export const refreshTokenRepository = {
  create(input: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
    userAgent?: string | null;
    ip?: string | null;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data: input });
  },

  findByHash(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  },

  revoke(id: string, replacedById?: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date(), replacedById: replacedById ?? null },
    });
  },

  /** Nuke an entire rotation family (reuse detected / logout-all). */
  async revokeFamily(familyId: string): Promise<number> {
    const res = await prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return res.count;
  },

  async revokeAllForUser(userId: string): Promise<number> {
    const res = await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return res.count;
  },
};
