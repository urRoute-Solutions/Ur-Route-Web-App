"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const CATEGORIES = [
  { value: "BOOKING", label: "Booking" },
  { value: "CANCELLATION_REFUND", label: "Cancellation / Refund" },
  { value: "LOYALTY_REWARDS", label: "Loyalty Rewards" },
  { value: "PAYMENT", label: "Payment" },
  { value: "OPERATOR_COMPLAINT", label: "Operator Complaint" },
  { value: "OTHER", label: "Other" },
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export function RaiseTicketDialog({ urid }: { urid: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category: "BOOKING",
    priority: "MEDIUM",
    subject: "",
    description: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSaving(false);
    if (res.ok) {
      toast.success(`Ticket ${json.data.ticket.ticketNumber} raised — our team will get back to you`);
      setOpen(false);
      setForm({ category: "BOOKING", priority: "MEDIUM", subject: "", description: "" });
      router.refresh();
    } else {
      toast.error(json.error?.message ?? "Failed to raise ticket");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="action" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Raise a Support Ticket
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raise a Support Ticket</DialogTitle>
          <DialogDescription>
            {urid ? (
              <>Your account (URID <span className="font-mono font-semibold">{urid}</span>) will be
              attached automatically, so support can locate your profile immediately.</>
            ) : (
              "We'll link this ticket to your account automatically."
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              placeholder="Brief summary of the issue"
              required
              minLength={3}
              maxLength={200}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the issue in detail (min. 10 characters)"
              required
              minLength={10}
              maxLength={2000}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Submitting…" : "Submit Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
