"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Headphones, LayoutDashboard, Ticket, PowerOff, Power } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const NAV_ITEMS = [
  { href: "/agent/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agent/tickets", label: "My Queue", icon: Ticket },
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

  // Heartbeat every 40 seconds while online
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
      toast.success(next ? "You are now online — tickets will be assigned to you" : "You are offline");
    }
  }

  return { online, loading, toggle };
}

export function AgentNav({ name, email }: AgentNavProps) {
  const pathname = usePathname();
  const { online, loading, toggle } = useAgentPresence();

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col h-screen sticky top-0 bg-slate-900 border-r border-slate-800">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-4 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <Headphones className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-extrabold text-white text-[14px] tracking-tight leading-none">urRoute</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Support Agent</p>
        </div>
      </div>

      {/* Online toggle */}
      <div className="px-3 pt-4">
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
          <span>{online ? "Online — accepting tickets" : "Offline"}</span>
          <span className={cn("ml-auto h-2 w-2 rounded-full", online ? "bg-green-400 animate-pulse" : "bg-slate-600")} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
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

      {/* User info */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">
              {name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{name}</p>
            <p className="text-xs text-slate-400 truncate">{email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
