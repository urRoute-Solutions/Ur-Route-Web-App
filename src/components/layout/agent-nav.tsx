"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Headphones, LayoutDashboard, Ticket,
  Power, PowerOff, Menu, LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/agent/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agent/tickets",   label: "My Queue",  icon: Ticket },
];

interface AgentNavProps {
  name: string;
  email: string;
}

function useAgentPresence() {
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/support/agent/status")
      .then((r) => r.json())
      .then((j) => setOnline(j.data?.online ?? false))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!online) return;
    const interval = setInterval(() => {
      fetch("/api/support/agent/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "heartbeat" }),
      }).catch(() => {});
    }, 40_000);
    return () => clearInterval(interval);
  }, [online]);

  async function toggle() {
    setLoading(true);
    const next = !online;
    const res = await fetch("/api/support/agent/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ online: next }),
    });
    setLoading(false);
    if (res.ok) {
      setOnline(next);
      toast.success(next ? "You are now online — tickets will be assigned" : "You are offline");
    }
  }

  return { online, loading, toggle };
}

function AgentNavContent({
  name, email, online, loading, toggle,
}: {
  name: string; email: string;
  online: boolean; loading: boolean; toggle: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-4 border-b border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <Headphones className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-extrabold text-white text-[14px] tracking-tight leading-none">urRoute</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Support Agent</p>
        </div>
      </div>

      {/* Online toggle */}
      <div className="px-3 pt-4 shrink-0">
        <button
          onClick={toggle}
          disabled={loading}
          className={cn(
            "w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all",
            online
              ? "bg-green-600/20 text-green-400 border border-green-600/30"
              : "bg-slate-800 text-slate-400 border border-slate-700",
          )}
        >
          {online ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
          <span className="truncate">{online ? "Online — accepting" : "Offline"}</span>
          <span className={cn("ml-auto h-2 w-2 rounded-full shrink-0", online ? "bg-green-400 animate-pulse" : "bg-slate-600")} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-slate-800 p-3 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">
              {name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{name}</p>
            <p className="text-xs text-slate-400 truncate">{email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-800 hover:text-red-400 transition-colors shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export function AgentNav({ name, email }: AgentNavProps) {
  const { online, loading, toggle } = useAgentPresence();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col h-screen sticky top-0 bg-slate-900 border-r border-slate-800">
        <AgentNavContent name={name} email={email} online={online} loading={loading} toggle={toggle} />
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-50 flex h-14 items-center justify-between bg-slate-900 border-b border-slate-800 px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Headphones className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="font-extrabold text-white text-[13px] tracking-tight leading-none">urRoute</p>
            <p className="text-[9px] text-slate-400">Support Agent</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Online indicator pill */}
          <button
            onClick={toggle}
            disabled={loading}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
              online ? "bg-green-600/20 text-green-400" : "bg-slate-800 text-slate-400"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", online ? "bg-green-400 animate-pulse" : "bg-slate-600")} />
            {online ? "Online" : "Offline"}
          </button>
          <Sheet>
            <SheetTrigger asChild>
              <button className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-56 p-0 bg-slate-900 border-r border-slate-800">
              <AgentNavContent name={name} email={email} online={online} loading={loading} toggle={toggle} />
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
