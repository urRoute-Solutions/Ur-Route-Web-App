"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Building2, BarChart3, Bus } from "lucide-react";
import { NavUser } from "@/components/layout/nav-user";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/operators", label: "Operators", icon: Building2 },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r bg-background h-screen sticky top-0">
        <div className="flex h-14 items-center border-b px-4 gap-2">
          <Bus className="h-5 w-5 text-primary" />
          <span className="font-bold text-primary">urRoute Admin</span>
        </div>
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3">
          <NavUser name="Admin" email="admin@urroute.in" />
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
