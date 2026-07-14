import { NotFoundError, ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { userRepository } from "@/repositories/user.repository";
import { supportTicketRepository } from "@/repositories/support-ticket.repository";
import { notificationService } from "@/services/notification.service";
import { toUserDTO, type UserDTO } from "@/dto/user.dto";
import { logger } from "@/lib/logger";
import type { AgentUpdateUserInput } from "@/validators/agent-user";
import type { AuthPrincipal } from "@/types/auth";
import type { User } from "@prisma/client";

const EDITABLE_FIELDS = ["fullName", "phone"] as const;
type EditableField = (typeof EDITABLE_FIELDS)[number];

const FIELD_LABEL: Record<EditableField, string> = {
  fullName: "Full name",
  phone: "Phone",
};

function ticketNumber(seq: number) {
  return `TKT-${String(seq).padStart(5, "0")}`;
}

function auditNumber(seq: number) {
  return `AUD-${String(seq).padStart(6, "0")}`;
}

export interface AgentUpdateUserResult {
  user: UserDTO;
  ticketNumber: string;
  auditReference: string;
}

export async function agentUpdateUserUseCase(
  ticketId: string,
  input: AgentUpdateUserInput,
  principal: AuthPrincipal,
): Promise<AgentUpdateUserResult> {
  const ticket = await supportTicketRepository.getById(ticketId);
  if (!ticket) throw new NotFoundError("Ticket");
  if (ticket.subjectEntityType !== "USER" || !ticket.subjectUserId) {
    throw new ValidationError({ subjectUserId: ["Attach and verify a user on this ticket first"] });
  }
  if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
    throw new ValidationError({ ticketId: ["This ticket is already resolved — reopen it before making further changes"] });
  }

  const subjectUser = await userRepository.findById(ticket.subjectUserId);
  if (!subjectUser) throw new NotFoundError("User");

  const changes: { field: EditableField; from: string; to: string }[] = [];
  const data: Partial<Record<EditableField, string>> = {};
  for (const field of EDITABLE_FIELDS) {
    const next = input[field];
    if (next === undefined) continue;
    const prev = (subjectUser[field as keyof User] ?? "") as string;
    if (next !== prev) {
      changes.push({ field, from: prev || "(empty)", to: next });
      data[field] = next;
    }
  }

  if (changes.length === 0) {
    throw new ValidationError({ fields: ["No changes to apply"] });
  }

  const agent = await userRepository.findById(principal.userId);
  const agentName = agent?.fullName ?? "Support";
  const changeSummary = changes.map((c) => `${FIELD_LABEL[c.field]}: "${c.from}" → "${c.to}"`).join(", ");

  const { updated, auditRef } = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({ where: { id: subjectUser.id }, data });

    await tx.serviceTicket.update({
      where: { id: ticketId },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    });

    const audit = await tx.auditLog.create({
      data: {
        action: "USER_UPDATED_BY_AGENT",
        actor: { connect: { id: principal.userId } },
        entity: "User",
        entityId: subjectUser.id,
        metadata: {
          ticketId,
          ticketNumber: ticketNumber(ticket.ticketSeq),
          agentName: agent?.fullName ?? null,
          agentUrid: agent?.urid ?? null,
          entityType: "USER",
          entityUrid: subjectUser.urid,
          entityName: subjectUser.fullName,
          changedFields: changes.map((c) => c.field),
          oldValues: Object.fromEntries(changes.map((c) => [c.field, c.from])),
          newValues: Object.fromEntries(changes.map((c) => [c.field, c.to])),
          resolutionComments: input.resolutionComments,
        },
      },
    });

    await tx.serviceTicketMessage.create({
      data: {
        ticketId,
        senderId: principal.userId,
        senderRole: "SYSTEM",
        body: `Account details updated by ${agentName}: ${changeSummary}. Resolution: ${input.resolutionComments}. Ticket resolved.`,
      },
    });

    return { updated, auditRef: auditNumber(audit.auditSeq) };
  }, { timeout: 15000 });

  Promise.all([
    notificationService.sendEmail(
      updated.email,
      "Your urRoute account details were updated",
      userUpdatedEmailHtml(updated.fullName, changes, input.resolutionComments, ticketNumber(ticket.ticketSeq)),
    ),
    notificationService.sendInApp(
      updated.id,
      "ACCOUNT_UPDATED_BY_SUPPORT",
      "Your account details were updated",
      `Our support team updated ${changes.length} field${changes.length > 1 ? "s" : ""} on your account. Resolution: ${input.resolutionComments}`,
      { ticketId },
    ),
  ]).catch((err) => logger.error("Failed to send user update notifications", { userId: updated.id, err }));

  return {
    user: toUserDTO(updated),
    ticketNumber: ticketNumber(ticket.ticketSeq),
    auditReference: auditRef,
  };
}

function userUpdatedEmailHtml(
  fullName: string,
  changes: { field: EditableField; from: string; to: string }[],
  resolutionComments: string,
  ticketNo: string,
): string {
  const rows = changes
    .map(
      (c) => `
      <tr>
        <td style="padding:8px 12px;color:#6b7280;font-size:13px;">${FIELD_LABEL[c.field]}</td>
        <td style="padding:8px 12px;font-size:13px;text-decoration:line-through;color:#9ca3af;">${c.from}</td>
        <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#111827;">${c.to}</td>
      </tr>`,
    )
    .join("");

  return `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:0">
      <div style="background:#1B2D78;padding:28px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px">urRoute</h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px">Account update notice</p>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
        <h2 style="color:#111;margin:0 0 8px;font-size:20px">Hi ${fullName},</h2>
        <p style="color:#555;margin:0 0 16px;font-size:15px;line-height:1.6">
          Our support team updated the following details on your urRoute account while resolving ticket <strong>${ticketNo}</strong>:
        </p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;margin-bottom:16px;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;">FIELD</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;">OLD VALUE</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;">NEW VALUE</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="color:#555;margin:0;font-size:14px;line-height:1.6">
          <strong>Resolution:</strong> ${resolutionComments}
        </p>
        <p style="color:#aaa;font-size:12px;margin:24px 0 0">
          If this doesn't look right, reply to ticket ${ticketNo} or contact support.
        </p>
      </div>
    </div>`;
}
