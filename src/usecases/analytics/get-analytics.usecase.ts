import { prisma } from "@/lib/prisma";

export interface DailyAnalytics {
  date: string;
  bookingsCount: number;
  revenueMinor: number;
  newUsers: number;
  activeUsers: number;
  rewardsRedeemed: number;
}

export async function getOperatorAnalyticsUseCase(
  operatorId: string,
  params: { from: string; to: string },
): Promise<DailyAnalytics[]> {
  const rows = await prisma.analyticsDaily.findMany({
    where: {
      operatorId,
      date: { gte: new Date(params.from), lte: new Date(params.to) },
    },
    orderBy: { date: "asc" },
  });

  return rows.map((r) => ({
    date: r.date.toISOString().split("T")[0]!,
    bookingsCount: r.bookingsCount,
    revenueMinor: r.revenueMinor,
    newUsers: r.newUsers,
    activeUsers: r.activeUsers,
    rewardsRedeemed: r.rewardsRedeemed,
  }));
}

export async function getPlatformAnalyticsUseCase(
  params: { from: string; to: string },
): Promise<DailyAnalytics[]> {
  const rows = await prisma.analyticsDaily.findMany({
    where: {
      operatorId: null,
      date: { gte: new Date(params.from), lte: new Date(params.to) },
    },
    orderBy: { date: "asc" },
  });

  return rows.map((r) => ({
    date: r.date.toISOString().split("T")[0]!,
    bookingsCount: r.bookingsCount,
    revenueMinor: r.revenueMinor,
    newUsers: r.newUsers,
    activeUsers: r.activeUsers,
    rewardsRedeemed: r.rewardsRedeemed,
  }));
}
