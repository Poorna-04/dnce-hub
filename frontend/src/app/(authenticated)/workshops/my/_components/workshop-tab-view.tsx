"use client";

import { useState } from "react";
import type { Workshop, WorkshopStatus } from "@/types/workshop";
import { MyWorkshopCard } from "./my-workshop-card";

interface Props {
  workshops: Workshop[];
}

type Tab = "upcoming" | "ongoing" | "completed" | "cancelled";

const TAB_CONFIG: {
  id: Tab;
  label: string;
  status: WorkshopStatus[];
  dot: string;
  emptyMsg: string;
}[] = [
  {
    id: "upcoming",
    label: "Upcoming",
    status: ["UPCOMING"],
    dot: "bg-sky-400",
    emptyMsg: "No upcoming workshops. Create one to get started.",
  },
  {
    id: "ongoing",
    label: "Live Now",
    status: ["ONGOING"],
    dot: "bg-green-400",
    emptyMsg: "No workshops are live right now.",
  },
  {
    id: "completed",
    label: "Completed",
    status: ["COMPLETED"],
    dot: "bg-white/30",
    emptyMsg: "No completed workshops yet.",
  },
  {
    id: "cancelled",
    label: "Cancelled",
    status: ["CANCELLED"],
    dot: "bg-red-400/60",
    emptyMsg: "No cancelled workshops.",
  },
];

export function WorkshopTabView({ workshops }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const counts = TAB_CONFIG.reduce<Record<Tab, number>>(
    (acc, t) => {
      acc[t.id] = workshops.filter((w) => (t.status as string[]).includes(w.status)).length;
      return acc;
    },
    { upcoming: 0, ongoing: 0, completed: 0, cancelled: 0 }
  );

  const activeItems = workshops.filter((w) =>
    (TAB_CONFIG.find((t) => t.id === activeTab)?.status as string[] ?? []).includes(w.status)
  );

  const config = TAB_CONFIG.find((t) => t.id === activeTab)!;

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-white/5 mb-6 overflow-x-auto">
        {TAB_CONFIG.map(({ id, label, dot }) => {
          const count = counts[id];
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                isActive
                  ? "border-white text-white"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              {label}
              {count > 0 && (
                <span className={`text-xs font-semibold ${isActive ? "text-white/60" : "text-white/20"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/30 text-sm">{config.emptyMsg}</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${
          activeTab === "completed" || activeTab === "cancelled" ? "opacity-60" : ""
        }`}>
          {activeItems.map((w) => (
            <MyWorkshopCard key={w.id} workshop={w} />
          ))}
        </div>
      )}
    </div>
  );
}
