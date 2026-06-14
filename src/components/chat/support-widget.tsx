"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, ChevronLeft, CheckCircle, Ticket, RotateCcw, Gift, CreditCard, AlertTriangle, HelpCircle } from "lucide-react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

/* ── Menu tree ─────────────────────────────────────────────────────────────── */

type FormConfig = {
  category: string;
  subCategory: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  subject: string;
  askBookingRef: boolean;
};

type MenuNode = {
  text: string;
  options: Array<{
    label: string;
    to: string | FormConfig; // string = sub-menu key, FormConfig = show form
  }>;
};

const MENU: Record<string, MenuNode> = {
  main: {
    text: "Welcome to urRoute Support. What do you need help with?",
    options: [
      { label: "My Booking", to: "booking" },
      { label: "Cancellation / Refund", to: "refund" },
      { label: "Loyalty Rewards", to: "loyalty" },
      { label: "Payment Issue", to: "payment" },
      { label: "Operator Complaint", to: "complaint" },
      { label: "Something else", to: { category: "OTHER", subCategory: "General query", priority: "LOW", subject: "General query", askBookingRef: false } },
    ],
  },
  booking: {
    text: "What is the issue with your booking?",
    options: [
      { label: "Booking not confirmed", to: { category: "BOOKING", subCategory: "Booking not confirmed", priority: "HIGH", subject: "Booking not confirmed", askBookingRef: true } },
      { label: "Wrong seat / coach", to: { category: "BOOKING", subCategory: "Wrong seat or coach", priority: "MEDIUM", subject: "Wrong seat or coach assigned", askBookingRef: true } },
      { label: "Bus delayed or cancelled", to: { category: "BOOKING", subCategory: "Bus delayed or cancelled", priority: "HIGH", subject: "Bus delayed or cancelled", askBookingRef: true } },
      { label: "Need to change booking", to: { category: "BOOKING", subCategory: "Change booking request", priority: "MEDIUM", subject: "Request to change booking", askBookingRef: true } },
    ],
  },
  refund: {
    text: "What's your cancellation or refund issue?",
    options: [
      { label: "Request cancellation", to: { category: "CANCELLATION_REFUND", subCategory: "Cancellation request", priority: "MEDIUM", subject: "Cancellation request", askBookingRef: true } },
      { label: "Refund status check", to: { category: "CANCELLATION_REFUND", subCategory: "Refund status", priority: "LOW", subject: "Refund status check", askBookingRef: true } },
      { label: "Refund not received", to: { category: "CANCELLATION_REFUND", subCategory: "Refund not received", priority: "HIGH", subject: "Refund not received", askBookingRef: true } },
    ],
  },
  loyalty: {
    text: "What's your loyalty or rewards issue?",
    options: [
      { label: "Points not credited", to: { category: "LOYALTY_REWARDS", subCategory: "Points not credited", priority: "MEDIUM", subject: "Loyalty points not credited", askBookingRef: true } },
      { label: "Tier not upgraded", to: { category: "LOYALTY_REWARDS", subCategory: "Tier not upgraded", priority: "MEDIUM", subject: "Loyalty tier not upgraded", askBookingRef: false } },
      { label: "Reward not applied to booking", to: { category: "LOYALTY_REWARDS", subCategory: "Reward not applied", priority: "HIGH", subject: "Reward discount not applied", askBookingRef: true } },
    ],
  },
  payment: {
    text: "What's your payment issue?",
    options: [
      { label: "Charged but no booking", to: { category: "PAYMENT", subCategory: "Payment deducted, booking not created", priority: "URGENT", subject: "Amount deducted but booking not created", askBookingRef: false } },
      { label: "Duplicate charge", to: { category: "PAYMENT", subCategory: "Duplicate charge", priority: "URGENT", subject: "Duplicate payment charged", askBookingRef: false } },
      { label: "Payment failed / stuck", to: { category: "PAYMENT", subCategory: "Payment failed", priority: "MEDIUM", subject: "Payment failed or stuck", askBookingRef: false } },
    ],
  },
  complaint: {
    text: "What's your complaint about the operator?",
    options: [
      { label: "Driver behaviour", to: { category: "OPERATOR_COMPLAINT", subCategory: "Driver behaviour", priority: "HIGH", subject: "Complaint — driver behaviour", askBookingRef: true } },
      { label: "Bus condition / cleanliness", to: { category: "OPERATOR_COMPLAINT", subCategory: "Bus condition", priority: "MEDIUM", subject: "Complaint — bus condition", askBookingRef: true } },
      { label: "Safety concern", to: { category: "OPERATOR_COMPLAINT", subCategory: "Safety concern", priority: "URGENT", subject: "Safety concern raised", askBookingRef: true } },
      { label: "Timing / schedule issue", to: { category: "OPERATOR_COMPLAINT", subCategory: "Timing issue", priority: "MEDIUM", subject: "Complaint — timing or schedule", askBookingRef: true } },
    ],
  },
};

