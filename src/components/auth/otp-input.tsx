"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
}

/** Controlled N-box numeric OTP input with paste + arrow/backspace nav. */
export function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, char: string) {
    if (!/^\d*$/.test(char)) return;
    const arr = value.split("").slice(0, length);
    while (arr.length < length) arr.push("");
    arr[index] = char.slice(-1);
    onChange(arr.join(""));
    if (char && index < length - 1) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    onChange(pasted.padEnd(length, ""));
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            "w-11 h-12 rounded-lg border-2 text-center text-lg font-bold outline-none transition-all",
            "border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20",
            value[i] ? "border-primary/60" : "",
          )}
        />
      ))}
    </div>
  );
}
