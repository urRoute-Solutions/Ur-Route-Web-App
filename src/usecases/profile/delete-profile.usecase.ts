import { userRepository } from "@/repositories/user.repository";
import { refreshTokenRepository } from "@/repositories/refresh-token.repository";
import { auditService } from "@/services/audit.service";

/**
 * Soft-delete the authenticated user's account.
 *
 * We SOFT delete (set `deletedAt` + deactivate) rather than hard delete: the
 * user is FK-referenced by bookings, payments, and audit logs that must survive
 * for financial/compliance reasons. All sessions are revoked immediately.
 * Email is anonymized-on-conflict later if needed; for now we keep it so the
 * unique constraint blocks re-registration races — refine in a GDPR pass.
 */
export async function deleteProfileUseCase(userId: string): Promise<void> {
  await userRepository.update(userId, {
    deletedAt: new Date(),
    isActive: false,
  });
  await refreshTokenRepository.revokeAllForUser(userId);

  auditService.record({
    action: "ACCOUNT_DELETED",
    actorId: userId,
    entity: "User",
    entityId: userId,
  });
}
