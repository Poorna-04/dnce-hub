"use client";

import { useState } from "react";
import {
  Calendar, Clock, User, CheckCircle2, Hourglass,
  Mail, IndianRupee, ChevronRight,
} from "lucide-react";
import type { Booking, BookingStatus } from "@/types/booking";
import { STATUS_STYLE } from "@/types/booking";
import type { Role } from "@/types/auth";
import { ROLES } from "@/types/auth";
import { Dialog } from "@/components/ui/dialog";
import { BookingActions } from "./booking-actions";

interface Props {
  booking: Booking;
  role: Role;
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "short", year: "numeric",
  });
}

// ── Status labels ──────────────────────────────────────────
const STUDENT_LABELS: Record<BookingStatus, string> = {
  PENDING:   "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

const INSTRUCTOR_LABELS: Record<BookingStatus, string> = {
  PENDING:   "Awaiting Payment",
  CONFIRMED: "Paid ✓",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

const INSTRUCTOR_STYLE: Record<BookingStatus, string> = {
  PENDING:   "bg-yellow-500/15 text-yellow-300",
  CONFIRMED: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30",
  CANCELLED: "bg-red-500/15 text-red-400",
  COMPLETED: "bg-sky-500/15 text-sky-300",
};

// ── Component ──────────────────────────────────────────────
export function BookingCard({ booking, role }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isInstructor = role === ROLES.INSTRUCTOR;
  const otherPerson  = isInstructor ? booking.studentName : booking.instructorName;

  const statusLabel = isInstructor ? INSTRUCTOR_LABELS[booking.status] : STUDENT_LABELS[booking.status];
  const statusStyle = isInstructor ? INSTRUCTOR_STYLE[booking.status] : STATUS_STYLE[booking.status];

  return (
    <>
      <div className={`rounded-xl border p-5 space-y-4 transition-colors ${
        isInstructor && booking.status === "CONFIRMED"
          ? "border-emerald-500/20 bg-emerald-500/[0.03]"
          : "border-white/5 bg-white/[0.03]"
      }`}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <User className="w-3 h-3 shrink-0" />
              <span className="font-medium text-white/80">
                {isInstructor ? "Student" : "Instructor"}:
              </span>
              <span>{otherPerson}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-white/40 text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(booking.bookingDate)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Status badge */}
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${statusStyle}`}>
              {isInstructor && booking.status === "CONFIRMED" && <CheckCircle2 className="w-3 h-3" />}
              {isInstructor && booking.status === "PENDING"   && <Hourglass    className="w-3 h-3" />}
              {statusLabel}
            </span>
            {/* Instructor: "View Details" button */}
            {isInstructor && (
              <button
                onClick={() => setDetailsOpen(true)}
                className="flex items-center gap-0.5 text-[11px] text-violet-400/70 hover:text-violet-300 transition-colors"
              >
                View Details <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Amount row */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <span className="text-white/40 text-xs">Total</span>
          <span className="text-white font-semibold text-sm">₹{booking.totalAmount}</span>
        </div>

        {/* Actions */}
        {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
          <BookingActions booking={booking} role={role} />
        )}
      </div>

      {/* ── Instructor: Student Details Dialog ──────────── */}
      {isInstructor && (
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} title="Student Details" className="max-w-sm">
          {/* Avatar + name */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-300 font-bold text-base shrink-0">
              {booking.studentName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{booking.studentName}</p>
              {booking.studentEmail && (
                <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3" />
                  {booking.studentEmail}
                </p>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="space-y-3">
            <DetailRow label="Session Date" value={formatDate(booking.bookingDate)} />
            <DetailRow label="Time" value={`${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`} />
            <DetailRow
              label="Payment Status"
              value={statusLabel}
              valueClass={
                booking.status === "CONFIRMED" ? "text-emerald-300 font-semibold" :
                booking.status === "PENDING"   ? "text-yellow-300 font-semibold"  : undefined
              }
            />
            <DetailRow label="Amount" value={`₹${booking.totalAmount}`} />
            <DetailRow
              label="Booking Status"
              value={booking.status}
              valueClass="capitalize"
            />
          </div>

          <button
            onClick={() => setDetailsOpen(false)}
            className="mt-6 w-full py-2.5 rounded-lg border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white text-sm font-medium transition-colors"
          >
            Close
          </button>
        </Dialog>
      )}
    </>
  );
}

function DetailRow({
  label, value, valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5">
      <span className="text-white/40 text-xs">{label}</span>
      <span className={`text-sm text-white/80 ${valueClass ?? ""}`}>{value}</span>
    </div>
  );
}
