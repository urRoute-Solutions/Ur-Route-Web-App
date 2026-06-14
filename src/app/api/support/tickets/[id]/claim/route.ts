import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAgent } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

export const runtime = "nodejs";

// Agent manually claims an unassigned or bot-handled ticket
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await requireAgent();
    const { id } = await params;

    const ticket = await prisma.serviceTicket.findUnique({ where: { id } });
    if (!ticket) throw new AppError("Ticket not found", 404, "NOT_FOUND");

    const agent = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true },
    });

    await prisma.serviceTicket.update({
      where: { id },
      data: { assignedAgentId: userId, assignedAt: new Date(), isBotHandled: false, status: "IN_PROGRESS" },
    });

    await prisma.serviceTicketMessage.create({
      data: {
        ticketId: id,
        senderRole: "SYSTEM",
        body: `${agent?.fullName ?? "A support agent"} has joined your conversation.`,
      },
    });

    return ok({ claimed: true });
  } catch (err) {
    return handleError(err);
  }
}
