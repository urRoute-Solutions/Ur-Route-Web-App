import { ok, handleError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const SERVICES = [
  { name: "Web Application", slug: "web-app", description: "Main website and traveler portal", displayOrder: 1 },
  { name: "API", slug: "api", description: "Core REST API powering all clients", displayOrder: 2 },
  { name: "Authentication", slug: "auth", description: "Login, registration, and session management", displayOrder: 3 },
  { name: "Booking System", slug: "booking", description: "Seat search, selection, and reservation", displayOrder: 4 },
  { name: "Payment Processing", slug: "payments", description: "Razorpay payment gateway integration", displayOrder: 5 },
  { name: "Email Notifications", slug: "email", description: "Booking confirmations and alerts via Resend", displayOrder: 6 },
  { name: "Support Chat", slug: "support", description: "AI-powered and live agent support", displayOrder: 7 },
  { name: "Database", slug: "database", description: "Neon PostgreSQL — primary data store", displayOrder: 8 },
];

export async function POST() {
  try {
    await requireAdmin();

    // Upsert each service
    const results = await Promise.all(
      SERVICES.map((s) =>
        prisma.statusService.upsert({
          where: { slug: s.slug },
          create: s,
          update: { name: s.name, description: s.description, displayOrder: s.displayOrder },
        }),
      ),
    );

    // Backfill 90 days of OPERATIONAL stats for each service (skips if already exists)
    const today = new Date();
    const days = Array.from({ length: 90 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (89 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });
    await prisma.statusDailyStat.createMany({
      data: results.flatMap((svc) =>
        days.map((date) => ({ serviceId: svc.id, date, status: "OPERATIONAL" as const, uptimePct: 100 })),
      ),
      skipDuplicates: true,
    });

    return ok({ seeded: results.length });
  } catch (error) {
    return handleError(error);
  }
}
