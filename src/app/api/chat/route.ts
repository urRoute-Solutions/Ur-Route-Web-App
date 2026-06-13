import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are urRoute's helpful customer support assistant. urRoute is a bus booking platform in India with a loyalty rewards system.

Key info:
- Users can search buses by origin, destination and date
- We have 50+ verified operators across India
- Loyalty levels: L1 Welcome (1-4 trips, 11% off), L2 Stay (4-8 trips, 10% off + group bonus), L3 Loyalty (8-12 trips, ₹150 reward), L4 Champion (12+ trips, 15% off + priority)
- Progress never resets - it freezes and resumes
- Payments via Razorpay, instant confirmation
- For cancellations: contact support@urroute.in
- For booking issues: provide PNR number

Be helpful, concise, and friendly. If you don't know something specific, say so and direct them to support@urroute.in.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response("Chat unavailable", { status: 503 });
  }

  let messages: ChatMessage[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Invalid request", { status: 400 });
    }
  } catch {
    return new Response("Invalid request", { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: "claude-haiku-4-5",
          max_tokens: 500,
          system: SYSTEM_PROMPT,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch {
        controller.error(new Error("Chat stream failed"));
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
