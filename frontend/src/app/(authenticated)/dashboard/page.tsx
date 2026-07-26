import { cookies } from "next/headers";
import Link from "next/link";
import { decodeToken } from "@/lib/auth/decode-token";
import { serverFetch } from "@/lib/api/server";
import { ROLES } from "@/types/auth";
import type { Booking } from "@/types/booking";
import type { InstructorProfile } from "@/types/instructor";
import type { Workshop } from "@/types/workshop";
import {
  CalendarDays,
  Users,
  BookOpen,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  color = "white",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  href?: string;
  color?: "white" | "violet" | "emerald" | "sky";
}) {
  const iconColors = {
    white:   "text-white/50",
    violet:  "text-violet-400",
    emerald: "text-emerald-400",
    sky:     "text-sky-400",
  };
  const inner = (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-5 group-hover:bg-white/[0.05] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-white/40 uppercase tracking-wide">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className={`w-4 h-4 ${iconColors[color]}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
  return href ? (
    <Link href={href} className="group block">
      {inner}
    </Link>
  ) : (
    <div>{inner}</div>
  );
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("dnce_access_token")?.value ?? "";
  const user = decodeToken(token);

  const isInstructor = user?.role === ROLES.INSTRUCTOR;
  const greeting = getGreeting();

  // ── Fetch real stats ──────────────────────────────────────────────────────
  let upcomingCount = 0;
  let savedCount    = 0;
  let workshops: Workshop[] = [];

  try {
    const bookings = await serverFetch<Booking[]>("/bookings/my/upcoming", { requireAuth: true });
    upcomingCount = bookings.length;
  } catch { /* ignore */ }

  if (isInstructor) {
    try {
      workshops = await serverFetch<Workshop[]>("/workshops/my", { requireAuth: true });
    } catch { /* ignore */ }
  } else {
    try {
      const saved = await serverFetch<InstructorProfile[]>("/students/saved-instructors", { requireAuth: true });
      savedCount = saved.length;
    } catch { /* ignore */ }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-white/40 text-sm mb-1">{greeting}</p>
        <h1 className="text-2xl font-bold text-white">
          {user?.fullName ?? "Welcome"}
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {isInstructor
            ? "Manage your availability, bookings, and workshops."
            : "Discover instructors and join workshops near you."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {isInstructor ? (
          <>
            <StatCard label="Upcoming Bookings" value={upcomingCount} icon={CalendarDays} href="/bookings"  color="violet" />
            <StatCard label="My Workshops"       value={workshops.length} icon={BookOpen} href="/workshops/my" color="sky" />
            <StatCard label="Profile"            value="Active"       icon={Users}        href="/profile"   color="emerald" />
            <StatCard label="Slots"              value="—"            icon={TrendingUp} />
          </>
        ) : (
          <>
            <StatCard label="Upcoming Bookings"  value={upcomingCount} icon={CalendarDays} href="/bookings"    color="violet" />
            <StatCard label="Saved Instructors"  value={savedCount}    icon={Users}        href="/instructors/saved" color="emerald" />
            <StatCard label="Browse Workshops"   value="Explore"       icon={BookOpen}     href="/workshops"   color="sky" />
            <StatCard label="History"            value="—"             icon={TrendingUp}   href="/bookings" />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {isInstructor ? (
            <>
              <QuickAction href="/profile"   label="Manage Availability"  description="Add or edit your time slots" />
              <QuickAction href="/bookings"  label="View Bookings"         description="See your upcoming schedule" />
              <QuickAction href="/workshops/my" label="My Workshops"       description="Create and manage workshops" />
              <QuickAction href="/workshops" label="Browse All Workshops"  description="See what's happening" />
            </>
          ) : (
            <>
              <QuickAction href="/instructors" label="Browse Instructors"  description="Find a dance instructor near you" />
              <QuickAction href="/workshops"   label="Join a Workshop"     description="Upcoming group classes" />
              <QuickAction href="/bookings"    label="My Bookings"         description="Upcoming and past sessions" />
              <QuickAction href="/profile"     label="Edit Profile"        description="Update your dance interests" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] p-5 transition-colors group"
    >
      <div>
        <p className="text-white font-medium text-sm">{label}</p>
        <p className="text-white/40 text-xs mt-0.5">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 18) return "Good afternoon,";
  return "Good evening,";
}
