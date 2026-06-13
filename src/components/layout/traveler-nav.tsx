"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bus, LayoutDashboard, Gift, Search, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NavUser } from "./nav-user";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Search },
  { href: "/bookings", label: "Bookings", icon: Bus },
  { href: "/rewards", label: "Rewards", icon: Gift },
];

interface TravelerNavProps {
  user: { fullName: string; email: string };
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

export function TravelerNav({ user }: TravelerNavProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r bg-background h-screen sticky top-0">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary">urRoute</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4 px-3">
          <NavLinks />
        </div>
        <div className="border-t p-3">
          <NavUser name={user.fullName} email={user.email} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
        <Link href="/" className="flex items-center gap-2">
          <Bus className="h-5 w-5 text-primary" />
          <span className="font-bold text-primary">urRoute</span>
        </Link>
        <div className="flex items-center gap-2">
          <NavUser name={user.fullName} email={user.email} />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-56 pt-10">
              <NavLinks />
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
