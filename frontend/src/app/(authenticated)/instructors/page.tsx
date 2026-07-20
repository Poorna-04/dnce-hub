import { Suspense } from "react";
import { serverFetch } from "@/lib/api/server";
import type { InstructorProfile } from "@/types/instructor";
import { InstructorCard, InstructorFilters } from "./_components";

interface PageProps {
  searchParams: Promise<{ city?: string; style?: string }>;
}

async function InstructorGrid({ city, style }: { city?: string; style?: string }) {
  let path = "/instructors";
  if (city) path += `?city=${encodeURIComponent(city)}`;
  else if (style) path += `?style=${encodeURIComponent(style)}`;

  const instructors = await serverFetch<InstructorProfile[]>(path);

  if (!instructors || instructors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-white/20 text-4xl mb-3">🕺</p>
        <p className="text-white/40 text-sm">No instructors found</p>
        {(city || style) && (
          <p className="text-white/25 text-xs mt-1">Try a different city or style</p>
        )}
      </div>
    );
  }

  return (
    <>
      <InstructorFilters city={city} style={style} total={instructors.length} />
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {instructors.map((instructor) => (
          <InstructorCard key={instructor.id} instructor={instructor} />
        ))}
      </div>
    </>
  );
}

export default async function InstructorsPage({ searchParams }: PageProps) {
  const { city, style } = await searchParams;

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Instructors</h1>
        <p className="text-white/40 text-sm mt-1">
          Find a dance instructor that matches your style and location.
        </p>
      </div>

      <Suspense fallback={<GridSkeleton />}>
        <InstructorGrid city={city} style={style} />
      </Suspense>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <div className="h-9 w-64 rounded-lg bg-white/5 animate-pulse" />
        <div className="h-9 w-36 rounded-lg bg-white/5 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.03] p-5 space-y-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            </div>
            <div className="flex gap-1.5">
              <div className="h-5 w-14 rounded-full bg-white/5" />
              <div className="h-5 w-16 rounded-full bg-white/5" />
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="h-3 bg-white/5 rounded w-2/3" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
            <div className="h-px bg-white/5 mt-3" />
            <div className="h-3.5 bg-white/5 rounded w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
