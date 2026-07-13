-- Revert the support-verification-workflow migration

-- AlterTable: users
DROP INDEX IF EXISTS "users_urid_key";
ALTER TABLE "users" DROP COLUMN IF EXISTS "urid";

-- AlterTable: service_tickets
ALTER TABLE "service_tickets" DROP COLUMN IF EXISTS "subjectEntityType";

-- DropEnum
DROP TYPE IF EXISTS "TicketSubjectType";

-- AlterTable: audit_logs
ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "auditSeq";
