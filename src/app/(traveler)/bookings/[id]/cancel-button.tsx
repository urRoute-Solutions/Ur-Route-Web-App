"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
    setLoading(false);
    if (res.ok) {
      toast.success("Booking cancelled. Seats have been released.");
      setOpen(false);
      router.refresh();
    } else {
      const json = await res.json();
      toast.error(json.error?.message ?? "Cancellation failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/5">
          Cancel booking
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this booking?</DialogTitle>
          <DialogDescription>
            Your seats will be released and a refund (if applicable) will be processed within 5-7 business days.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Keep booking</Button>
          <Button variant="destructive" onClick={handleCancel} disabled={loading}>
            {loading ? "Cancelling…" : "Yes, cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
