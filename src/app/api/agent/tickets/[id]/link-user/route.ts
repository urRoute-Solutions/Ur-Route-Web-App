import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, handleError } from "@/lib/http";
import { requireAgent } from "@/lib/auth/session";
import { NotFoundError } from "@/lib/errors";
import { userRepository } from "@/repositories/user.repository";
import { supportTicketRepository } from "@/repositories/support-ticket.repository";

export const runtime = "nodejs";

const bodySchema = z.object({ urid: z.string().min(11).max(13).regex(/^USR-[A-Z]{7,9}$/i, "Invalid URID format") });

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
    const user = await userRepository.findByUrid(urid.trim().toUpperCase());
    if (!user) throw new NotFoundError("User");

    const updated = await supportTicketRepository.setSubjectUser(id, user.id);
    await supportTicketRepository.addMessage(
      id,
      principal.userId,
      "SYSTEM",
      `Linked to user: ${user.fullName} (${user.urid})`,
    );

    return ok({ ticket: updated });
  } catch (error) {
    return handleError(error);
  }
}
