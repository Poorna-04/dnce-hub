import { getAuthUser } from "@/lib/auth/server-token";
import { serverFetch } from "@/lib/api/server";
import type { Booking } from "@/types/booking";
import type { RegisteredWorkshop } from "@/types/workshop";
import type { Role } from "@/types/auth";
import { ROLES } from "@/types/auth";
import { BookingsTabView } from "./_components";

export const metadata = { title: "My Bookings — DanceHub" };

export default async function BookingsPage() {
  const user = await getAuthUser();
  const role: Role = user?.role ?? ROLES.STUDENT;

  let upcoming: Booking[] = [];
  let history: Booking[] = [];
  let registeredWorkshops: RegisteredWorkshop[] = [];

  try {
    upcoming = await serverFetch<Booking[]>("/bookings/my/upcoming", { requireAuth: true });
  } catch { /* empty */ }

  try {
    history = await serverFetch<Booking[]>("/bookings/my/history", { requireAuth: true });
  } catch { /* empty */ }

  if (role === ROLES.STUDENT) {
    try {
      registeredWorkshops = await serverFetch<RegisteredWorkshop[]>("/workshops/my-registrations", {
        requireAuth: true,
      });
    } catch { /* empty */ }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Bookings</h1>
        <p className="text-white/50 text-sm mt-1">
          {role === ROLES.STUDENT
            ? "Track your lessons and workshop registrations."
            : "Manage bookings from your students."}
        </p>
      </div>

      <BookingsTabView
        upcoming={upcoming}
        history={history}
        role={role}
        registeredWorkshops={registeredWorkshops}
      />
    </div>
  );
}
