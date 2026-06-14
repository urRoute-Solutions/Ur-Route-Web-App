import { ok, handleError } from "@/lib/http";
import { requireAgent } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function ticketNumber(seq: number) {
  return `TKT-${String(seq).padStart(5, "0")}`;
}

export async function GET() {
  try {
    const { userId, role } = await requireAgent();

    // ADMINs see all open tickets; AGENTs see only their assigned ones
    const statusFilter = { in: ["OPEN" as const, "IN_PROGRESS" as const] };
    const where =
      role === "ADMIN"
        ? { status: statusFilter }
        : { assignedAgentId: userId, status: statusFilter };

    const tickets = await prisma.serviceTicket.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      include: {
        user: { select: { fullName: true, email: true } },
        assignedAgent: { select: { fullName: true } },
        _count: { select: { messages: true } },
      },
    });

    return ok({
      tickets: tickets.map((t) => ({ ...t, ticketNumber: ticketNumber(t.ticketSeq) })),
    });
  } catch (err) {
    return handleError(err);
  }
}
