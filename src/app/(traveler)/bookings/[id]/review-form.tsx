"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  async function submit() {
    if (rating === 0) { toast.error("Please select a star rating"); return; }
    setLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, rating, comment: comment.trim() || undefined }),
    });
    setLoading(false);
    if (res.ok) {
      setSubmitted(true);
      toast.success("Review submitted — thank you!");
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error(json?.error?.message ?? "Failed to submit review");
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-4 text-center text-sm font-semibold text-green-700 dark:text-green-300">
        Thanks for your review!
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <p className="font-semibold text-foreground">How was your trip?</p>

      {/* Star selector */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className="h-7 w-7 transition-colors"
              fill={(hovered || rating) >= star ? "#16A34A" : "none"}
              stroke={(hovered || rating) >= star ? "#16A34A" : "currentColor"}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm font-semibold text-muted-foreground">
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </span>
        )}
      </div>

      {/* Comment */}
      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share details about your experience (optional)..."
        className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
        maxLength={1000}
      />

      <Button
        onClick={submit}
        disabled={loading || rating === 0}
        variant="action"
        size="sm"
      >
        {loading ? "Submitting..." : "Submit review"}
      </Button>
    </div>
  );
}
