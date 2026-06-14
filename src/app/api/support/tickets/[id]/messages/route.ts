import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { supportTicketRepository } from "@/repositories/support-ticket.repository";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const bodySchema = z.object({ body: z.string().min(1).max(2000) });

// GET: poll for new messages (supports ?after=ISO_TIMESTAMP)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId, role } = await requireAuth();
    const { id } = await params;
    const ticket = await supportTicketRepository.getById(id);
    if (!ticket) throw new AppError("Ticket not found", 404, "NOT_FOUND");
    if (role === "TRAVELER" && ticket.userId !== userId) {
      throw new AppError("Not found", 404, "NOT_FOUND");
    }

    const after = req.nextUrl.searchParams.get("after");
    const messages = await prisma.serviceTicketMessage.findMany({
      where: {
        ticketId: id,
        ...(after ? { createdAt: { gt: new Date(after) } } : {}),
      },
      orderBy: { createdAt: "asc" },
    });

    // Also return current ticket meta (agent assignment, status)
    const meta = {
      status: ticket.status,
      assignedAgentId: ticket.assignedAgentId,
      isBotHandled: ticket.isBotHandled,
      agentName: ticket.assignedAgent
        ? (ticket.assignedAgent as unknown as { fullName: string }).fullName
        : null,
    };

    return ok({ messages, meta });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId, role } = await requireAuth();
    const { id } = await params;
    const ticket = await supportTicketRepository.getById(id);
    if (!ticket) throw new AppError("Ticket not found", 404, "NOT_FOUND");
    if (role === "TRAVELER" && ticket.userId !== userId) {
      throw new AppError("Not found", 404, "NOT_FOUND");
    }
    const { body } = bodySchema.parse(await req.json());
    const senderRole =
      role === "ADMIN" ? "ADMIN" : role === "AGENT" ? "AGENT" : role === "OPERATOR" ? "OPERATOR" : "USER";
    const message = await supportTicketRepository.addMessage(id, userId, senderRole, body);
    return ok({ message }, 201);
  } catch (err) {
    return handleError(err);
  }
}
