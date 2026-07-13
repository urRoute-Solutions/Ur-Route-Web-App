-- CreateEnum
CREATE TYPE "TicketSubjectType" AS ENUM ('OPERATOR', 'USER');

-- AlterTable: service_tickets
ALTER TABLE "service_tickets" ADD COLUMN "subjectEntityType" "TicketSubjectType";

-- AlterTable: users
ALTER TABLE "users" ADD COLUMN "urid" TEXT;
CREATE UNIQUE INDEX "users_urid_key" ON "users"("urid");

-- AlterTable: audit_logs
ALTER TABLE "audit_logs" ADD COLUMN "auditSeq" SERIAL;
