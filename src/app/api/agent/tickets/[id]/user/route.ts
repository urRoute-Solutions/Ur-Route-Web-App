import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAgent } from "@/lib/auth/session";
import { NotFoundError } from "@/lib/errors";
import { userRepository } from "@/repositories/user.repository";
import { supportTicketRepository } from "@/repositories/support-ticket.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { toUserDTO } from "@/dto/user.dto";
import { agentUpdateUserSchema } from "@/validators/agent-user";
import { agentUpdateUserUseCase } from "@/usecases/profile/agent-update-user.usecase";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAgent();
    const { id } = await params;
    const ticket = await supportTicketRepository.getById(id);
    if (!ticket) throw new NotFoundError("Ticket");
    if (ticket.subjectEntityType !== "USER" || !ticket.subjectUserId) return ok({ user: null });

    const user = await userRepository.findById(ticket.subjectUserId);
    if (!user) return ok({ user: null });

    const [bookings] = await bookingRepository.listByUser(user.id, { page: 1, pageSize: 5 });

    return ok({
      user: toUserDTO(user),
      recentBookings: bookings.map((b) => ({
        id: b.id,
        pnr: b.pnr,
        status: b.status,
        totalFareMinor: b.totalFareMinor,
        createdAt: b.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const principal = await requireAgent();
    const { id } = await params;
    const input = agentUpdateUserSchema.parse(await req.json());
    const result = await agentUpdateUserUseCase(id, input, principal);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
