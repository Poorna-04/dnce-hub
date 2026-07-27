"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2, Calendar, Clock, MapPin, Monitor,
  ExternalLink, AlertTriangle, CreditCard, CheckCircle2,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { apiClient } from "@/lib/api/client";
import type { RegisteredWorkshop } from "@/types/workshop";
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

export function RegisteredWorkshopCard({ workshop }: { workshop: RegisteredWorkshop }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);

  const isPaid     = workshop.paymentStatus === "PAID";
  const canCancel  = workshop.status === "UPCOMING";
  const canPay     = workshop.status === "UPCOMING" && !isPaid;

  async function handlePay() {
    setPaying(true);
    try {
      await apiClient.patch(`/workshops/${workshop.id}/pay-registration`);
      toast.success("Payment successful! You're all set 🎉");
      router.refresh();
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  }

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
      <div className={`rounded-xl border p-5 space-y-4 transition-colors ${
        isPaid
          ? "border-emerald-500/20 bg-emerald-500/[0.03]"
          : "border-white/5 bg-white/[0.03]"
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{workshop.title}</h3>
            <p className="text-white/40 text-xs mt-0.5">
              by {workshop.instructorName} · {workshop.danceStyle}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[workshop.status]}`}>
              {STATUS_LABEL[workshop.status]}
            </span>
            {/* Payment badge */}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              isPaid
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-yellow-500/15 text-yellow-300"
            }`}>
              {isPaid ? <><CheckCircle2 className="w-2.5 h-2.5" /> Paid</> : "⏳ Pending Payment"}
            </span>
          </div>
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
        <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-3">
          <span className="text-white font-semibold text-sm">
            {workshop.price === 0 ? "Free" : `₹${workshop.price}`}
          </span>
          <div className="flex items-center gap-3">
            {canPay && (
              <button
                onClick={handlePay}
                disabled={paying}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {paying ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CreditCard className="w-3 h-3" /> Pay Now</>}
              </button>
            )}
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

      {/* Confirm cancel dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Cancel Registration" className="max-w-sm">
        <div className="flex gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">{workshop.title}</p>
            <p className="text-white/50 text-xs mt-1">
              Are you sure you want to cancel your registration? This cannot be undone.
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
