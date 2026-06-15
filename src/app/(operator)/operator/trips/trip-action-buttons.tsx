"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Navigation } from "lucide-react";

interface TripActionButtonsProps {
  tripId: string;
  operatorId: string;
  status: string;
}

export function TripActionButtons({ tripId, operatorId, status }: TripActionButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status !== "SCHEDULED" && status !== "DEPARTED") return null;

  const nextStatus = status === "SCHEDULED" ? "DEPARTED" : "COMPLETED";

  async function handleClick() {
    setLoading(true);
    try {
      await fetch(`/api/operators/${operatorId}/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (status === "SCHEDULED") {
    return (
      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleClick} disabled={loading}>
        <Navigation className="h-3.5 w-3.5" />
        {loading ? "Updating..." : "Mark Departed"}
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleClick} disabled={loading}>
      <CheckCircle className="h-3.5 w-3.5" />
      {loading ? "Updating..." : "Mark Completed"}
    </Button>
  );
}
