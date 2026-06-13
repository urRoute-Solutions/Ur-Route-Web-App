"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bus, LayoutDashboard, MapPin, CalendarDays, BookOpen, Gift, BarChart3, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NavUser } from "./nav-user";

const NAV_ITEMS = [
  { href: "/operator/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/operator/routes", label: "Routes", icon: MapPin },
  { href: "/operator/trips", label: "Trips", icon: CalendarDays },
  { href: "/operator/bookings", label: "Bookings", icon: BookOpen },
  { href: "/operator/offers", label: "Loyalty Offers", icon: Gift },
  { href: "/operator/analytics", label: "Analytics", icon: BarChart3 },
];

interface OperatorNavProps {
  user: { fullName: string; email: string };
  operatorName?: string;
}

function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith(href)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function OperatorNav({ user, operatorName }: OperatorNavProps) {
  return (
    <>
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-background h-screen sticky top-0">
        <div className="flex h-14 items-center border-b px-4 gap-2">
          <Bus className="h-5 w-5 text-primary" />
          <div>
            <p className="font-bold text-primary text-sm leading-none">urRoute</p>
            {operatorName && <p className="text-xs text-muted-foreground truncate max-w-[160px]">{operatorName}</p>}
          </div>
        </div>
        <div className="flex-1 overflow-auto py-4 px-3">
          <NavLinks />
        </div>
        <div className="border-t p-3">
          <NavUser name={user.fullName} email={user.email} profileHref="/operator/profile" />
        </div>
      </aside>

      <header className="md:hidden sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <Bus className="h-5 w-5 text-primary" />
          <span className="font-bold text-primary text-sm">{operatorName ?? "urRoute Operator"}</span>
        </div>
        <div className="flex items-center gap-2">
          <NavUser name={user.fullName} email={user.email} />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 pt-10">
              <NavLinks />
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
