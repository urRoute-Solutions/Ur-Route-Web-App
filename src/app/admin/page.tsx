import { requireAdmin } from "@/lib/auth/session";
import { operatorRepository } from "@/repositories/operator.repository";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminPage() {
  await requireAdmin();
  const [pending] = await operatorRepository.list({ status: "PENDING", page: 1, pageSize: 20 });
  const [active] = await operatorRepository.list({ status: "ACTIVE", page: 1, pageSize: 1 });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>

        <div className="grid grid-cols-2 gap-4">
          <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{pending.length}</p><p className="text-sm text-slate-500">Pending approvals</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{active.length}+</p><p className="text-sm text-slate-500">Active operators</p></CardContent></Card>
        </div>

        {pending.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Pending Operator Approvals</h2>
            <div className="space-y-3">
              {pending.map((op) => (
                <Card key={op.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-semibold">{op.name}</p>
                      <p className="text-sm text-slate-500">{op.contactEmail} · {op.city}</p>
                    </div>
                    <div className="flex gap-2">
                      <form action={`/api/operators/${op.id}/approve`} method="POST">
                        <input type="hidden" name="action" value="approve" />
                        <Button size="sm" type="submit">Approve</Button>
                      </form>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <nav className="flex gap-3">
          <Link href="/admin/operators"><Button variant="outline">All Operators</Button></Link>
          <Link href="/admin/analytics"><Button variant="outline">Analytics</Button></Link>
        </nav>
      </div>
    </div>
  );
}