/* ── Message types ─────────────────────────────────────────────────────────── */

type Msg =
  | { from: "bot"; text: string; options?: Array<{ label: string; id: string }>; isMenu?: boolean }
  | { from: "user"; text: string };

/* ── Widget phases ─────────────────────────────────────────────────────────── */

type Phase =
  | { name: "menu"; step: string; history: string[] }
  | { name: "describe"; config: FormConfig; description: string }
  | { name: "booking-ref"; config: FormConfig; description: string; bookingRef: string }
  | { name: "submitting" }
  | { name: "success"; ticketNumber: string };

const CATEGORY_ICON: Record<string, React.ElementType> = {
  booking: Ticket,
  refund: RotateCcw,
  loyalty: Gift,
  payment: CreditCard,
  complaint: AlertTriangle,
  other: HelpCircle,
};

/* ── Component ─────────────────────────────────────────────────────────────── */

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [phase, setPhase] = useState<Phase>({ name: "menu", step: "main", history: [] });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Push the initial greeting when first opened
  useEffect(() => {
    if (open && messages.length === 0) {
      pushMenu("main");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function pushMenu(step: string) {
    const node = MENU[step];
    if (!node) return;
    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text: node.text,
        isMenu: true,
        options: node.options.map((o, i) => ({ label: o.label, id: String(i) })),
      },
    ]);
  }

  function pushBot(text: string) {
    setMessages((prev) => [...prev, { from: "bot", text }]);
  }

  function pushUser(text: string) {
    setMessages((prev) => [...prev, { from: "user", text }]);
  }

  function handleOptionClick(optionIndex: number) {
    if (phase.name !== "menu") return;
    const node = MENU[phase.step];
    const option = node?.options[optionIndex];
    if (!option) return;

    pushUser(option.label);

    if (typeof option.to === "string") {
      // Navigate to sub-menu
      const nextStep = option.to;
      setPhase({ name: "menu", step: nextStep, history: [...phase.history, phase.step] });
      setTimeout(() => pushMenu(nextStep), 300);
    } else {
      // Enter form phase
      const config = option.to as FormConfig;
      setPhase({ name: "describe", config, description: "" });
      setTimeout(() => {
        pushBot(`Got it — "${config.subCategory}". Please describe your issue in a few lines:`);
      }, 300);
    }
  }

  function handleBack() {
    if (phase.name !== "menu") return;
    const history = [...phase.history];
    const prev = history.pop() ?? "main";
    setPhase({ name: "menu", step: prev, history });
    setTimeout(() => pushMenu(prev), 200);
  }

  async function handleSubmitDescription() {
    if (phase.name !== "describe" || !input.trim()) return;
    const description = input.trim();
    setInput("");
    pushUser(description);

    if (phase.config.askBookingRef) {
      setPhase({ name: "booking-ref", config: phase.config, description, bookingRef: "" });
      setTimeout(() => {
        pushBot('Do you have a booking reference (PNR)? Type it below or type "skip".');
      }, 300);
    } else {
      await submitTicket(phase.config, description, "");
    }
  }

  async function handleSubmitBookingRef() {
    if (phase.name !== "booking-ref" || !input.trim()) return;
    const ref = input.trim().toLowerCase() === "skip" ? "" : input.trim();
    setInput("");
    pushUser(input.trim());
    await submitTicket(phase.config, phase.description, ref);
  }

  async function submitTicket(config: FormConfig, description: string, bookingRef: string) {
    setPhase({ name: "submitting" });
    pushBot("Creating your ticket...");

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: config.category,
          subCategory: config.subCategory,
          priority: config.priority,
          subject: config.subject,
          description,
          bookingRef: bookingRef || undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setPhase({ name: "menu", step: "main", history: [] });
          pushBot("Please sign in to create a support ticket.");
          return;
        }
        throw new Error(json?.error?.message ?? "Failed");
      }

      const { ticket } = await res.json();
      setPhase({ name: "success", ticketNumber: ticket.ticketNumber });
      setMessages((prev) => [
        ...prev.filter((m) => !(m.from === "bot" && m.text === "Creating your ticket...")),
        {
          from: "bot",
          text: `Your ticket ${ticket.ticketNumber} has been created. Our team will respond within 24 hours.`,
          options: [{ label: "View my tickets", id: "view" }],
        },
      ]);
    } catch {
      setPhase({ name: "menu", step: "main", history: [] });
      pushBot("Something went wrong. Please try again or email support@urroute.in");
    }
  }

  function handleEnter(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (phase.name === "describe") handleSubmitDescription();
      else if (phase.name === "booking-ref") handleSubmitBookingRef();
    }
  }

  function getInputPlaceholder() {
    if (phase.name === "describe") return "Describe your issue...";
    if (phase.name === "booking-ref") return "Enter PNR or type skip...";
    return "";
  }

  const showInput = phase.name === "describe" || phase.name === "booking-ref";
  const showBackBtn =
    phase.name === "menu" && phase.history.length > 0;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Panel */}
      {open && (
        <div className="mb-3 flex h-[520px] w-[calc(100vw-3rem)] max-w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:w-[360px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-3">
              <LogoMark size={28} />
              <div>
                <p className="text-sm font-bold leading-tight">urRoute Support</p>
                <p className="text-xs text-primary-foreground/60">We reply within 24 hours</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-white/15"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-muted/30">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-2", msg.from === "user" ? "justify-end" : "justify-start")}>
                {msg.from === "bot" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm">
                    <LogoMark size={20} />
                  </div>
                )}
                <div className={cn("flex max-w-[82%] flex-col gap-2")}>
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.from === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-white text-foreground shadow-sm dark:bg-card"
                    )}
                  >
                    {msg.text}
                  </div>

                  {/* Menu buttons */}
                  {msg.from === "bot" && msg.options && (
                    <div className="flex flex-col gap-1.5">
                      {msg.options.map((opt, j) => {
                        const isLast = i === messages.length - 1;
                        if (opt.id === "view") {
                          return (
                            <Link
                              key={j}
                              href="/support/tickets"
                              className="rounded-xl border border-primary/20 bg-white px-3.5 py-2 text-left text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-primary hover:text-white dark:bg-card"
                            >
                              View my tickets
                            </Link>
                          );
                        }
                        return (
                          <button
                            key={j}
                            disabled={!isLast || phase.name !== "menu"}
                            onClick={() => handleOptionClick(j)}
                            className={cn(
                              "rounded-xl border px-3.5 py-2 text-left text-sm font-medium transition-colors",
                              isLast && phase.name === "menu"
                                ? "border-primary/20 bg-white text-foreground shadow-sm hover:border-primary hover:bg-primary hover:text-white dark:bg-card"
                                : "cursor-default border-border bg-muted/50 text-muted-foreground"
                            )}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {phase.name === "submitting" && (
              <div className="flex justify-start gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                  <LogoMark size={20} />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-3.5 py-3 shadow-sm dark:bg-card">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {phase.name === "success" && (
              <div className="mx-auto mt-2 flex flex-col items-center gap-2 rounded-xl border border-action/20 bg-action/5 p-4 text-center">
                <CheckCircle className="h-8 w-8 text-action" />
                <p className="text-xs font-semibold text-action">{phase.ticketNumber} created</p>
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border bg-white dark:bg-card">
            {showBackBtn && (
              <button
                onClick={handleBack}
                className="flex w-full items-center gap-1.5 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}

            {showInput && (
              <div className="flex items-end gap-2 p-3">
                <textarea
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleEnter}
                  placeholder={getInputPlaceholder()}
                  className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  onClick={phase.name === "describe" ? handleSubmitDescription : handleSubmitBookingRef}
                  disabled={!input.trim()}
                  className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-action text-white transition-colors hover:bg-action/90 disabled:opacity-40"
                  aria-label="Send"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            )}

            {!showInput && phase.name !== "submitting" && (
              <div className="flex items-center justify-center py-2">
                <p className="text-[11px] text-muted-foreground">
                  {phase.name === "success" ? "Ticket created successfully" : "Select an option above"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-105 active:scale-95"
          aria-label="Open support"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-primary bg-action" />
        </button>
      )}
    </div>
  );
}
