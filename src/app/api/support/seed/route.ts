import { requireAdmin } from "@/lib/auth/session";
import { getVectorIndex } from "@/lib/vector";
import { KNOWLEDGE_BASE } from "@/lib/knowledge-base";
import { NextResponse } from "next/server";

export async function POST() {
  await requireAdmin();

  const index = getVectorIndex();

  // Upstash built-in embeddings — pass `data` (text), not a vector
  await index.upsert(
    KNOWLEDGE_BASE.map((entry) => ({
      id: entry.id,
      data: entry.data,
      metadata: entry.metadata,
    }))
  );

  return NextResponse.json({ seeded: KNOWLEDGE_BASE.length });
}
