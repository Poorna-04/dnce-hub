"use client";

import { useState } from "react";
import type { Booking } from "@/types/booking";
import type { RegisteredWorkshop } from "@/types/workshop";
import type { Role } from "@/types/auth";
import { ROLES } from "@/types/auth";
import { BookingCard } from "./booking-card";
import { RegisteredWorkshopCard } from "./registered-workshop-card";

interface Props {
  upcoming: Booking[];
  history: Booking[];        // all non-upcoming (completed + cancelled mixed)
  role: Role;
  registeredWorkshops?: RegisteredWorkshop[];
}

type Tab = "upcoming" | "completed" | "cancelled" | "workshops";

export function BookingsTabView({ upcoming, history, role, registeredWorkshops = [] }: Props) {
  const isStudent    = role === ROLES.STUDENT;

  // Split history into completed vs cancelled
  const completed  = history.filter((b) => b.status !== "CANCELLED");
  const cancelled  = history.filter((b) => b.status === "CANCELLED");

  // Student workshop registrations: only show active ones in this tab
  // Completed workshops are done — no need to clutter the student view
  const activeWorkshops = registeredWorkshops.filter(
    (w) => w.status === "UPCOMING" || w.status === "ONGOING"
  );

  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const tabs: { id: Tab; label: string; count: number; color?: string }[] = [
    { id: "upcoming",   label: "Upcoming",   count: upcoming.length,  color: "text-sky-400" },
    { id: "completed",  label: "Completed",  count: completed.length, color: "text-emerald-400" },
    { id: "cancelled",  label: "Cancelled",  count: cancelled.length, color: "text-red-400" },
    ...(isStudent
      ? [{ id: "workshops" as Tab, label: "Workshops", count: activeWorkshops.length }]
      : []),
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-white/5 overflow-x-auto">
        {tabs.map(({ id, label, count, color }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === id
                ? "border-white text-white"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            {label}
            {count > 0 && (
              <span className={`ml-2 text-xs font-semibold ${activeTab === id ? color ?? "text-white/60" : "text-white/25"}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Upcoming */}
      {activeTab === "upcoming" && (
        <TabContent
          empty="No upcoming bookings. Book a session with an instructor to get started."
          items={upcoming}
          render={(b) => <BookingCard key={b.id} booking={b as Booking} role={role} />}
        />
      )}

      {/* Completed */}
      {activeTab === "completed" && (
        <TabContent
          empty="No completed bookings yet."
          items={completed}
          render={(b) => <BookingCard key={b.id} booking={b as Booking} role={role} />}
        />
      )}

      {/* Cancelled */}
      {activeTab === "cancelled" && (
        <div className="opacity-70">
          <TabContent
            empty="No cancelled bookings."
            items={cancelled}
            render={(b) => <BookingCard key={b.id} booking={b as Booking} role={role} />}
          />
        </div>
      )}

      {/* Workshops (student only) — only active registrations shown here */}
      {activeTab === "workshops" && isStudent && (
        activeWorkshops.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/30 text-sm">No upcoming workshop registrations.</p>
            <p className="text-white/20 text-xs mt-1">Browse workshops to find and register for one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeWorkshops.map((w) => (
              <RegisteredWorkshopCard key={w.id} workshop={w} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function TabContent<T>({
  items,
  empty,
  render,
}: {
  items: T[];
  empty: string;
  render: (item: T) => React.ReactNode;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-white/30 text-sm">{empty}</p>
      </div>
    );
  }
  return <div className="space-y-3">{items.map(render)}</div>;
}
