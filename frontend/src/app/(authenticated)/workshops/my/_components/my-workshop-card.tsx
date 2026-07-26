"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Calendar, Clock, MapPin, Monitor, Users, ExternalLink } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import type { Workshop } from "@/types/workshop";
import { STATUS_LABEL, STATUS_STYLE } from "@/types/workshop";

interface Props {
  workshop: Workshop;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function MyWorkshopCard({ workshop }: Props) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  const canCancel = workshop.status === "UPCOMING";

  async function handleCancel() {
    if (!confirm(`Cancel "${workshop.title}"? This cannot be undone.`)) return;
    setCancelling(true);
    try {
      await apiClient.delete(`/workshops/${workshop.id}`);
      toast.success("Workshop cancelled.");
      router.refresh();
    } catch {
      toast.error("Failed to cancel workshop.");
    } finally {
      setCancelling(false);
    }
  }

  const seatsPercent = workshop.totalSeats > 0
    ? Math.round((workshop.registeredSeats / workshop.totalSeats) * 100)
    : 0;

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-5 space-y-4 hover:border-white/10 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{workshop.title}</h3>
          <p className="text-white/40 text-xs mt-0.5">{workshop.danceStyle}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLE[workshop.status]}`}>
          {STATUS_LABEL[workshop.status]}
        </span>
      </div>

      {/* Meta */}
      <div className="space-y-1.5 text-xs text-white/40">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 shrink-0" />
          {formatDate(workshop.workshopDate)}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 shrink-0" />
          {formatTime(workshop.startTime)} – {formatTime(workshop.endTime)}
        </div>
        <div className="flex items-center gap-1.5">
          {workshop.online ? (
            <><Monitor className="w-3 h-3 shrink-0" /> Online</>
          ) : (
            <><MapPin className="w-3 h-3 shrink-0" /> {workshop.city}</>
          )}
        </div>
      </div>

      {/* Seats progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-white/40">
            <Users className="w-3 h-3" />
            {workshop.registeredSeats} / {workshop.totalSeats} registered
          </span>
          <span className="text-white/30">{workshop.seatsLeft} left</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-violet-500/60 transition-all"
            style={{ width: `${seatsPercent}%` }}
          />
        </div>
      </div>

      {/* Price + actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-white font-semibold text-sm">
          {workshop.price === 0 ? "Free" : `₹${workshop.price}`}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/workshops/${workshop.id}`}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View
          </Link>
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-40"
            >
              {cancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : "Cancel"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
