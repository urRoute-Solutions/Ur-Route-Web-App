import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

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
    if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

    return NextResponse.json({ incident: updated });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
