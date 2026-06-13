"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bus, LayoutDashboard, Gift, Search, Menu, Ticket } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavUser } from "./nav-user";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search Buses", icon: Search },
  { href: "/bookings", label: "My Bookings", icon: Ticket },
  { href: "/rewards", label: "Rewards", icon: Gift },
];

interface TravelerNavProps {
  user: { fullName: string; email: string };
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
        <Bus className="h-4 w-4 text-white" />
      </div>
      <span className="font-extrabold text-primary text-[17px] tracking-tight">urRoute</span>
    </Link>
  );
}

function TopNavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden md:flex items-center gap-1">
      {NAV_ITEMS.map(({ href, label }) => {
        const active = href === "/dashboard"
          ? pathname === href
          : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "text-sm font-medium px-4 py-1.5 rounded-full transition-all",
              active
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 pt-2">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/dashboard"
          ? pathname === href
          : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
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

export function TravelerNav({ user }: TravelerNavProps) {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border shadow-sm h-16 flex items-center">
      <div className="container flex items-center justify-between gap-4">
        <Logo />

        {/* Desktop center nav */}
        <TopNavLinks />

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NavUser name={user.fullName} email={user.email} />

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-white dark:bg-card">
              <div className="flex h-16 items-center px-4 border-b border-border">
                <Logo />
              </div>
              <div className="px-3 py-5">
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Navigation
                </p>
                <MobileNavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
