"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Calendar, Clock, MapPin, Monitor, Users, ExternalLink, AlertTriangle, Mail } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { apiClient } from "@/lib/api/client";
import type { Workshop } from "@/types/workshop";
import { STATUS_LABEL, STATUS_STYLE } from "@/types/workshop";

interface Registrant {
  studentProfileId: number;
  fullName: string;
  email: string;
  paymentStatus: string;
  registeredAt: string;
}

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [registrantsOpen, setRegistrantsOpen] = useState(false);
  const [registrants, setRegistrants] = useState<Registrant[] | null>(null);
  const [loadingRegistrants, setLoadingRegistrants] = useState(false);

  const canCancel = workshop.status === "UPCOMING";

  async function openRegistrants() {
    setRegistrantsOpen(true);
    if (registrants !== null) return; // already loaded
    setLoadingRegistrants(true);
    try {
      const res = await apiClient.get<{ data: Registrant[] }>(`/workshops/${workshop.id}/registrants`);
      setRegistrants(res.data.data);
    } catch {
      toast.error("Failed to load registrants.");
      setRegistrants([]);
    } finally {
      setLoadingRegistrants(false);
    }
  }

  const seatsPercent = workshop.totalSeats > 0
    ? Math.round((workshop.registeredSeats / workshop.totalSeats) * 100)
    : 0;

  async function handleCancel() {
    setCancelling(true);
    try {
      await apiClient.delete(`/workshops/${workshop.id}`);
      toast.success("Workshop cancelled.");
      setConfirmOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to cancel workshop.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
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
            {workshop.online
              ? <><Monitor className="w-3 h-3 shrink-0" /> Online</>
              : <><MapPin className="w-3 h-3 shrink-0" /> {workshop.city}</>}
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
          <div className="flex items-center gap-3">
            <button
              onClick={openRegistrants}
              className="flex items-center gap-1 text-xs text-violet-400/70 hover:text-violet-300 transition-colors"
            >
              <Users className="w-3 h-3" />
              Students
            </button>
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

      {/* Registrants dialog */}
      <Dialog
        open={registrantsOpen}
        onClose={() => setRegistrantsOpen(false)}
        title={`Registered Students — ${workshop.title}`}
        className="max-w-md"
      >
        {loadingRegistrants ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-white/30" />
          </div>
        ) : registrants && registrants.length === 0 ? (
          <div className="text-center py-10">
            <Users className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No students registered yet.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {(registrants ?? []).map((r) => (
              <div
                key={r.studentProfileId}
                className="flex items-center gap-3 rounded-lg bg-white/[0.03] border border-white/5 px-4 py-3"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {r.fullName[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">{r.fullName}</p>
                  <p className="text-white/40 text-xs flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 shrink-0" />
                    {r.email}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                  r.paymentStatus === "PAID"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-yellow-500/15 text-yellow-300"
                }`}>
                  {r.paymentStatus}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/30">
          <span>{workshop.registeredSeats} / {workshop.totalSeats} seats filled</span>
          <button
            onClick={() => setRegistrantsOpen(false)}
            className="text-white/50 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </Dialog>

      {/* Custom confirm dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Cancel Workshop"
        className="max-w-sm"
      >
        <div className="flex gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">{workshop.title}</p>
            <p className="text-white/50 text-xs mt-1">
              This will cancel the workshop and notify all {workshop.registeredSeats} registered student{workshop.registeredSeats !== 1 ? "s" : ""}. This cannot be undone.
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
            {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel workshop"}
          </button>
        </div>
      </Dialog>
    </>
  );
}
