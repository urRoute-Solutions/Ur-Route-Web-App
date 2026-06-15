"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  fallback: string;
  label?: string;
  className?: string;
  variant?: "default" | "ghost" | "sidebar";
}

export function BackButton({
  fallback,
  label = "Back",
  className,
  variant = "default",
}: BackButtonProps) {
  const router = useRouter();

  function handleBack() {
    // If there is a browsing session history entry, go back (preserves scroll + state).
    // Otherwise navigate to the explicit fallback route.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }

  if (variant === "sidebar") {
    return (
      <button
        onClick={handleBack}
        className={cn(
          "flex items-center gap-2 text-sm font-medium text-sidebar-foreground hover:text-white transition-colors",
          className,
        )}
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        {label}
      </button>
    );
  }

  if (variant === "ghost") {
    return (
      <button
        onClick={handleBack}
        className={cn(
          "flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
          className,
        )}
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={handleBack}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-colors",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}
