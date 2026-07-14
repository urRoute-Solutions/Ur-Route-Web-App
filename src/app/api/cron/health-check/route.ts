import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import { getEnv } from "@/config/env";

export const runtime = "nodejs";

async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  try {
    const redis = getRedis();
    if (!redis) return true; // not configured = skip
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}

async function checkApi(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/status`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  const configured = getEnv().CRON_SECRET;
  if (!configured || secret !== configured) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const env = getEnv();
  const baseUrl = env.APP_URL ?? "http://localhost:3000";

  const [dbOk, redisOk, apiOk] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkApi(baseUrl),
  ]);

  // Map to service slugs
  const checks: Record<string, boolean> = {
    database: dbOk,
    api: apiOk,
    "web-app": apiOk,
    auth: dbOk,
    booking: dbOk && apiOk,
    payments: dbOk,
    email: true, // assume OK unless an incident is open
    support: dbOk && redisOk,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const services = await prisma.statusService.findMany({ select: { id: true, slug: true } });

  await Promise.all(
    services.map(async (svc) => {
      const healthy = checks[svc.slug] ?? true;
      const newStatus = healthy ? "OPERATIONAL" : "DEGRADED";
      const uptimePct = healthy ? 100 : 50;

      await prisma.statusDailyStat.upsert({
        where: { serviceId_date: { serviceId: svc.id, date: today } },
        create: { serviceId: svc.id, date: today, status: newStatus, uptimePct },
        update: { status: newStatus, uptimePct },
      });

      if (!healthy) {
        await prisma.statusService.update({
          where: { id: svc.id },
          data: { currentStatus: "DEGRADED" },
        });
      }
    }),
  );

  return NextResponse.json({ checked: services.length, dbOk, redisOk, apiOk });
}
