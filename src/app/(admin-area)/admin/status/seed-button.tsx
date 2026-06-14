"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Database } from "lucide-react";

export function SeedStatusButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function seed() {
    setLoading(true);
    const res = await fetch("/api/admin/status/seed", { method: "POST" });
    const json = await res.json();
    setLoading(false);
    if (res.ok) {
      toast.success(`Seeded ${json.seeded ?? json.data?.seeded} services with 90-day history`);
      router.refresh();
    } else {
      toast.error("Seed failed: " + (json.error ?? "Unknown error"));
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={seed} disabled={loading} className="gap-2">
      <Database className="h-4 w-4" />
      {loading ? "Seeding…" : "Seed / Reset Services"}
    </Button>
  );
}
