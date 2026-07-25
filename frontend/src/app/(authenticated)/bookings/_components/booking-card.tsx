import { Calendar, Clock, User } from "lucide-react";
import type { Booking } from "@/types/booking";
import { STATUS_LABEL, STATUS_STYLE } from "@/types/booking";
import type { Role } from "@/types/auth";
import { ROLES } from "@/types/auth";
import { BookingActions } from "./booking-actions";

interface Props {
  booking: Booking;
  role: Role;
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BookingCard({ booking, role }: Props) {
  const otherPerson =
    role === ROLES.STUDENT ? booking.instructorName : booking.studentName;

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <User className="w-3 h-3 shrink-0" />
            <span>
              {role === ROLES.STUDENT ? "Instructor" : "Student"}: {otherPerson}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-white/50 text-xs">
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

        {/* Status badge */}
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLE[booking.status]}`}
        >
          {STATUS_LABEL[booking.status]}
        </span>
      </div>

      {/* Amount */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <span className="text-white/40 text-xs">Total</span>
        <span className="text-white font-semibold text-sm">₹{booking.totalAmount}</span>
      </div>

      {/* Actions */}
      {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
        <BookingActions booking={booking} role={role} />
      )}
    </div>
  );
}
