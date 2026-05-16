"use client";

import { Bell, CheckSquare, Image, Sparkles, TrendingUp, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getTone } from "@/lib/design-system/colors";
import type { MainTabId, StackTabId } from "@/lib/types";
import { cx } from "../ui";

type FlowStep = {
  id: string;
  label: string;
  icon: LucideIcon;
  done?: boolean;
  active?: boolean;
  onPress: () => void;
};

/** Student journey: notification → task → practice → gallery → progress */
export function StudioFlowStrip({
  unreadMessages,
  openTasks,
  hasPracticeToday,
  hasGalleryClips,
  onGoMain,
  onOpenStack
}: {
  unreadMessages: number;
  openTasks: number;
  hasPracticeToday: boolean;
  hasGalleryClips: boolean;
  onGoMain: (t: MainTabId) => void;
  onOpenStack: (t: StackTabId) => void;
}) {
  const steps: FlowStep[] = [
    {
      id: "msg",
      label: "עדכון",
      icon: Bell,
      done: unreadMessages === 0,
      active: unreadMessages > 0,
      onPress: () => onGoMain("messages")
    },
    {
      id: "task",
      label: "משימה",
      icon: CheckSquare,
      done: openTasks === 0,
      active: openTasks > 0,
      onPress: () => onOpenStack("tasks_hub")
    },
    {
      id: "practice",
      label: "תרגול",
      icon: Video,
      done: hasPracticeToday,
      active: !hasPracticeToday,
      onPress: () => onOpenStack("practice_hub")
    },
    {
      id: "gallery",
      label: "גלריה",
      icon: Image,
      done: hasGalleryClips,
      onPress: () => onOpenStack("gallery")
    },
    {
      id: "progress",
      label: "התקדמות",
      icon: TrendingUp,
      onPress: () => onOpenStack("progress")
    }
  ];

  return (
    <div>
      <p className="mb-2 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">המסלול שלך</p>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar" dir="rtl">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const t = getTone(s.active ? "accent" : s.done ? "achievement" : "technique");
          return (
            <button
              key={s.id}
              type="button"
              onClick={s.onPress}
              className={cx(
                "flex min-w-[4.5rem] shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 transition active:scale-[0.98]",
                s.active ? "border-emerald-400/30 bg-emerald-500/[0.08]" : "border-white/[0.08] bg-white/[0.03]"
              )}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl border"
                style={{ borderColor: t.border, backgroundColor: t.soft }}
              >
                {s.done ? (
                  <Sparkles size={16} style={{ color: t.core }} />
                ) : (
                  <Icon size={16} style={{ color: t.core }} strokeWidth={1.75} />
                )}
              </span>
              <span className="text-[10px] font-semibold text-white/70">{s.label}</span>
              {i < steps.length - 1 ? (
                <span className="pointer-events-none absolute hidden" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
