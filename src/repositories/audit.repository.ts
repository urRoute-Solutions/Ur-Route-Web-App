import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const auditRepository = {
  create(data: Prisma.AuditLogCreateInput) {
    return prisma.auditLog.create({ data });
  },
};
