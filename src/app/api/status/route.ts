import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const revalidate = 60; // cache for 60s

export async function GET() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);

  const [services, activeIncidents, recentIncidents] = await Promise.all([
    prisma.statusService.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        dailyStats: {
          where: { date: { gte: ninetyDaysAgo } },
          orderBy: { date: "asc" },
          select: { date: true, status: true, uptimePct: true },
        },
      },
    }),
    prisma.statusIncident.findMany({
      where: { status: { not: "RESOLVED" } },
      orderBy: { createdAt: "desc" },
      include: {
        updates: { orderBy: { createdAt: "desc" }, take: 3 },
        services: { include: { service: { select: { name: true } } } },
      },
    }),
    prisma.statusIncident.findMany({
      where: { status: "RESOLVED", resolvedAt: { gte: new Date(Date.now() - 30 * 86400000) } },
      orderBy: { resolvedAt: "desc" },
      take: 10,
      include: {
        updates: { orderBy: { createdAt: "asc" } },
        services: { include: { service: { select: { name: true } } } },
      },
    }),
  ]);

  return NextResponse.json({ services, activeIncidents, recentIncidents });
}
