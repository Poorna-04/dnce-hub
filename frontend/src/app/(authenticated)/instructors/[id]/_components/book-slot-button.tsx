"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { apiClient } from "@/lib/api/client";
import type { AvailabilitySlot } from "@/types/instructor";
import { DAY_NAMES } from "@/types/instructor";

interface Props {
  slot: AvailabilitySlot;
  instructorId: number;
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Returns the minimum allowed booking date: today or the slot's one-time date */
function minDate(slot: AvailabilitySlot): string {
  if (slot.slotType === "ONE_TIME" && slot.slotDate) return slot.slotDate;
  return new Date().toISOString().split("T")[0];
}

/** For ONE_TIME slots the date is fixed; for RECURRING the user picks a date */
export function BookSlotButton({ slot, instructorId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState(
    slot.slotType === "ONE_TIME" && slot.slotDate ? slot.slotDate : ""
  );
  const [loading, setLoading] = useState(false);

  const slotLabel =
    slot.slotType === "ONE_TIME" && slot.slotDate
      ? new Date(slot.slotDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : DAY_NAMES[slot.dayOfWeek!];

  async function handleBook() {
    if (!bookingDate) {
      toast.error("Please select a booking date.");
      return;
    }

    // For RECURRING slots: validate the picked date matches the day of week
    if (slot.slotType === "RECURRING" && slot.dayOfWeek != null) {
      // JS getDay(): 0=Sun, 1=Mon … 6=Sat | backend dayOfWeek: 1=Mon … 7=Sun
      const jsDay = new Date(bookingDate).getUTCDay();
      const mapped = jsDay === 0 ? 7 : jsDay; // convert JS 0=Sun → 7
      if (mapped !== slot.dayOfWeek) {
        const dayName = DAY_NAMES[slot.dayOfWeek];
        toast.error(`This slot is only available on ${dayName}. Please pick a ${dayName}.`);
        return;
      }
    }

    setLoading(true);
    try {
      await apiClient.post("/bookings", { slotId: slot.id, bookingDate });
      toast.success("Booking created! Head to My Bookings to track it.");
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="text-xs border-violet-500/40 text-violet-300 hover:bg-violet-500/10 hover:text-violet-200"
      >
        Book
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Book this slot"
      >
        {/* Slot summary */}
        <div className="rounded-lg bg-white/[0.04] border border-white/5 px-4 py-3 mb-5 space-y-1">
          <p className="text-white font-medium text-sm">{slotLabel}</p>
          <p className="text-white/50 text-xs">
            {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
          </p>
        </div>

        {/* Date picker */}
        {slot.slotType === "ONE_TIME" ? (
          <p className="text-white/50 text-sm mb-5">
            This is a one-time slot on <span className="text-white">{slotLabel}</span>.
          </p>
        ) : (
          <div className="space-y-1.5 mb-5">
            <Label className="text-white/70 text-sm">
              Booking date
              <span className="text-white/30 ml-1 font-normal">
                (must be a {DAY_NAMES[slot.dayOfWeek!]})
              </span>
            </Label>
            <Input
              type="date"
              min={minDate(slot)}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1 border-white/10 text-white/60 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleBook}
            disabled={loading}
            className="flex-1 bg-white text-black hover:bg-white/90 font-semibold"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Booking"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
