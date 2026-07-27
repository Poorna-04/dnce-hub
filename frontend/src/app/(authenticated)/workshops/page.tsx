import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decodeToken } from "@/lib/auth/decode-token";
import { ROLES } from "@/types/auth";
import { serverFetch } from "@/lib/api/server";
import type { Workshop } from "@/types/workshop";
import { WorkshopCard, WorkshopFilters } from "./_components";

interface PageProps {
  searchParams: Promise<{ city?: string; style?: string }>;
}

async function WorkshopGrid({ city, style }: { city?: string; style?: string }) {
  let path = "/workshops";
  if (city) path += `?city=${encodeURIComponent(city)}`;
  else if (style) path += `?style=${encodeURIComponent(style)}`;

  const workshops = await serverFetch<Workshop[]>(path);

  if (!workshops || workshops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-white/20 text-4xl mb-3">🎶</p>
        <p className="text-white/40 text-sm">No upcoming workshops found</p>
        {(city || style) && (
          <p className="text-white/25 text-xs mt-1">Try a different city or style</p>
        )}
      </div>
    );
  }

  return (
    <>
      <WorkshopFilters city={city} style={style} total={workshops.length} />
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {workshops.map((w) => (
          <WorkshopCard key={w.id} workshop={w} />
        ))}
      </div>
    </>
  );
}

export default async function WorkshopsPage({ searchParams }: PageProps) {
  // Instructors don't browse public workshops — send them to their own
  const cookieStore = await cookies();
  const token = cookieStore.get("dnce_access_token")?.value;
  const user = token ? decodeToken(token) : null;
  if (user?.role === ROLES.INSTRUCTOR) redirect("/workshops/my");

  const { city, style } = await searchParams;

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Workshops</h1>
        <p className="text-white/40 text-sm mt-1">
          Browse upcoming group dance classes and register your spot.
        </p>
      </div>

      <Suspense fallback={<GridSkeleton />}>
        <WorkshopGrid city={city} style={style} />
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
            <div className="flex justify-between">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-5 w-16 rounded-full bg-white/5" />
            </div>
            <div className="flex gap-2">
              <div className="h-5 w-14 rounded-full bg-white/5" />
              <div className="h-5 w-20 rounded-full bg-white/5" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 bg-white/5 rounded w-1/2" />
              <div className="h-3 bg-white/5 rounded w-2/3" />
              <div className="h-3 bg-white/5 rounded w-1/3" />
            </div>
            <div className="h-1 bg-white/5 rounded-full" />
            <div className="h-px bg-white/5 mt-3" />
            <div className="h-3.5 bg-white/5 rounded w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
