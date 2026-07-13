import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAgent } from "@/lib/auth/session";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { userRepository } from "@/repositories/user.repository";
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
    if (ticket.subjectEntityType !== "USER" || !ticket.subjectUserId) {
      throw new ValidationError({ subjectUserId: ["Attach a user to this ticket first"] });
    }

    const { urid } = verifyUridSchema.parse(await req.json());
    const user = await userRepository.findById(ticket.subjectUserId);

    // Never reveal whether the ticket's user exists/matches on failure —
    // same generic outcome either way.
    if (!user || user.urid !== urid.trim().toUpperCase()) {
      return ok({ verified: false });
    }

    return ok({ verified: true, name: user.fullName, urid: user.urid });
  } catch (error) {
    return handleError(error);
  }
}
