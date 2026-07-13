import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAgent } from "@/lib/auth/session";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { supportTicketRepository } from "@/repositories/support-ticket.repository";
import { verifyUridSchema } from "@/validators/operator";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAgent();
    const { id } = await params;

    const ticket = await supportTicketRepository.getById(id);
    if (!ticket) throw new NotFoundError("Ticket");
    if (ticket.subjectEntityType !== "OPERATOR" || !ticket.operatorId) {
      throw new ValidationError({ operatorId: ["Attach an operator to this ticket first"] });
    }

    const { urid } = verifyUridSchema.parse(await req.json());
    const operator = await operatorRepository.findById(ticket.operatorId);

    // Never reveal whether the ticket's operator exists/matches on failure —
    // same generic outcome either way.
    if (!operator || operator.urid !== urid.trim().toUpperCase()) {
      return ok({ verified: false });
    }

    return ok({ verified: true, name: operator.name, urid: operator.urid });
  } catch (error) {
    return handleError(error);
  }
}
