"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Building2, Phone, Mail, MapPin, Globe, Copy } from "lucide-react";

interface OperatorProfile {
  id: string;
  name: string;
  slug: string;
  urid: string;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  city: string | null;
  logoUrl: string | null;
  status: string;
  rating: number | null;
}

export default function OperatorProfilePage() {
  const [op, setOp] = useState<OperatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", contactEmail: "", contactPhone: "", address: "", city: "",
  });

  useEffect(() => {
    fetch("/api/operators/me")
      .then((r) => r.json())
      .then((json) => {
        const o = json.data?.operator ?? null;
        setOp(o);
        if (o) {
          setForm({
            name: o.name ?? "",
            description: o.description ?? "",
            contactEmail: o.contactEmail ?? "",
            contactPhone: o.contactPhone ?? "",
            address: o.address ?? "",
            city: o.city ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!op) return;
    setSaving(true);
    const res = await fetch(`/api/operators/${op.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name || undefined,
        description: form.description || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
      }),
    });
    setSaving(false);
    if (res.ok) toast.success("Profile updated");
    else toast.error("Failed to update profile");
  }

  if (loading) {
    return (
      <div className="p-6 max-w-lg space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-black">Operator Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your company details shown to travelers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Company Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Company name</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Sunrise Travels" required />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief description of your services" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Contact email</Label>
                <Input value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} type="email" placeholder="contact@company.com" />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Contact phone</Label>
                <Input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} type="tel" placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> City</Label>
                <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Chennai" />
              </div>
              <div className="space-y-1.5">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street address" />
              </div>
            </div>
            <Separator />
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {op && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Account Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize">{op.status.toLowerCase()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Slug</span>
              <span className="font-mono text-xs">{op.slug}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">URID</span>
              <span className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-semibold tracking-wide">{op.urid}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(op.urid);
                    toast.success("URID copied");
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Copy URID"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </span>
            </div>
            {op.rating != null && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rating</span>
                <span className="font-medium">{op.rating.toFixed(1)} / 5</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
