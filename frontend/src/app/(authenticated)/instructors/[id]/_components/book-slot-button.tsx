"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CalendarCheck } from "lucide-react";
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

function minDate(slot: AvailabilitySlot): string {
  if (slot.slotType === "ONE_TIME" && slot.slotDate) return slot.slotDate;
  return new Date().toISOString().split("T")[0];
}

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
          day: "numeric", month: "short", year: "numeric",
        })
      : DAY_NAMES[slot.dayOfWeek!];

  async function handleBook() {
    if (!bookingDate) {
      toast.error("Please select a booking date.");
      return;
    }
    if (slot.slotType === "RECURRING" && slot.dayOfWeek != null) {
      const jsDay = new Date(bookingDate).getUTCDay();
      const mapped = jsDay === 0 ? 7 : jsDay;
      if (mapped !== slot.dayOfWeek) {
        toast.error(`This slot is only available on ${DAY_NAMES[slot.dayOfWeek]}. Pick a ${DAY_NAMES[slot.dayOfWeek]}.`);
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
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Book trigger — solid violet */}
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors"
      >
        Book
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Book a Session">
        {/* Slot summary card */}
        <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 px-4 py-3.5 mb-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-4 h-4 text-violet-300" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{slotLabel}</p>
            <p className="text-violet-300/70 text-xs mt-0.5">
              {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
            </p>
          </div>
        </div>

        {/* Date selection */}
        {slot.slotType === "ONE_TIME" ? (
          <div className="rounded-lg bg-white/[0.03] border border-white/5 px-4 py-3 mb-6 text-sm text-white/60">
            Date is fixed for this one-time slot —{" "}
            <span className="text-white font-medium">{slotLabel}</span>.
          </div>
        ) : (
          <div className="space-y-1.5 mb-6">
            <Label className="text-white/70 text-sm">
              Pick a date
              <span className="text-white/30 ml-1.5 font-normal text-xs">
                must be a {DAY_NAMES[slot.dayOfWeek!]}
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

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 py-2.5 rounded-lg border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleBook}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Booking"}
          </button>
        </div>
      </Dialog>
    </>
  );
}
