import { auditRepository } from "@/repositories/audit.repository";
import { logger } from "@/lib/logger";

export interface AuditEntry {
  action: string; // "USER_LOGIN", "OFFER_UPDATED" ...
  actorId?: string | null;
  operatorId?: string | null;
  entity?: string;
  entityId?: string;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Append-only audit trail. Calls are FIRE-AND-FORGET: auditing must never break
 * or slow the primary operation, so failures are logged and swallowed. For
 * compliance-critical actions (payments) write the audit row inside the same
 * transaction instead of using this helper.
 */
export const auditService = {
  record(entry: AuditEntry): void {
    void auditRepository
      .create({
        action: entry.action,
        actor: entry.actorId ? { connect: { id: entry.actorId } } : undefined,
        operatorId: entry.operatorId ?? null,
        entity: entry.entity,
        entityId: entry.entityId,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
        metadata: (entry.metadata ?? {}) as object,
      })
      .catch((error) => {
        logger.error("Failed to write audit log", { action: entry.action, error });
      });
  },
};
