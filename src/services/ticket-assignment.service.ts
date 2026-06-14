import { prisma } from "@/lib/prisma";
import { getOnlineAgentIds } from "@/lib/agent-presence";
import { getGroq } from "@/lib/groq";
import { getVectorIndex } from "@/lib/vector";

export async function autoAssignTicket(ticketId: string): Promise<void> {
  const agentIds = await getOnlineAgentIds();

  if (agentIds.length === 0) {
    await botRespond(ticketId);
    return;
  }

  // Pick least-loaded agent
  const loads = await Promise.all(
    agentIds.map(async (agentId) => ({
      agentId,
      count: await prisma.serviceTicket.count({
        where: { assignedAgentId: agentId, status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
    })),
  );
  loads.sort((a, b) => a.count - b.count);
  const { agentId } = loads[0]!;

  const agent = await prisma.user.findUnique({
    where: { id: agentId },
    select: { fullName: true },
  });

  await prisma.serviceTicket.update({
    where: { id: ticketId },
    data: { assignedAgentId: agentId, assignedAt: new Date(), isBotHandled: false, status: "IN_PROGRESS" },
  });

  await prisma.serviceTicketMessage.create({
    data: {
      ticketId,
      senderRole: "SYSTEM",
      body: `${agent?.fullName ?? "A support agent"} has joined your conversation.`,
    },
  });
}

async function botRespond(ticketId: string): Promise<void> {
  const ticket = await prisma.serviceTicket.findUnique({
    where: { id: ticketId },
    select: { description: true, messages: { orderBy: { createdAt: "asc" }, take: 1 } },
  });
  if (!ticket) return;

  const userMessage = ticket.messages[0]?.body ?? ticket.description;
  let botReply = "I'm here to help! A support agent will join your conversation shortly.";

  try {
    const index = getVectorIndex();
    const results = await index.query({ data: userMessage, topK: 3, includeData: true, includeMetadata: true });
    const context = results
      .filter((r) => (r.score ?? 0) > 0.4)
      .map((r) => r.data)
      .join("\n\n");

    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 200,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are urRoute customer support. Help the customer in 2-3 short, friendly sentences.${context ? `\n\nRelevant info:\n${context}` : ""}`,
        },
        { role: "user", content: userMessage },
      ],
    });
    botReply = completion.choices[0]?.message?.content?.trim() ?? botReply;
  } catch {
    // Fallback to default reply
  }

  await prisma.serviceTicketMessage.create({
    data: { ticketId, senderRole: "BOT", body: botReply },
  });
}
