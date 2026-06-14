"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
type Status = (typeof STATUSES)[number];

export function StatusUpdater({ ticketId, current }: { ticketId: string; current: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function update(status: Status) {
    if (status === current) return;
    setLoading(true);
    const res = await fetch(`/api/support/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success(`Ticket marked as ${status.replace("_", " ")}`);
      router.refresh();
    } else {
      toast.error("Failed to update status");
    }
  }

  return (
    <select
      value={current}
      disabled={loading}
      onChange={(e) => update(e.target.value as Status)}
      className="rounded-lg border border-input bg-background px-2 py-1 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
