"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Database } from "lucide-react";

export function SeedKnowledgeBase() {
  const [loading, setLoading] = useState(false);

  async function seed() {
    setLoading(true);
    const res = await fetch("/api/support/seed", { method: "POST" });
    setLoading(false);
    if (res.ok) {
      const { seeded } = await res.json();
      toast.success(`Knowledge base seeded — ${seeded} entries uploaded`);
    } else {
      toast.error("Seed failed. Check console.");
    }
  }

  return (
    <button
      onClick={seed}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted disabled:opacity-50"
    >
      <Database className="h-4 w-4" />
      {loading ? "Seeding..." : "Seed AI knowledge base"}
    </button>
  );
}
