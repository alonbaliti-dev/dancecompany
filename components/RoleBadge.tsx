"use client";

import { getRoleLabel, resolveRoleTier, type RoleTier } from "@/lib/role-ui";
import type { UserProfile } from "@/lib/types";
import { cx } from "./ui";

const TONE: Record<RoleTier, string> = {
  platform: "border-violet-400/25 bg-violet-500/[0.12] text-violet-100/95",
  management: "border-amber-400/22 bg-amber-500/[0.1] text-amber-100/95",
  teacher: "border-emerald-400/22 bg-emerald-500/[0.1] text-emerald-100/95",
  student: "border-sky-400/20 bg-sky-500/[0.08] text-sky-100/90",
  parent: "border-rose-400/20 bg-rose-500/[0.08] text-rose-100/90"
};

export function RoleBadge({ user, className }: { user: Pick<UserProfile, "permissions" | "isParent">; className?: string }) {
  const tier = resolveRoleTier(user);
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide",
        TONE[tier],
        className
      )}
    >
      {getRoleLabel(user)}
    </span>
  );
}
