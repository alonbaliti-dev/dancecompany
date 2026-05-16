"use client";

import { motion } from "framer-motion";
import type { MainTabDefinition, MainTabId } from "@/lib/types";
import { getTone } from "@/lib/theme/semantic-tokens";
import type { TabBadges } from "../navigation/BottomNav";
import { cx } from "../ui";

const navAccent = getTone("accent");

export function SideNav({
  tabs,
  active,
  badges = {},
  onChange,
  variant
}: {
  tabs: MainTabDefinition[];
  active: MainTabId;
  badges?: TabBadges;
  onChange: (id: MainTabId) => void;
  variant: "sidebar" | "rail";
}) {
  const isSidebar = variant === "sidebar";

  return (
    <nav
      className={cx(
        "surface-chrome shrink-0 border-white/[0.08]",
        isSidebar
          ? "header-sticky-layer flex min-h-app w-[15.5rem] flex-col border-l py-6 pe-3 ps-4 pt-safe"
          : "flex w-[4.75rem] flex-col items-center gap-1 border-l py-4 pe-2 ps-2"
      )}
      dir="rtl"
      aria-label="ניווט ראשי"
    >
      <p
        className={cx(
          "font-semibold uppercase tracking-[0.14em] text-white/35",
          isSidebar ? "mb-6 px-2 text-[10px]" : "mb-4 text-[9px]"
        )}
      >
        {isSidebar ? "ניווט" : "·"}
      </p>
      <div className={cx("flex flex-1 flex-col gap-1", !isSidebar && "w-full items-center")}>
        {tabs.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          const badge = item.badgeKey ? badges[item.badgeKey] : 0;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cx(
                "relative flex items-center gap-3 rounded-[14px] transition-colors",
                isSidebar ? "w-full px-3 py-2.5 text-right" : "flex-col justify-center px-2 py-2.5",
                isActive ? "bg-white/[0.1]" : "hover:bg-white/[0.05]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive ? (
                <motion.div
                  layoutId={`lk-side-nav-${variant}`}
                  className="absolute inset-0 rounded-[14px] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className="relative z-10 flex shrink-0 items-center">
                <Icon
                  size={isSidebar ? 20 : 22}
                  strokeWidth={isActive ? 2.35 : 1.65}
                  style={isActive ? { color: navAccent.core } : undefined}
                  className={isActive ? undefined : "text-white/38"}
                />
                {badge && badge > 0 ? (
                  <span className="absolute -top-1 -left-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                    {badge > 9 ? "9+" : badge}
                  </span>
                ) : null}
              </span>
              {isSidebar ? (
                <span
                  className={cx(
                    "relative z-10 flex-1 text-[13px] font-semibold",
                    isActive ? "text-white" : "text-white/45"
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <span
                  className={cx(
                    "relative z-10 mt-1 max-w-[3.5rem] truncate text-center text-[9px] font-semibold leading-tight",
                    isActive ? "text-white" : "text-white/38"
                  )}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
