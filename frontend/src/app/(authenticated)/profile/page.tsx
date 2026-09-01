import { getAuthUser } from "@/lib/auth/server-token";
import { serverFetch } from "@/lib/api/server";
import { ROLES } from "@/types/auth";
import type { InstructorProfile, AvailabilitySlot } from "@/types/instructor";
import type { StudentProfile } from "@/types/student";
import { InstructorProfileForm, StudentProfileForm, AvailabilityManager } from "./_components";

export const metadata = { title: "My Profile — DanceHub" };

export default async function ProfilePage() {
  const user = await getAuthUser();

  const isInstructor = user?.role === ROLES.INSTRUCTOR;

  // Try to load existing profile — null if not yet created (404)
  let instructorProfile: InstructorProfile | null = null;
  let studentProfile: StudentProfile | null = null;
  let slots: AvailabilitySlot[] = [];

  if (isInstructor) {
    try {
      instructorProfile = await serverFetch<InstructorProfile>("/instructors/me", {
        requireAuth: true,
      });
    } catch {
      // Profile doesn't exist yet — create mode
    }

    // Only fetch slots if the profile exists
    if (instructorProfile) {
      try {
        slots = await serverFetch<AvailabilitySlot[]>(
          `/instructors/${instructorProfile.id}/availability`
        );
      } catch {
        // non-critical — show empty list
      }
    }
  } else {
    try {
      studentProfile = await serverFetch<StudentProfile>("/students/profile", {
        requireAuth: true,
      });
    } catch {
      // Profile doesn't exist yet — create mode
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-white/50 text-sm mt-1">
          {isInstructor
            ? "Set up your instructor profile so students can find and book you."
            : "Complete your student profile to start booking instructors."}
        </p>
      </div>

      {isInstructor ? (
        <>
          <InstructorProfileForm existing={instructorProfile} />
          {/* Show slot manager only after profile is created */}
          {instructorProfile && (
            <AvailabilityManager
              instructorId={instructorProfile.id}
              initialSlots={slots}
            />
          )}
          {!instructorProfile && (
            <p className="text-white/30 text-sm mt-8 pt-8 border-t border-white/5">
              Create your profile above to start managing availability slots.
            </p>
          )}
        </>
      ) : (
        <StudentProfileForm existing={studentProfile} />
      )}
    </div>
  );
}
