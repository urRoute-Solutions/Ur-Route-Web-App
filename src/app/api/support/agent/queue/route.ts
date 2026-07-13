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

    const include = {
      user: { select: { fullName: true, email: true } },
      assignedAgent: { select: { fullName: true } },
      _count: { select: { messages: true } },
    };
    const orderBy = [{ priority: "desc" as const }, { createdAt: "asc" as const }];

    if (role === "ADMIN") {
      // Admins see every open/in-progress ticket in one flat list
      const tickets = await prisma.serviceTicket.findMany({
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
        orderBy,
        include,
      });
      return ok({
        tickets: tickets.map((t) => ({ ...t, ticketNumber: ticketNumber(t.ticketSeq) })),
        unclaimed: [],
      });
    }

    // Agents: their assigned tickets + bot-handled tickets with no agent (claimable)
    const [assigned, unclaimed] = await Promise.all([
      prisma.serviceTicket.findMany({
        where: { assignedAgentId: userId, status: { in: ["OPEN", "IN_PROGRESS"] } },
        orderBy,
        include,
      }),
      prisma.serviceTicket.findMany({
        where: { isBotHandled: true, assignedAgentId: null, status: { in: ["OPEN"] } },
        orderBy,
        include,
      }),
    ]);

    return ok({
      tickets: assigned.map((t) => ({ ...t, ticketNumber: ticketNumber(t.ticketSeq) })),
      unclaimed: unclaimed.map((t) => ({ ...t, ticketNumber: ticketNumber(t.ticketSeq) })),
    });
  } catch (err) {
    return handleError(err);
  }
}
