"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Calendar, Clock, MapPin, Monitor, ExternalLink, AlertTriangle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { apiClient } from "@/lib/api/client";
import type { Workshop } from "@/types/workshop";
import { STATUS_LABEL, STATUS_STYLE } from "@/types/workshop";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}
function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function RegisteredWorkshopCard({ workshop }: { workshop: Workshop }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const canCancel = workshop.status === "UPCOMING";

  async function handleCancel() {
    setCancelling(true);
    try {
      await apiClient.delete(`/workshops/${workshop.id}/register`);
      toast.success("Registration cancelled.");
      setConfirmOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to cancel registration.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{workshop.title}</h3>
            <p className="text-white/40 text-xs mt-0.5">
              by {workshop.instructorName} · {workshop.danceStyle}
            </p>
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
            {workshop.online
              ? <><Monitor className="w-3 h-3 shrink-0" /> Online</>
              : <><MapPin className="w-3 h-3 shrink-0" /> {workshop.city}</>}
          </div>
        </div>

        {/* Price + actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-white font-semibold text-sm">
            {workshop.price === 0 ? "Free" : `₹${workshop.price}`}
          </span>
          <div className="flex items-center gap-3">
            <Link
              href={`/workshops/${workshop.id}`}
              className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View
            </Link>
            {canCancel && (
              <button
                onClick={() => setConfirmOpen(true)}
                className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Custom confirm dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Cancel Registration"
        className="max-w-sm"
      >
        <div className="flex gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">{workshop.title}</p>
            <p className="text-white/50 text-xs mt-1">
              Are you sure you want to cancel your registration? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setConfirmOpen(false)}
            disabled={cancelling}
            className="flex-1 py-2.5 rounded-lg border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            Keep it
          </button>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, cancel"}
          </button>
        </div>
      </Dialog>
    </>
  );
}
