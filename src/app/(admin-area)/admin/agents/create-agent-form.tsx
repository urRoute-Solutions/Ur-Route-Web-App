"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export function CreateAgentForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSaving(false);
    if (res.ok) {
      toast.success(`Agent account created for ${json.data?.agent?.fullName}`);
      setForm({ fullName: "", email: "", password: "" });
      setOpen(false);
      router.refresh();
    } else {
      toast.error(json.error?.message ?? "Failed to create agent");
    }
  }

  if (!open) {
    return (
      <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" /> Add Agent
      </Button>
    );
  }

  return (
    <form onSubmit={handleCreate} className="rounded-xl border border-border bg-card p-4 space-y-3 w-full max-w-sm">
      <p className="text-sm font-semibold">New Support Agent</p>
      <div className="space-y-1.5">
        <Label>Full name</Label>
        <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Priya Kumar" required />
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" placeholder="priya@urroute.app" required />
      </div>
      <div className="space-y-1.5">
        <Label>Password</Label>
        <Input value={form.password} onChange={(e) => set("password", e.target.value)} type="password" placeholder="Min 8 characters" minLength={8} required />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>{saving ? "Creating…" : "Create"}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
