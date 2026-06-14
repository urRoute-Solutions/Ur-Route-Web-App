import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { supportTicketRepository } from "@/repositories/support-ticket.repository";
import { autoAssignTicket } from "@/services/ticket-assignment.service";

export const runtime = "nodejs";

const createSchema = z.object({
  category: z.enum(["BOOKING", "CANCELLATION_REFUND", "LOYALTY_REWARDS", "PAYMENT", "OPERATOR_COMPLAINT", "OTHER"]),
  subCategory: z.string().min(1).max(120).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  subject: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  bookingRef: z.string().max(50).optional(),
  operatorId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = createSchema.parse(await req.json());
    const ticket = await supportTicketRepository.create({ userId, ...body });
    // Fire-and-forget: assign to agent or trigger bot fallback
    autoAssignTicket(ticket.id).catch(() => {});
    return ok({ ticket }, 201);
  } catch (err) {
    return handleError(err);
  }
}

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const tickets = await supportTicketRepository.listByUser(userId);
    return ok({ tickets });
  } catch (err) {
    return handleError(err);
  }
}
