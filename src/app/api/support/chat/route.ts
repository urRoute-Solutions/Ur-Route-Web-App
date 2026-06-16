import { getGroq } from "@/lib/groq";
import { getVectorIndex } from "@/lib/vector";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

type Message = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are urRoute's customer support assistant. urRoute is an Indian intercity bus booking platform that also offers operator-specific loyalty rewards.

Answer ONLY from the context provided below. Keep answers concise (2-4 sentences). If the answer is not in the context, say "I don't have that information right now — please create a support ticket and our team will help you within 24 hours."

Never make up information. Never mention that you are looking at a context or knowledge base. Respond in plain conversational English. Do not use bullet points or markdown.`;

export async function POST(req: NextRequest) {
  const { message, history = [] } = (await req.json()) as {
    message: string;
    history?: Message[];
  };

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    // 1. Retrieve relevant context from vector DB
    const index = getVectorIndex();
    const results = await index.query({
      data: message,
      topK: 4,
      includeMetadata: true,
      includeData: true,
    });

    const context = results
      .filter((r) => (r.score ?? 0) > 0.5)
      .map((r) => r.data)
      .join("\n\n");

    // 2. Build messages for Groq
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      {
        role: "system",
        content: context
          ? `${SYSTEM_PROMPT}\n\n--- Context ---\n${context}\n--- End Context ---`
          : SYSTEM_PROMPT,
      },
      ...history.slice(-6), // keep last 6 turns for context window
      { role: "user", content: message },
    ];

    // 3. Call Groq
    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 300,
      temperature: 0.3,
    });

    const reply = completion.choices[0]?.message?.content ?? "Sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (err) {
    logger.error("Support AI chat failed", { err });
    return NextResponse.json(
      { reply: "Our AI assistant isn't available right now — please create a support ticket and our team will help you within 24 hours." },
      { status: 200 },
    );
  }
}
