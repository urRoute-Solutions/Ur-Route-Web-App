import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { supportTicketRepository } from "@/repositories/support-ticket.repository";

export const runtime = "nodejs";

const patchSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
});

export async function GET(
  _req: NextRequest,
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
    return ok({ ticket });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { role } = await requireAuth();
    if (role === "TRAVELER") throw new AppError("Forbidden", 403, "FORBIDDEN");
    const { id } = await params;
    const { status } = patchSchema.parse(await req.json());
    const ticket = await supportTicketRepository.updateStatus(id, status);
    return ok({ ticket });
  } catch (err) {
    return handleError(err);
  }
}
