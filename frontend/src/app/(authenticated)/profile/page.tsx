import { cookies } from "next/headers";
import { decodeToken } from "@/lib/auth/decode-token";
import { serverFetch } from "@/lib/api/server";
import { ROLES } from "@/types/auth";
import type { InstructorProfile } from "@/types/instructor";
import type { StudentProfile } from "@/types/student";
import { InstructorProfileForm, StudentProfileForm } from "./_components";

export const metadata = { title: "My Profile — DanceHub" };

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("dnce_access_token")?.value;
  const user = token ? decodeToken(token) : null;

  const isInstructor = user?.role === ROLES.INSTRUCTOR;

  // Try to load existing profile — null if not yet created (404)
  let instructorProfile: InstructorProfile | null = null;
  let studentProfile: StudentProfile | null = null;

  if (isInstructor) {
    try {
      instructorProfile = await serverFetch<InstructorProfile>("/instructors/me", {
        requireAuth: true,
      });
    } catch {
      // Profile doesn't exist yet — create mode
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
        <InstructorProfileForm existing={instructorProfile} />
      ) : (
        <StudentProfileForm existing={studentProfile} />
      )}
    </div>
  );
}
