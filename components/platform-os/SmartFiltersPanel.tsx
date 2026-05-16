"use client";

import { useMemo } from "react";
import { runSmartFilters } from "@/lib/services/smart-filters-service";
import type { UserProfile } from "@/lib/types";
import { SectionEyebrow } from "../ui";

export function SmartFiltersPanel({ user, studioId }: { user: UserProfile; studioId: string }) {
  const filters = useMemo(() => runSmartFilters(user, studioId), [user, studioId]);

  if (filters.length === 0) return null;

  return (
    <div>
      <SectionEyebrow>מסננים חכמים</SectionEyebrow>
      <div className="mt-2 flex flex-wrap gap-2 justify-end">
        {filters.map((f) => (
          <span
            key={f.id}
            className={`rounded-full border px-3 py-1 text-xs ${
              f.count > 0
                ? "border-amber-400/30 bg-amber-500/10 text-amber-100/90"
                : "border-white/10 text-white/40"
            }`}
          >
            {f.labelHe}
            {f.count > 0 ? ` (${f.count})` : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
