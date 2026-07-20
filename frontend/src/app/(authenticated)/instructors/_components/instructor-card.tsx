import Link from "next/link";
import { MapPin, Clock, Monitor, Users } from "lucide-react";
import type { InstructorProfile } from "@/types/instructor";
import { TEACHING_MODE_LABEL } from "@/types/instructor";

export function InstructorCard({ instructor }: { instructor: InstructorProfile }) {
  const initials = instructor.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const modeIcon = instructor.teachingMode === "ONLINE"
    ? <Monitor className="w-3 h-3" />
    : instructor.teachingMode === "BOTH"
    ? <Users className="w-3 h-3" />
    : <MapPin className="w-3 h-3" />;

  return (
    <Link
      href={`/instructors/${instructor.id}`}
      className="group flex flex-col rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10 transition-all p-5"
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate group-hover:text-white/90">
            {instructor.fullName}
          </p>
          <p className="text-white/40 text-xs truncate">{instructor.email}</p>
        </div>
      </div>

      {/* Dance styles */}
      {instructor.danceStyles?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {instructor.danceStyles.slice(0, 3).map((style) => (
            <span
              key={style}
              className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 font-medium"
            >
              {style}
            </span>
          ))}
          {instructor.danceStyles.length > 3 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">
              +{instructor.danceStyles.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Meta info */}
      <div className="mt-auto space-y-1.5">
        <div className="flex items-center gap-1.5 text-white/40 text-xs">
          <MapPin className="w-3 h-3 shrink-0" />
          <span>{instructor.city}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/40 text-xs">
          {modeIcon}
          <span>{TEACHING_MODE_LABEL[instructor.teachingMode]}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/40 text-xs">
          <Clock className="w-3 h-3 shrink-0" />
          <span>{instructor.experienceYears} yr{instructor.experienceYears !== 1 ? "s" : ""} experience</span>
        </div>
      </div>

      {/* Rate */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-white font-semibold text-sm">
          ₹{instructor.hourlyRate}
          <span className="text-white/30 font-normal text-xs"> / hr</span>
        </span>
        <span className="text-white/30 text-xs group-hover:text-white/60 transition-colors">
          View profile →
        </span>
      </div>
    </Link>
  );
}
