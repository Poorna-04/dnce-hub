import React from "react";
import type { AvailabilitySlot } from "@/types/instructor";
import { DAY_NAMES } from "@/types/instructor";
import { BookSlotButton } from "./book-slot-button";

function formatTime(time: string) {
  // "09:00:00" → "9:00 AM"
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

interface AvailabilityGridProps {
  slots: AvailabilitySlot[];
  canBook?: boolean;
  instructorId?: number;
}

export function AvailabilityGrid({ slots, canBook = false, instructorId }: AvailabilityGridProps) {
  const available = slots.filter((s) => s.available);
  const recurring = available.filter((s) => s.slotType === "RECURRING");
  const onetime   = available.filter((s) => s.slotType === "ONE_TIME");

  if (available.length === 0) {
    return (
      <p className="text-white/30 text-sm py-4">
        No availability slots set yet.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {recurring.length > 0 && (
        <div>
          <p className="text-xs font-medium text-white/30 uppercase tracking-wide mb-2">
            Weekly (recurring)
          </p>
          <div className="space-y-2">
            {recurring
              .sort((a, b) => (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0))
              .map((slot) => (
                <SlotRow
                  key={slot.id}
                  label={DAY_NAMES[slot.dayOfWeek!]}
                  time={`${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`}
                  bookButton={canBook && instructorId ? <BookSlotButton slot={slot} instructorId={instructorId} /> : null}
                />
              ))}
          </div>
        </div>
      )}

      {onetime.length > 0 && (
        <div>
          <p className="text-xs font-medium text-white/30 uppercase tracking-wide mb-2">
            One-time slots
          </p>
          <div className="space-y-2">
            {onetime
              .sort((a, b) => (a.slotDate ?? "").localeCompare(b.slotDate ?? ""))
              .map((slot) => (
                <SlotRow
                  key={slot.id}
                  label={formatDate(slot.slotDate!)}
                  time={`${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`}
                  bookButton={canBook && instructorId ? <BookSlotButton slot={slot} instructorId={instructorId} /> : null}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SlotRow({
  label,
  time,
  bookButton,
}: {
  label: string;
  time: string;
  bookButton?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/5 px-4 py-2.5 gap-3">
      <span className="text-white text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-white/50 text-sm">{time}</span>
        {bookButton}
      </div>
    </div>
  );
}
