"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search, X } from "lucide-react";

const DANCE_STYLES = [
  "Salsa", "Bachata", "Hip-Hop", "Contemporary",
  "Bharatnatyam", "Kathak", "Freestyle", "Ballroom",
];

export function InstructorFilters({
  city,
  style,
  total,
}: {
  city?: string;
  style?: string;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // clear the other filter when one is set (API only supports one at a time)
      if (key === "city") params.delete("style");
      if (key === "style") params.delete("city");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => router.push(pathname);
  const hasFilter = Boolean(city || style);

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">

      {/* City search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
        <input
          type="text"
          placeholder="Search by city..."
          defaultValue={city ?? ""}
          onChange={(e) => {
            const v = e.target.value.trim();
            if (!v) clearAll();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParam("city", (e.target as HTMLInputElement).value.trim());
            }
          }}
          className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-colors"
        />
      </div>

      {/* Style filter */}
      <select
        value={style ?? ""}
        onChange={(e) => updateParam("style", e.target.value)}
        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white/20 transition-colors appearance-none cursor-pointer"
      >
        <option value="" className="bg-zinc-900">All styles</option>
        {DANCE_STYLES.map((s) => (
          <option key={s} value={s} className="bg-zinc-900">{s}</option>
        ))}
      </select>

      {/* Clear + count */}
      <div className="flex items-center gap-3 ml-auto shrink-0">
        {hasFilter && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
        <span className="text-xs text-white/30">
          {total} instructor{total !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
