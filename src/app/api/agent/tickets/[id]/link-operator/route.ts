import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, handleError } from "@/lib/http";
import { requireAgent } from "@/lib/auth/session";
import { NotFoundError } from "@/lib/errors";
import { operatorRepository } from "@/repositories/operator.repository";
import { supportTicketRepository } from "@/repositories/support-ticket.repository";

export const runtime = "nodejs";

const bodySchema = z.object({ urid: z.string().min(11).max(13).regex(/^OPR-[A-Z]{7,9}$/i, "Invalid URID format") });

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
    const operator = await operatorRepository.findByUrid(urid.trim().toUpperCase());
    if (!operator) throw new NotFoundError("Operator");

    const updated = await supportTicketRepository.setOperator(id, operator.id);
    await supportTicketRepository.addMessage(
      id,
      principal.userId,
      "SYSTEM",
      `Linked to operator: ${operator.name} (${operator.urid})`,
    );

    return ok({ ticket: updated });
  } catch (error) {
    return handleError(error);
  }
}
