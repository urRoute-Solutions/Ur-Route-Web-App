import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { supportTicketRepository } from "@/repositories/support-ticket.repository";

export const runtime = "nodejs";

const bodySchema = z.object({ body: z.string().min(1).max(2000) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const senderRole = role === "ADMIN" ? "ADMIN" : role === "OPERATOR" ? "OPERATOR" : "USER";
    const message = await supportTicketRepository.addMessage(id, userId, senderRole, body);
    return ok({ message }, 201);
  } catch (err) {
    return handleError(err);
  }
}
