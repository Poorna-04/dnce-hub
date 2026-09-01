import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server-token";
import { serverFetch } from "@/lib/api/server";
import { ROLES } from "@/types/auth";
import type { Workshop } from "@/types/workshop";
import { CreateWorkshopButton, WorkshopTabView } from "./_components";

export const metadata = { title: "My Workshops — DanceHub" };

export default async function MyWorkshopsPage() {
  const user = await getAuthUser();
  if (user?.role !== ROLES.INSTRUCTOR) redirect("/workshops");

  let workshops: Workshop[] = [];
  try {
    // The backend syncStaleStatuses() runs first, so statuses are always fresh
    workshops = await serverFetch<Workshop[]>("/workshops/my", { requireAuth: true });
  } catch {
    // empty
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Workshops</h1>
          <p className="text-white/40 text-sm mt-1">
            Create and manage your group classes.
          </p>
        </div>
        <CreateWorkshopButton />
      </div>

      {workshops.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-20 text-center">
          <p className="text-white/30 text-sm">No workshops yet.</p>
          <p className="text-white/20 text-xs mt-1">
            Click &quot;Create Workshop&quot; to publish your first group class.
          </p>
        </div>
      ) : (
        <WorkshopTabView workshops={workshops} />
      )}
    </div>
  );
}
