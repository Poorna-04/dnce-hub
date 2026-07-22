import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MapPin, Monitor, Users } from "lucide-react";
import { serverFetch } from "@/lib/api/server";
import type { Workshop } from "@/types/workshop";
import { STATUS_LABEL, STATUS_STYLE } from "@/types/workshop";
import { RegisterButton } from "./_components";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export default async function WorkshopDetailPage({ params }: PageProps) {
  const { id } = await params;

  let workshop: Workshop;
  try {
    workshop = await serverFetch<Workshop>(`/workshops/${id}`);
  } catch {
    notFound();
  }

  const seatsPercent = Math.round(
    ((workshop.totalSeats - workshop.seatsLeft) / workshop.totalSeats) * 100
  );
  const lowSeats = workshop.seatsLeft > 0 && workshop.seatsLeft <= 5;
  const canRegister = workshop.status === "UPCOMING" || workshop.status === "ONGOING";

  return (
    <div className="p-6 md:p-8 max-w-3xl">

      {/* Back */}
      <Link
        href="/workshops"
        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to workshops
      </Link>

      {/* Main card */}
      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-6 mb-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">{workshop.title}</h1>
            <p className="text-white/40 text-sm mt-1">
              by{" "}
              <Link
                href={`/instructors/${workshop.instructorId}`}
                className="text-white/60 hover:text-white transition-colors"
              >
                {workshop.instructorName}
              </Link>
            </p>
          </div>
          <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[workshop.status]}`}>
            {STATUS_LABEL[workshop.status]}
          </span>
        </div>

        {/* Dance style */}
        <span className="inline-block text-xs px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 font-medium mb-5">
          {workshop.danceStyle}
        </span>

        {/* Description */}
        {workshop.description && (
          <p className="text-white/60 text-sm leading-relaxed mb-5">
            {workshop.description}
          </p>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <DetailRow icon={<Calendar className="w-4 h-4" />} label="Date" value={formatDate(workshop.workshopDate)} />
          <DetailRow icon={<Clock className="w-4 h-4" />} label="Time"
            value={`${formatTime(workshop.startTime)} – ${formatTime(workshop.endTime)}`} />
          <DetailRow
            icon={workshop.online ? <Monitor className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            label={workshop.online ? "Format" : "Location"}
            value={workshop.online ? "Online" : `${workshop.venue ?? ""} · ${workshop.city}`}
          />
          <DetailRow icon={<Users className="w-4 h-4" />} label="Seats"
            value={`${workshop.registeredSeats} / ${workshop.totalSeats} registered`} />
        </div>

        {/* Seat bar */}
        <div className="mb-2">
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                workshop.seatsLeft === 0 ? "bg-red-500/60"
                  : lowSeats ? "bg-orange-500/60"
                  : "bg-sky-500/40"
              }`}
              style={{ width: `${seatsPercent}%` }}
            />
          </div>
          <p className={`text-xs mt-1 ${
            workshop.seatsLeft === 0 ? "text-red-400"
              : lowSeats ? "text-orange-400"
              : "text-white/30"
          }`}>
            {workshop.seatsLeft === 0
              ? "No seats remaining"
              : lowSeats
              ? `Only ${workshop.seatsLeft} seat${workshop.seatsLeft !== 1 ? "s" : ""} left!`
              : `${workshop.seatsLeft} seats available`}
          </p>
        </div>
      </div>

      {/* Price + register */}
      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-5 flex items-center gap-5">
        <div>
          <p className="text-white text-2xl font-bold">
            {workshop.price === 0 ? "Free" : `₹${workshop.price}`}
          </p>
          {workshop.price > 0 && (
            <p className="text-white/30 text-xs">per participant</p>
          )}
        </div>
        <div className="flex-1">
          {canRegister ? (
            <RegisterButton workshopId={workshop.id} seatsLeft={workshop.seatsLeft} />
          ) : (
            <div className={`w-full py-2.5 rounded-lg text-center text-sm font-medium border ${STATUS_STYLE[workshop.status]} border-transparent`}>
              {STATUS_LABEL[workshop.status]}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2.5">
      <span className="text-white/30 mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-white/30 text-xs mb-0.5">{label}</p>
        <p className="text-white text-sm">{value}</p>
      </div>
    </div>
  );
}
