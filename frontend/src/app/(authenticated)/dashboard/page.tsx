import { cookies } from "next/headers";
import { decodeToken } from "@/lib/auth/decode-token";
import { ROLES } from "@/types/auth";
import {
  CalendarDays,
  Users,
  BookOpen,
  TrendingUp,
} from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-white/40 uppercase tracking-wide">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="w-4 h-4 text-white/50" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {hint && <p className="text-xs text-white/30 mt-1">{hint}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("dnce_access_token")?.value ?? "";
  const user = decodeToken(token);

  const isInstructor = user?.role === ROLES.INSTRUCTOR;
  const greeting = getGreeting();

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
            <StatCard label="Upcoming Bookings" value="—" icon={CalendarDays} hint="Connect to see live data" />
            <StatCard label="Active Students"   value="—" icon={Users}        hint="Connect to see live data" />
            <StatCard label="Workshops"         value="—" icon={BookOpen}     hint="Connect to see live data" />
            <StatCard label="This Month"        value="—" icon={TrendingUp}   hint="Revenue coming soon" />
          </>
        ) : (
          <>
            <StatCard label="My Bookings"    value="—" icon={CalendarDays} hint="Connect to see live data" />
            <StatCard label="Saved Instructors" value="—" icon={Users}     hint="Connect to see live data" />
            <StatCard label="Workshops"      value="—" icon={BookOpen}     hint="Connect to see live data" />
            <StatCard label="Completed"      value="—" icon={TrendingUp}   hint="Sessions completed" />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wide mb-4">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {isInstructor ? (
            <>
              <QuickAction href="/workshops" label="Create a Workshop" description="Set up a new group class" />
              <QuickAction href="/bookings"  label="View Bookings"     description="See your upcoming schedule" />
            </>
          ) : (
            <>
              <QuickAction href="/instructors" label="Browse Instructors" description="Find a dance instructor near you" />
              <QuickAction href="/workshops"   label="Join a Workshop"    description="Upcoming group classes" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] p-5 transition-colors group"
    >
      <div>
        <p className="text-white font-medium text-sm">{label}</p>
        <p className="text-white/40 text-xs mt-0.5">{description}</p>
      </div>
      <span className="text-white/20 group-hover:text-white/60 transition-colors text-lg">→</span>
    </a>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 18) return "Good afternoon,";
  return "Good evening,";
}
