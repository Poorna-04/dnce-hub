import Link from "next/link";
import { MapPin, Monitor, Calendar, Clock, Users } from "lucide-react";
import type { Workshop } from "@/types/workshop";
import { STATUS_LABEL, STATUS_STYLE } from "@/types/workshop";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function SeatsIndicator({ left, total }: { left: number; total: number }) {
  const pct = Math.round((left / total) * 100);
  const low = left <= 5;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className={low ? "text-orange-400" : "text-white/40"}>
          {left === 0 ? "Full" : `${left} seat${left !== 1 ? "s" : ""} left`}
        </span>
        <span className="text-white/20">{total} total</span>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            left === 0 ? "bg-red-500/60" : low ? "bg-orange-500/60" : "bg-sky-500/40"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const full = workshop.seatsLeft === 0;

  return (
    <Link
      href={`/workshops/${workshop.id}`}
      className="group flex flex-col rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10 transition-all p-5"
    >
      {/* Title + status */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-white/90 line-clamp-2">
          {workshop.title}
        </h3>
        <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[workshop.status]}`}>
          {STATUS_LABEL[workshop.status]}
        </span>
      </div>

      {/* Style + instructor */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 font-medium">
          {workshop.danceStyle}
        </span>
        <span className="text-white/30 text-xs truncate">by {workshop.instructorName}</span>
      </div>

      {/* Date + time */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-1.5 text-white/40 text-xs">
          <Calendar className="w-3 h-3 shrink-0" />
          <span>{formatDate(workshop.workshopDate)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/40 text-xs">
          <Clock className="w-3 h-3 shrink-0" />
          <span>{formatTime(workshop.startTime)} – {formatTime(workshop.endTime)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/40 text-xs">
          {workshop.online
            ? <><Monitor className="w-3 h-3 shrink-0" /><span>Online</span></>
            : <><MapPin className="w-3 h-3 shrink-0" /><span>{workshop.city}</span></>
          }
        </div>
      </div>

      {/* Seats */}
      <div className="mb-4">
        <SeatsIndicator left={workshop.seatsLeft} total={workshop.totalSeats} />
      </div>

      {/* Price */}
      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-white font-semibold text-sm">
          {workshop.price === 0 ? "Free" : `₹${workshop.price}`}
        </span>
        <span className={`text-xs transition-colors ${
          full ? "text-red-400/60" : "text-white/30 group-hover:text-white/60"
        }`}>
          {full ? "Fully booked" : "View details →"}
        </span>
      </div>
    </Link>
  );
}
