"use client";

import { motion } from "framer-motion";
import type { MainTabBadgeKey, MainTabDefinition, MainTabId } from "@/lib/types";
import { getTone } from "@/lib/design-system/colors";
import { spring } from "@/lib/design-system/motion";
import { surfaces } from "@/lib/design-system/tokens";
import { cx } from "../ui";

const navAccent = getTone("accent");

export type TabBadges = Partial<Record<MainTabBadgeKey, number>>;

export function BottomNav({
  tabs,
  active,
  badges = {},
  onChange
}: {
  tabs: MainTabDefinition[];
  active: MainTabId;
  badges?: TabBadges;
  onChange: (id: MainTabId) => void;
}) {
  const layoutGroup = tabs.map((t) => t.id).join("-");

  return (
    <nav
      className="nav-fixed-layer pointer-events-auto mx-auto max-w-md px-4 pb-safe pt-2"
      dir="rtl"
      aria-label="ניווט ראשי"
    >
      <motion.div className={cx("premium-nav-pill rounded-[1.5rem] p-1.5", surfaces.chrome)}>
        <div className="grid grid-cols-5 gap-0.5">
          {tabs.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            const badge = item.badgeKey ? badges[item.badgeKey] : 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                className="relative flex min-h-[3.25rem] min-w-[2.75rem] touch-manipulation flex-col items-center justify-center gap-0.5 rounded-[14px] py-2.5 transition-colors active:bg-white/[0.08] active:opacity-95"
                aria-current={isActive ? "page" : undefined}
              >
                {isActive ? (
                  <motion.div
                    layoutId={`lk-nav-pill-${layoutGroup}`}
                    className="absolute inset-0 rounded-[14px] bg-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
                    transition={spring.nav}
                  />
                ) : null}
                <span className="relative z-10 flex flex-col items-center gap-0.5">
                  <span className="relative">
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.35 : 1.65}
                      style={isActive ? { color: navAccent.core } : undefined}
                      className={isActive ? undefined : "text-white/34"}
                    />
                    {badge && badge > 0 ? (
                      <span className="absolute -top-1 -left-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={cx(
                      "max-w-[4.2rem] truncate text-[9.5px] font-semibold leading-tight",
                      isActive ? "text-white" : "text-white/34"
                    )}
                  >
                    {item.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
}
