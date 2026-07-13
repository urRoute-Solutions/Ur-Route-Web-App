"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

let placesCache: string[] | null = null;
let placesPromise: Promise<string[]> | null = null;

function loadPlaces(): Promise<string[]> {
  if (placesCache) return Promise.resolve(placesCache);
  if (!placesPromise) {
    placesPromise = fetch("/api/places")
      .then((r) => r.json())
      .then((json) => {
        const origins: string[] = json.data?.origins ?? [];
        const destinations: string[] = json.data?.destinations ?? [];
        placesCache = [...new Set([...origins, ...destinations])].sort();
        return placesCache;
      })
      .catch(() => []);
  }
  return placesPromise;
}

export function CityAutocomplete({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const [places, setPlaces] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPlaces().then(setPlaces);
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const suggestions = useMemo(() => {
    if (!value.trim()) return places.slice(0, 8);
    const q = value.toLowerCase();
    return places.filter((p) => p.toLowerCase().includes(q)).slice(0, 8);
  }, [value, places]);

  return (
    <div ref={ref} className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={cn("pl-8", error && "border-destructive focus-visible:ring-destructive")}
          autoComplete="off"
          required
        />
        {open && suggestions.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white dark:bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
            {suggestions.map((place) => (
              <button
                key={place}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(place); setOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-muted transition-colors",
                  value === place && "bg-primary/5 text-primary font-semibold",
                )}
              >
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {place}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
