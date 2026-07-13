"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#loyalty", label: "Loyalty" },
  { href: "/support/tickets", label: "Support" },
  { href: "/status", label: "Status" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

interface SiteHeaderProps {
  /**
   * When provided by a server component (e.g. public info pages), the header
   * renders the correct "Dashboard" button instantly with no client-side flash.
   * When omitted, falls back to a one-shot /api/auth/me fetch on mount.
   *  - undefined → fetch on mount (unknown auth state)
   *  - null      → user is not authenticated (show Sign in)
   *  - string    → user is authenticated (show Dashboard link)
   */
  dashboardHref?: string | null;
}

export function SiteHeader({ dashboardHref: initialHref }: SiteHeaderProps = {}) {
  const [scrolled, setScrolled] = useState(false);
  // undefined = not yet determined; null = not logged in; string = logged in
  const [dashboardHref, setDashboardHref] = useState<string | null | undefined>(initialHref);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Only run the client-side fetch when the server didn't pre-fill the auth state
  useEffect(() => {
    if (initialHref !== undefined) return; // server already told us
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((json) => {
        const user = json.data?.user;
        if (!user) { setDashboardHref(null); return; }
        if (user.role === "OPERATOR") setDashboardHref("/operator/dashboard");
        else if (user.role === "ADMIN") setDashboardHref("/admin");
        else if (user.role === "AGENT") setDashboardHref("/agent/dashboard");
        else setDashboardHref("/dashboard");
      })
      .catch(() => setDashboardHref(null));
  }, [initialHref]);

  const authButtons = dashboardHref ? (
    <Button variant="action" size="sm" className="hidden sm:inline-flex gap-1.5" asChild>
      <Link href={dashboardHref}>
        <LayoutDashboard className="h-3.5 w-3.5" />
        Dashboard
      </Link>
    </Button>
  ) : (
    <>
      <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
        <Link href="/login">Sign in</Link>
      </Button>
      <Button variant="action" size="sm" className="hidden sm:inline-flex" asChild>
        <Link href="/register">Get started</Link>
      </Button>
    </>
  );

  const mobileAuthButtons = dashboardHref ? (
    <Button variant="action" asChild>
      <Link href={dashboardHref}>
        <LayoutDashboard className="h-4 w-4" />
        Go to Dashboard
      </Link>
    </Button>
  ) : (
    <>
      <Button variant="ghost" asChild>
        <Link href="/login">Sign in</Link>
      </Button>
      <Button variant="action" asChild>
        <Link href="/register">Get started</Link>
      </Button>
    </>
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-white/80 backdrop-blur-xl dark:bg-card/80 shadow-sm"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Logo size="default" />
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {authButtons}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mb-8">
                <Logo size="default" />
              </div>
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6">
                {mobileAuthButtons}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
