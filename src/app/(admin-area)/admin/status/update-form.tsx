"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props { incidentId: string; currentStatus: string }

export function UpdateIncidentForm({ incidentId, currentStatus }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState(currentStatus);
  const [restore, setRestore] = useState(false);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/admin/status/incidents/${incidentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, status, restoreServices: restore }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Incident updated");
      setBody(""); setOpen(false);
      router.refresh();
    } else {
      toast.error("Failed to update");
    }
  }

  if (!open) {
    return <Button size="sm" variant="outline" className="text-xs" onClick={() => setOpen(true)}>Add Update</Button>;
  }

  return (
    <form onSubmit={handleUpdate} className="mt-3 border-t border-border pt-3 space-y-3">
      <textarea
        rows={2}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Update message…"
        required
        className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="flex flex-wrap items-center gap-2">
        {(["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"] as const).map((s) => (
          <button key={s} type="button" onClick={() => setStatus(s)}
            className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all",
              status === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
            )}>
            {s}
          </button>
        ))}
        {status === "RESOLVED" && (
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2 cursor-pointer">
            <input type="checkbox" checked={restore} onChange={(e) => setRestore(e.target.checked)} className="rounded" />
            Restore services to Operational
          </label>
        )}
        <div className="flex gap-2 ml-auto">
          <Button type="submit" size="sm" disabled={!body.trim() || saving}>{saving ? "Saving…" : "Post Update"}</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </div>
    </form>
  );
}
