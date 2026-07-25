"use client";

import { useState } from "react";
import type { Booking } from "@/types/booking";
import type { Role } from "@/types/auth";
import { BookingCard } from "./booking-card";

interface Props {
  upcoming: Booking[];
  history: Booking[];
  role: Role;
}

type Tab = "upcoming" | "history";

export function BookingsTabView({ upcoming, history, role }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const bookings = activeTab === "upcoming" ? upcoming : history;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/5 pb-0">
        {(["upcoming", "history"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-white text-white"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            {tab}
            <span className="ml-2 text-xs opacity-60">
              {tab === "upcoming" ? upcoming.length : history.length}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/30 text-sm">
            {activeTab === "upcoming"
              ? "No upcoming bookings."
              : "No booking history yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} role={role} />
          ))}
        </div>
      )}
    </div>
  );
}
