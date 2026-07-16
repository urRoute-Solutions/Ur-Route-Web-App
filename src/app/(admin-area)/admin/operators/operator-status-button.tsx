"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { OperatorStatus } from "@prisma/client";

export function OperatorStatusButton({
  operatorId,
  operatorName,
  status,
}: {
  operatorId: string;
  operatorName: string;
  status: OperatorStatus;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function setStatus(next: OperatorStatus) {
    setSaving(true);
    const res = await fetch(`/api/operators/${operatorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(
        next === "ACTIVE" ? "Operator activated" : "Operator suspended",
      );
      router.refresh();
    } else {
      const json = await res.json();
      toast.error(json.error?.message ?? "Failed to update operator status");
    }
  }

  if (status === "PENDING") {
    return (
      <Button size="sm" variant="action" onClick={() => setStatus("ACTIVE")} disabled={saving}>
        {saving ? "Activating…" : "Activate"}
      </Button>
    );
  }

  if (status === "ACTIVE") {
    return (
      <Button
        size="sm"
        variant="destructive"
        disabled={saving}
        onClick={() => {
          if (!confirm(`Suspend ${operatorName}? Their routes and trips will stay visible, but they won't be able to publish new ones until reactivated.`)) return;
          setStatus("SUSPENDED");
        }}
      >
        {saving ? "Suspending…" : "Suspend"}
      </Button>
    );
  }

  // SUSPENDED
  return (
    <Button size="sm" variant="action" onClick={() => setStatus("ACTIVE")} disabled={saving}>
      {saving ? "Reactivating…" : "Reactivate"}
    </Button>
  );
}
