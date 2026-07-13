"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ActivateOperatorButton({ operatorId }: { operatorId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleActivate() {
    setSaving(true);
    const res = await fetch(`/api/operators/${operatorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ACTIVE" }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Operator activated");
      router.refresh();
    } else {
      const json = await res.json();
      toast.error(json.error?.message ?? "Failed to activate operator");
    }
  }

  return (
    <Button size="sm" variant="action" onClick={handleActivate} disabled={saving}>
      {saving ? "Activating…" : "Activate"}
    </Button>
  );
}
