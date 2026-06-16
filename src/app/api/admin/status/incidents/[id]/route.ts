import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, handleError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";

export const runtime = "nodejs";

const updateSchema = z.object({
  body: z.string().min(5).max(2000),
  status: z.enum(["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"]),
  // When resolving, optionally restore services to OPERATIONAL
  restoreServices: z.boolean().default(false),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = updateSchema.parse(await req.json());

    const incident = await prisma.statusIncident.findUnique({
      where: { id },
      include: { services: { select: { serviceId: true } } },
    });
    if (!incident) throw new NotFoundError("Incident");

    const resolvedAt = input.status === "RESOLVED" ? new Date() : undefined;

    const [updated] = await Promise.all([
      prisma.statusIncident.update({
        where: { id },
        data: {
          status: input.status,
          resolvedAt,
          updates: { create: { body: input.body, status: input.status } },
        },
        include: { updates: { orderBy: { createdAt: "desc" } }, services: { include: { service: true } } },
      }),
      // Restore services to OPERATIONAL if resolved
      input.status === "RESOLVED" && input.restoreServices
        ? prisma.statusService.updateMany({
            where: { id: { in: incident.services.map((s) => s.serviceId) } },
            data: { currentStatus: "OPERATIONAL" },
          })
        : Promise.resolve(),
    ]);

    return ok({ incident: updated });
  } catch (error) {
    return handleError(error);
  }
}
