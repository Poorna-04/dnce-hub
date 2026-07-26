"use client";

import { useState } from "react";
import type { Booking } from "@/types/booking";
import type { Workshop } from "@/types/workshop";
import type { Role } from "@/types/auth";
import { ROLES } from "@/types/auth";
import { BookingCard } from "./booking-card";
import { RegisteredWorkshopCard } from "./registered-workshop-card";

interface Props {
  upcoming: Booking[];
  history: Booking[];
  role: Role;
  registeredWorkshops?: Workshop[];   // student only
}

type Tab = "upcoming" | "history" | "workshops";

export function BookingsTabView({ upcoming, history, role, registeredWorkshops = [] }: Props) {
  const isStudent = role === ROLES.STUDENT;
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "upcoming",  label: "Upcoming",  count: upcoming.length },
    { id: "history",   label: "History",   count: history.length },
    ...(isStudent
      ? [{ id: "workshops" as Tab, label: "Workshops", count: registeredWorkshops.length }]
      : []),
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/5">
        {tabs.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === id
                ? "border-white text-white"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            {label}
            <span className="ml-2 text-xs opacity-60">{count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "upcoming" && (
        <TabContent
          empty="No upcoming bookings."
          items={upcoming}
          render={(b) => <BookingCard key={b.id} booking={b as Booking} role={role} />}
        />
      )}
      {activeTab === "history" && (
        <TabContent
          empty="No booking history yet."
          items={history}
          render={(b) => <BookingCard key={b.id} booking={b as Booking} role={role} />}
        />
      )}
      {activeTab === "workshops" && isStudent && (
        <TabContent
          empty="You haven't registered for any workshops yet."
          items={registeredWorkshops}
          render={(w) => <RegisteredWorkshopCard key={(w as Workshop).id} workshop={w as Workshop} />}
        />
      )}
    </div>
  );
}

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
