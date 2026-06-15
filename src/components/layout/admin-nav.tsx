"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, BarChart3, Bus, Menu,
  HeadphonesIcon, UserCheck, Activity,
} from "lucide-react";
import { NavUser } from "@/components/layout/nav-user";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AdminNavProps {
  user: { fullName: string; email: string };
}

const NAV = [
  { href: "/admin",           label: "Overview",    icon: LayoutDashboard },
  { href: "/admin/operators", label: "Operators",   icon: Building2 },
  { href: "/admin/analytics", label: "Analytics",   icon: BarChart3 },
  { href: "/admin/support",   label: "Support",     icon: HeadphonesIcon },
  { href: "/admin/agents",    label: "Agents",      icon: UserCheck },
  { href: "/admin/status",    label: "Status Page", icon: Activity },
];

function Logo() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-sidebar-active flex items-center justify-center shrink-0">
        <Bus className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="font-extrabold text-white text-[15px] tracking-tight leading-none">urRoute</p>
        <p className="text-[11px] text-sidebar-foreground/60 mt-0.5">Admin</p>
      </div>
    </Link>
  );
}

function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-sidebar-active text-white shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminNav({ user }: AdminNavProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col h-screen sticky top-0 bg-sidebar">
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Logo />
          <ThemeToggle dark />
        </div>

        <div className="flex-1 overflow-auto py-5 px-3">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Admin
          </p>
          <NavLinks />
        </div>

        <div className="border-t border-sidebar-border p-3">
          <NavUser name={user.fullName} email={user.email} profileHref="/admin" dark />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-50 flex h-14 items-center justify-between bg-sidebar border-b border-sidebar-border px-4">
        <Logo />
        <div className="flex items-center gap-1">
          <ThemeToggle dark />
          <NavUser name={user.fullName} email={user.email} dark />
          <Sheet>
            <SheetTrigger asChild>
              <button className="h-8 w-8 rounded-lg flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-hover hover:text-white transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0 bg-sidebar border-r-0">
              <div className="flex h-14 items-center px-4 border-b border-sidebar-border">
                <Logo />
              </div>
              <div className="px-3 py-5">
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                  Admin
                </p>
                <NavLinks />
              </div>
              <div className="border-t border-sidebar-border p-3 mt-auto">
                <NavUser name={user.fullName} email={user.email} dark />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
