import Link from "next/link";
import { ArrowLeft, Bookmark } from "lucide-react";
import { serverFetch } from "@/lib/api/server";
import type { InstructorProfile } from "@/types/instructor";
import { InstructorCard } from "../_components";

export const metadata = { title: "Saved Instructors — DanceHub" };

export default async function SavedInstructorsPage() {
  let saved: InstructorProfile[] = [];

  try {
    saved = await serverFetch<InstructorProfile[]>("/students/saved-instructors", {
      requireAuth: true,
    });
  } catch {
    // empty list
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Back */}
      <Link
        href="/instructors"
        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All instructors
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
          <Bookmark className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Saved Instructors</h1>
          <p className="text-white/40 text-xs mt-0.5">
            {saved.length === 0
              ? "You haven't saved any instructors yet."
              : `${saved.length} instructor${saved.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>
      </div>

      {/* Grid */}
      {saved.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-20 text-center">
          <Bookmark className="w-10 h-10 text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-sm">No saved instructors yet.</p>
          <p className="text-white/20 text-xs mt-1">
            Browse instructors and click the bookmark icon to save them here.
          </p>
          <Link
            href="/instructors"
            className="inline-block mt-6 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors"
          >
            Browse instructors →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>
      )}
    </div>
  );
}
