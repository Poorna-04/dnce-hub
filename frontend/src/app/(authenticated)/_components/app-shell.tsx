"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BookOpen,
  UserCircle,
  GraduationCap,
  LogOut,
  Menu,
  X,
  Music2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ROLES, type Role } from "@/types/auth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: Role[];   // undefined = visible to all
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/instructors",  label: "Instructors",  icon: Users },
  { href: "/workshops",    label: "Workshops",    icon: BookOpen },
  { href: "/workshops/my", label: "My Workshops", icon: GraduationCap, roles: [ROLES.INSTRUCTOR] },
  { href: "/bookings",     label: "Bookings",     icon: CalendarDays },
  { href: "/profile",      label: "My Profile",   icon: UserCircle },
];

function RoleBadge({ role }: { role: string }) {
  const isInstructor = role === ROLES.INSTRUCTOR;
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide uppercase ${
        isInstructor
          ? "bg-violet-500/20 text-violet-300"
          : "bg-sky-500/20 text-sky-300"
      }`}
    >
      {role.toLowerCase()}
    </span>
  );
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
          <Music2 className="w-4 h-4 text-black" />
        </div>
        <span className="text-white font-semibold tracking-tight">DanceHub</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV_ITEMS
          .filter(({ roles }) => !roles || (user?.role && roles.includes(user.role)))
          .map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
            {user?.fullName?.[0] ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-white/40 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        {user?.role && <RoleBadge role={user.role} />}
        <button
          onClick={signOut}
          className="mt-3 flex items-center gap-2 text-white/40 hover:text-red-400 transition-colors text-sm w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-900 text-white overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-56 shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-56 z-50">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-zinc-950 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/50 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold text-sm">DanceHub</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
