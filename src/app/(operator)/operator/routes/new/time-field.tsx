"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "AM" | "PM";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function to24Hour(h12: number, period: Period): number {
  if (period === "AM") return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
}

function to12Hour(h24: number): { h12: number; period: Period } {
  const period: Period = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { h12, period };
}

export function TimeField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string; // "HH:mm" 24h, or ""
  onChange: (v: string) => void;
  error?: string;
}) {
  const [hh, mm] = value ? value.split(":") : ["", ""];
  const initial = hh ? to12Hour(parseInt(hh, 10)) : { h12: NaN, period: "AM" as Period };

  const [hourDraft, setHourDraft] = useState(Number.isNaN(initial.h12) ? "" : pad(initial.h12));
  const [minuteDraft, setMinuteDraft] = useState(mm ?? "");
  const [period, setPeriod] = useState<Period>(initial.period);

  function commit(h: string, m: string, p: Period) {
    const hn = h === "" ? NaN : Math.min(12, Math.max(1, parseInt(h, 10)));
    const mn = m === "" ? NaN : Math.min(59, Math.max(0, parseInt(m, 10)));
    if (Number.isNaN(hn) || Number.isNaN(mn)) {
      onChange("");
      return;
    }
    setHourDraft(pad(hn));
    setMinuteDraft(pad(mn));
    onChange(`${pad(to24Hour(hn, p))}:${pad(mn)}`);
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 shadow-sm focus-within:ring-1 focus-within:ring-ring",
          error && "border-destructive",
        )}
      >
        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <input
          value={hourDraft}
          onChange={(e) => setHourDraft(e.target.value.replace(/\D/g, "").slice(0, 2))}
          onBlur={() => commit(hourDraft, minuteDraft, period)}
          placeholder="HH"
          inputMode="numeric"
          className="w-7 bg-transparent text-center text-sm outline-none placeholder:text-muted-foreground"
        />
        <span className="text-muted-foreground">:</span>
        <input
          value={minuteDraft}
          onChange={(e) => setMinuteDraft(e.target.value.replace(/\D/g, "").slice(0, 2))}
          onBlur={() => commit(hourDraft, minuteDraft, period)}
          placeholder="MM"
          inputMode="numeric"
          className="w-7 bg-transparent text-center text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="ml-auto flex items-center rounded-md border border-input overflow-hidden shrink-0">
          {(["AM", "PM"] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setPeriod(p); commit(hourDraft, minuteDraft, p); }}
              className={cn(
                "px-2 py-1 text-xs font-semibold transition-colors",
                period === p ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
