import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, handleError } from "@/lib/http";
import { requireAgent } from "@/lib/auth/session";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { userRepository } from "@/repositories/user.repository";
import { supportTicketRepository } from "@/repositories/support-ticket.repository";

export const runtime = "nodejs";

const bodySchema = z.object({ urid: z.string().min(11).max(13) });

/**
 * Single "attach" entry point: sniffs the URID prefix and delegates to the
 * right entity type, so the ticket page only needs one form before it knows
 * whether it's looking at an Operator or a User.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const principal = await requireAgent();
    const { id } = await params;

    const ticket = await supportTicketRepository.getById(id);
    if (!ticket) throw new NotFoundError("Ticket");

    const { urid } = bodySchema.parse(await req.json());
    const normalized = urid.trim().toUpperCase();

    if (normalized.startsWith("OPR-")) {
      const operator = await operatorRepository.findByUrid(normalized);
      if (!operator) throw new NotFoundError("Operator");
      const updated = await supportTicketRepository.setOperator(id, operator.id);
      await supportTicketRepository.addMessage(id, principal.userId, "SYSTEM", `Linked to operator: ${operator.name} (${operator.urid})`);
      return ok({ ticket: updated, entityType: "OPERATOR" });
    }

    if (normalized.startsWith("USR-")) {
      const user = await userRepository.findByUrid(normalized);
      if (!user) throw new NotFoundError("User");
      const updated = await supportTicketRepository.setSubjectUser(id, user.id);
      await supportTicketRepository.addMessage(id, principal.userId, "SYSTEM", `Linked to user: ${user.fullName} (${user.urid})`);
      return ok({ ticket: updated, entityType: "USER" });
    }

    throw new ValidationError({ urid: ["Must be an operator (OPR-) or user (USR-) URID"] });
  } catch (error) {
    return handleError(error);
  }
}
