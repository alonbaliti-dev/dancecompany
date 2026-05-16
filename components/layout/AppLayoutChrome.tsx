"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { MainTabDefinition, MainTabId } from "@/lib/types";
import type { TabBadges } from "../navigation/BottomNav";
import { BottomNav } from "../navigation/BottomNav";
import { SideNav } from "./SideNav";
import { useDeviceLayout } from "@/context/DeviceLayoutContext";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cx } from "../ui";

export type AppLayoutChromeProps = {
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  installHint?: ReactNode;
  previewBar?: ReactNode;
  mainTab: MainTabId;
  tabs: MainTabDefinition[];
  tabBadges: TabBadges;
  onTabChange: (id: MainTabId) => void;
  brandStyle?: React.CSSProperties;
};

const shellTransition = { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const };

export function AppLayoutChrome({
  header,
  children,
  footer,
  installHint,
  previewBar,
  mainTab,
  tabs,
  tabBadges,
  onTabChange,
  brandStyle
}: AppLayoutChromeProps) {
  const { layoutMode, snapshot, mounted } = useDeviceLayout();
  const reducedMotion = useReducedMotion();
  const isPwa = snapshot.runtime === "pwa" || snapshot.runtime === "native_shell";

  const shellClass = cx(
    "app-canvas-glow flex w-full flex-col",
    layoutMode === "mobile" && "mx-auto max-w-md min-h-app pb-nav-safe pt-safe",
    layoutMode === "tablet" && "mx-auto min-h-app w-full pb-nav-safe pt-safe",
    layoutMode === "desktop" && "min-h-app min-w-0 flex-1",
    isPwa && "px-safe"
  );

  const content = (
    <>
      {installHint}
      {header}
      <main
        className={cx(
          "relative z-10 flex-1 scroll-touch",
          layoutMode === "mobile" && "px-5",
          layoutMode === "tablet" && "px-6 lg:px-8",
          layoutMode === "desktop" && "px-8 py-2"
        )}
      >
        <motion.div
          className={cx(
            layoutMode === "tablet" && "mx-auto max-w-4xl",
            layoutMode === "desktop" && "mx-auto w-full max-w-6xl",
            layoutMode === "tablet" &&
              ["messages", "shop", "lessons"].includes(mainTab) &&
              "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-8 lg:items-start"
          )}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : shellTransition}
        >
          {children}
        </motion.div>
      </main>
      {footer}
    </>
  );

  if (!mounted) {
    return (
      <motion.div className={shellClass} dir="rtl" style={brandStyle}>
        {content}
        <BottomNav tabs={tabs} active={mainTab} badges={tabBadges} onChange={onTabChange} />
      </motion.div>
    );
  }

  if (layoutMode === "desktop") {
    return (
      <div className="flex min-h-app flex-col" dir="rtl" style={brandStyle}>
        {previewBar}
        <div className="flex min-h-0 flex-1">
          <SideNav tabs={tabs} active={mainTab} badges={tabBadges} onChange={onTabChange} variant="sidebar" />
          <div className={cx(shellClass, isPwa && "pt-safe")}>{content}</div>
        </div>
      </div>
    );
  }

  if (layoutMode === "tablet") {
    const useSideRail = snapshot.viewportWidth >= 900;
    return (
      <div className="flex min-h-app flex-col" dir="rtl" style={brandStyle}>
        {previewBar}
        <motion.div
          className={cx(shellClass, useSideRail ? "max-w-none" : "max-w-3xl")}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : shellTransition}
        >
          <div className={cx("flex min-h-0 flex-1", useSideRail && "flex-row")}>
            {useSideRail ? (
              <SideNav tabs={tabs} active={mainTab} badges={tabBadges} onChange={onTabChange} variant="rail" />
            ) : null}
            <div className="flex min-w-0 flex-1 flex-col">{content}</div>
          </div>
          {!useSideRail ? <BottomNav tabs={tabs} active={mainTab} badges={tabBadges} onChange={onTabChange} /> : null}
        </motion.div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={brandStyle}>
      {previewBar}
      <motion.div
        className={shellClass}
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reducedMotion ? { duration: 0 } : shellTransition}
      >
        {content}
        <BottomNav tabs={tabs} active={mainTab} badges={tabBadges} onChange={onTabChange} />
      </motion.div>
    </div>
  );
}
