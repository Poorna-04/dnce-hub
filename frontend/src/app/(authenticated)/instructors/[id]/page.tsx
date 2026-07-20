import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, ArrowLeft } from "lucide-react";
import { serverFetch } from "@/lib/api/server";
import type { InstructorProfile, AvailabilitySlot } from "@/types/instructor";
import { TEACHING_MODE_LABEL } from "@/types/instructor";
import { AvailabilityGrid, SaveButton } from "./_components";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InstructorDetailPage({ params }: PageProps) {
  const { id } = await params;

  let instructor: InstructorProfile;
  let slots: AvailabilitySlot[] = [];

  try {
    instructor = await serverFetch<InstructorProfile>(`/instructors/${id}`);
  } catch {
    notFound();
  }

  try {
    slots = await serverFetch<AvailabilitySlot[]>(`/instructors/${id}/availability`);
  } catch {
    // availability is non-critical — show empty state
  }

  const initials = instructor.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-6 md:p-8 max-w-3xl">

      {/* Back */}
      <Link
        href="/instructors"
        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to instructors
      </Link>

      {/* Header card */}
      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-6 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white text-lg font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">{instructor.fullName}</h1>
            <p className="text-white/40 text-sm">{instructor.email}</p>

            <div className="flex flex-wrap gap-3 mt-3 text-xs text-white/40">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {instructor.city}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {instructor.experienceYears} yr{instructor.experienceYears !== 1 ? "s" : ""} experience
              </span>
              <span>{TEACHING_MODE_LABEL[instructor.teachingMode]}</span>
            </div>
          </div>

          {/* Rate + save */}
          <div className="text-right shrink-0 flex flex-col items-end gap-3">
            <div>
              <p className="text-white text-xl font-bold">₹{instructor.hourlyRate}</p>
              <p className="text-white/30 text-xs">per hour</p>
            </div>
            <SaveButton instructorId={instructor.id} />
          </div>
        </div>

        {/* Dance styles */}
        {instructor.danceStyles?.length > 0 && (
          <div className="mt-5 pt-5 border-t border-white/5">
            <p className="text-xs font-medium text-white/30 uppercase tracking-wide mb-2">
              Dance styles
            </p>
            <div className="flex flex-wrap gap-2">
              {instructor.danceStyles.map((style) => (
                <span
                  key={style}
                  className="text-xs px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 font-medium"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Availability</h2>
        <AvailabilityGrid slots={slots} />
      </div>

    </div>
  );
}
