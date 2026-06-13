/**
 * Daily analytics aggregation cron job.
 * Run via an external scheduler (Render cron, Vercel cron, or system cron).
 * Invoked by: POST /api/cron/aggregate-analytics (guarded by CRON_SECRET).
 */
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function aggregateDailyAnalytics(date: Date = new Date()) {
  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setUTCHours(23, 59, 59, 999);

  logger.info("Aggregating daily analytics", { date: dayStart.toISOString() });

  // Platform-wide totals.
  const [bookingsCount, revenueResult, newUsersCount, rewardsCount] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: dayStart, lte: dayEnd }, status: { not: "CANCELLED" } } }),
    prisma.booking.aggregate({ _sum: { totalFareMinor: true }, where: { createdAt: { gte: dayStart, lte: dayEnd }, status: "CONFIRMED" } }),
    prisma.user.count({ where: { createdAt: { gte: dayStart, lte: dayEnd } } }),
    prisma.rewardHistory.count({ where: { createdAt: { gte: dayStart, lte: dayEnd }, status: "REDEEMED" } }),
  ]);

  await prisma.analyticsDaily.upsert({
    where: { operatorId_date: { operatorId: null as unknown as string, date: dayStart } },
    create: {
      operatorId: null,
      date: dayStart,
      bookingsCount,
      revenueMinor: revenueResult._sum.totalFareMinor ?? 0,
      newUsers: newUsersCount,
      activeUsers: 0,
      rewardsRedeemed: rewardsCount,
    },
    update: {
      bookingsCount,
      revenueMinor: revenueResult._sum.totalFareMinor ?? 0,
      newUsers: newUsersCount,
      rewardsRedeemed: rewardsCount,
    },
  });

  // Per-operator aggregation.
  const operators = await prisma.operator.findMany({ select: { id: true }, where: { deletedAt: null } });

  await Promise.all(
    operators.map(async ({ id: operatorId }) => {
      const [opBookings, opRevenue, opRewards] = await Promise.all([
        prisma.booking.count({ where: { operatorId, createdAt: { gte: dayStart, lte: dayEnd }, status: { not: "CANCELLED" } } }),
        prisma.booking.aggregate({ _sum: { totalFareMinor: true }, where: { operatorId, createdAt: { gte: dayStart, lte: dayEnd }, status: "CONFIRMED" } }),
        prisma.rewardHistory.count({ where: { operatorId, createdAt: { gte: dayStart, lte: dayEnd }, status: "REDEEMED" } }),
      ]);

      await prisma.analyticsDaily.upsert({
        where: { operatorId_date: { operatorId, date: dayStart } },
        create: { operatorId, date: dayStart, bookingsCount: opBookings, revenueMinor: opRevenue._sum.totalFareMinor ?? 0, newUsers: 0, activeUsers: 0, rewardsRedeemed: opRewards },
        update: { bookingsCount: opBookings, revenueMinor: opRevenue._sum.totalFareMinor ?? 0, rewardsRedeemed: opRewards },
      });
    }),
  );

  logger.info("Daily analytics aggregation complete");
}
