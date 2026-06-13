"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavUserProps {
  name: string;
  email: string;
  profileHref?: string;
  dark?: boolean;
}

export function NavUser({ name, email, profileHref = "/profile", dark = false }: NavUserProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors w-full text-left",
            dark
              ? "hover:bg-sidebar-hover text-sidebar-foreground"
              : "hover:bg-muted text-foreground"
          )}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback
              className={cn(
                "text-xs font-bold",
                dark ? "bg-sidebar-active text-white" : "bg-primary text-primary-foreground"
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block min-w-0">
            <p className={cn("text-sm font-medium leading-none truncate", dark ? "text-white" : "text-foreground")}>
              {name}
            </p>
            <p className={cn("text-xs truncate max-w-[140px] mt-0.5", dark ? "text-sidebar-foreground/60" : "text-muted-foreground")}>
              {email}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => router.push(profileHref)}>
          <User className="mr-2 h-4 w-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
