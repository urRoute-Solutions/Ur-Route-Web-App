import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const createSchema = z.object({
  title: z.string().min(3).max(200),
  impact: z.enum(["MINOR", "MAJOR", "CRITICAL"]),
  body: z.string().min(5).max(2000),
  serviceIds: z.array(z.string()).min(1),
  // Optionally update affected services' status
  serviceStatus: z.enum(["OPERATIONAL", "DEGRADED", "PARTIAL_OUTAGE", "MAJOR_OUTAGE"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const input = createSchema.parse(await req.json());

    const incident = await prisma.statusIncident.create({
      data: {
        title: input.title,
        impact: input.impact,
        status: "INVESTIGATING",
        updates: {
          create: { body: input.body, status: "INVESTIGATING" },
        },
        services: {
          create: input.serviceIds.map((serviceId) => ({ serviceId })),
        },
      },
      include: { updates: true, services: { include: { service: true } } },
    });

    // Update affected services' current status
    if (input.serviceStatus) {
      await prisma.statusService.updateMany({
        where: { id: { in: input.serviceIds } },
        data: { currentStatus: input.serviceStatus },
      });
    }

    return NextResponse.json({ incident }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
