import { prisma } from "@/lib/prisma";
import type { TicketCategory, TicketPriority, TicketStatus } from "@prisma/client";

export type CreateTicketInput = {
  userId: string;
  category: TicketCategory;
  subCategory?: string;
  priority: TicketPriority;
  subject: string;
  description: string;
  bookingRef?: string;
  operatorId?: string;
};

function ticketNumber(seq: number) {
  return `TKT-${String(seq).padStart(5, "0")}`;
}

export const supportTicketRepository = {
  async create(input: CreateTicketInput) {
    const ticket = await prisma.serviceTicket.create({
      data: {
        userId: input.userId,
        category: input.category,
        subCategory: input.subCategory,
        priority: input.priority,
        subject: input.subject,
        description: input.description,
        bookingRef: input.bookingRef || null,
        operatorId: input.operatorId || null,
        messages: {
          create: {
            senderRole: "USER",
            senderId: input.userId,
            body: input.description,
          },
        },
      },
    });
    return { ...ticket, ticketNumber: ticketNumber(ticket.ticketSeq) };
  },

  async listByUser(userId: string) {
    const rows = await prisma.serviceTicket.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { messages: true } } },
    });
    return rows.map((r) => ({ ...r, ticketNumber: ticketNumber(r.ticketSeq) }));
  },

  async listByOperator(operatorId: string) {
    const rows = await prisma.serviceTicket.findMany({
      where: { operatorId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { fullName: true, email: true } },
        _count: { select: { messages: true } },
      },
    });
    return rows.map((r) => ({ ...r, ticketNumber: ticketNumber(r.ticketSeq) }));
  },

  async listAll(filters: { status?: TicketStatus; category?: TicketCategory } = {}) {
    const rows = await prisma.serviceTicket.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.category ? { category: filters.category } : {}),
      },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      include: {
        user: { select: { fullName: true, email: true } },
        _count: { select: { messages: true } },
      },
    });
    return rows.map((r) => ({ ...r, ticketNumber: ticketNumber(r.ticketSeq) }));
  },

  async getById(id: string) {
    const ticket = await prisma.serviceTicket.findUnique({
      where: { id },
      include: {
        user: { select: { fullName: true, email: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!ticket) return null;
    return { ...ticket, ticketNumber: ticketNumber(ticket.ticketSeq) };
  },

  async addMessage(ticketId: string, senderId: string, senderRole: string, body: string) {
    return prisma.serviceTicketMessage.create({
      data: { ticketId, senderId, senderRole, body },
    });
  },

  async updateStatus(id: string, status: TicketStatus) {
    const ticket = await prisma.serviceTicket.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === "RESOLVED" ? new Date() : undefined,
      },
    });
    return { ...ticket, ticketNumber: ticketNumber(ticket.ticketSeq) };
  },
};
