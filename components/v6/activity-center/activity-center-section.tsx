"use client";

import type { ElementType } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  MessageCircle,
  Receipt,
  Shield,
  Sparkles
} from "lucide-react";
import {
  MobileListRow,
  MobileSection,
  SafeMeta,
  SafeTitle,
  v6Cx,
  v6Lovable,
  v6Motion,
  type V6Tone
} from "@/components/v6/design-system";
import { V6_ACTIVITY_COPY } from "@/lib/v6/activity-center/copy";
import { selectV6ActivityItemNavigation } from "@/lib/v6/activity-center/selectors";
import type { V6ActivityCategory, V6ActivityCenterViewModel, V6ActivityItem } from "@/lib/v6/activity-center/types";
import type { V6Screen, V6Tab } from "@/lib/v6/types";

const ACTIVITY_ICONS: Record<V6ActivityCategory, ElementType> = {
  announcement: Bell,
  message: MessageCircle,
  schedule: CalendarDays,
  attendance: CheckCircle2,
  class: Sparkles,
  event: CalendarDays,
  commerce: Receipt,
  system: Shield
};

function renderActivityIcon(category: V6ActivityCategory) {
  const Icon = ACTIVITY_ICONS[category];
  return <Icon size={15} strokeWidth={1.9} aria-hidden="true" />;
}

function severityLabel(item: V6ActivityItem) {
  if (item.severity === "critical") return "דחוף";
  if (item.severity === "important" && !item.isRead) return "חשוב";
  return item.meta;
}

export function ActivityEmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className={v6Cx(v6Lovable.card, "rounded-2xl p-4 text-start")} role="status">
      <SafeTitle as="p" className="text-sm font-semibold tracking-[-0.014em] text-white/82">{title}</SafeTitle>
      <SafeMeta as="p" className="mt-1.5 text-xs leading-relaxed text-white/46">{description}</SafeMeta>
    </div>
  );
}

export function ActivityCenterRow({
  item,
  onOpen,
  compact = false
}: {
  item: V6ActivityItem;
  onOpen?: (item: V6ActivityItem) => void;
  compact?: boolean;
}) {
  const unread = !item.isRead;
  const Icon = ACTIVITY_ICONS[item.category];

  if (compact) {
    return (
      <MobileListRow
        icon={Icon}
        title={item.title}
        subtitle={item.body}
        meta={severityLabel(item)}
        tone={item.tone}
        onClick={onOpen ? () => onOpen(item) : undefined}
        ariaLabel={`פתיחת פעילות: ${item.title}`}
      />
    );
  }

  return (
    <button
      type="button"
      dir="rtl"
      onClick={onOpen ? () => onOpen(item) : undefined}
      aria-label={`פתיחת פעילות: ${item.title}`}
      className={v6Cx(
        "glass grid w-full grid-cols-[auto_1fr_auto] items-center gap-2.5 rounded-2xl px-3 py-2.5 text-start",
        v6Motion.standard,
        v6Motion.pressSoft,
        v6Motion.focusRing,
        "touch-manipulation",
        unread && "ring-1 ring-rose-200/20",
        onOpen && "motion-safe:hover:bg-white/[0.034]"
      )}
    >
      <span className={v6Cx("relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl", unread ? "bg-rose-400/12 text-rose-100" : "bg-white/[0.050] text-white/60")}>
        {unread ? <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-rose-200" aria-hidden="true" /> : null}
        {renderActivityIcon(item.category)}
      </span>
      <span className="min-w-0">
        <SafeTitle as="span" className="block truncate text-sm font-semibold tracking-[-0.012em] text-white/90">{item.title}</SafeTitle>
        <SafeMeta as="span" className="mt-0.5 block truncate text-[12px] text-white/48">{item.body}</SafeMeta>
      </span>
      <SafeMeta as="span" className={v6Cx("min-w-0 shrink-0 text-[11px] font-medium", unread ? "text-rose-100/72" : "text-white/40")}>
        {severityLabel(item)}
      </SafeMeta>
    </button>
  );
}

export function RecentActivitySection({
  kicker,
  title,
  tone = "studio",
  items,
  unreadCount,
  emptyTitle,
  emptyDescription,
  onOpenItem,
  onOpenCenter,
  viewAllLabel = V6_ACTIVITY_COPY.viewAll
}: {
  kicker?: string;
  title: string;
  tone?: V6Tone;
  items: V6ActivityItem[];
  unreadCount?: number;
  emptyTitle: string;
  emptyDescription: string;
  onOpenItem: (item: V6ActivityItem) => void;
  onOpenCenter?: () => void;
  viewAllLabel?: string;
}) {
  return (
    <MobileSection kicker={kicker ?? (unreadCount ? V6_ACTIVITY_COPY.unreadKicker(unreadCount) : V6_ACTIVITY_COPY.calmKicker)} title={title} tone={tone}>
      {items.length ? (
        <div className="flex flex-col gap-1.5">
          {items.map((item) => (
            <ActivityCenterRow key={item.id} item={item} onOpen={onOpenItem} />
          ))}
          {onOpenCenter ? (
            <button
              type="button"
              onClick={onOpenCenter}
              className={v6Cx(
                "mt-1 min-h-9 rounded-full px-3 text-[11px] font-semibold text-white/58",
                v6Motion.standard,
                v6Motion.focusRing,
                "touch-manipulation motion-safe:hover:text-white/76"
              )}
            >
              {viewAllLabel}
            </button>
          ) : null}
        </div>
      ) : (
        <ActivityEmptyPanel title={emptyTitle} description={emptyDescription} />
      )}
    </MobileSection>
  );
}

export function ActivityCenterPanel({
  viewModel,
  onOpenItem,
  onMarkAllRead,
  showMarkAllRead = true
}: {
  viewModel: V6ActivityCenterViewModel;
  onOpenItem: (item: V6ActivityItem) => void;
  onMarkAllRead?: () => void;
  showMarkAllRead?: boolean;
}) {
  const unreadGroups = viewModel.groups.filter((group) => group.unreadCount > 0);

  return (
    <div className="flex flex-col gap-5 px-5 pt-1">
      <section dir="rtl" className={v6Cx(v6Lovable.cardStrong, "overflow-hidden p-5 text-start")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SafeMeta as="p" className={v6Cx("text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40") }>{V6_ACTIVITY_COPY.centerKicker}</SafeMeta>
            <SafeTitle as="h1" className="mt-1.5 text-lg font-semibold tracking-tight text-white/92">{V6_ACTIVITY_COPY.centerTitle}</SafeTitle>
            <SafeMeta as="p" className="mt-1.5 text-sm leading-relaxed text-white/48">
              {viewModel.unreadCount ? V6_ACTIVITY_COPY.needsAttention(viewModel.unreadCount) : V6_ACTIVITY_COPY.calmStatus}
            </SafeMeta>
          </div>
          {showMarkAllRead && onMarkAllRead && viewModel.unreadCount ? (
            <button
              type="button"
              onClick={onMarkAllRead}
              className={v6Cx(
                "shrink-0 rounded-full bg-[#f4d58d] px-3 py-1.5 text-[11px] font-semibold text-zinc-950",
                v6Motion.standard,
                v6Motion.pressSoft,
                v6Motion.focusRing,
                "touch-manipulation"
              )}
            >
              {V6_ACTIVITY_COPY.markAllRead}
            </button>
          ) : null}
        </div>
      </section>

      {unreadGroups.length ? (
        <section dir="rtl" className="flex flex-col gap-3">
          <SafeMeta as="p" className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">דורש תשומת לב</SafeMeta>
          {unreadGroups.map((group) => (
            <section key={group.category} className={v6Cx(v6Lovable.card, "rounded-2xl p-4")}>
              <SafeMeta as="p" className="px-1 text-[11px] font-semibold text-white/46">{group.label}</SafeMeta>
              <div className="mt-2 flex flex-col gap-1.5">
                {group.items
                  .filter((item) => !item.isRead)
                  .slice(0, 6)
                  .map((item) => (
                    <ActivityCenterRow key={item.id} item={item} onOpen={onOpenItem} />
                  ))}
              </div>
            </section>
          ))}
        </section>
      ) : null}

      {viewModel.groups.map((group) => (
        <section key={group.category} dir="rtl" className={v6Cx(v6Lovable.card, "rounded-2xl p-4")}>
          <div className="flex items-center justify-between gap-2 px-1">
            <SafeTitle as="h2" className={v6Lovable.sectionTitle}>{group.label}</SafeTitle>
            {group.unreadCount ? <SafeMeta as="span" className="text-[11px] font-semibold text-[#f4d58d]">{V6_ACTIVITY_COPY.unreadKicker(group.unreadCount)}</SafeMeta> : null}
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {group.items.length ? (
              group.items.slice(0, 8).map((item) => <ActivityCenterRow key={item.id} item={item} onOpen={onOpenItem} />)
            ) : (
              <ActivityEmptyPanel title="אין פריטים" description="בקטגוריה הזו אין עדכונים כרגע." />
            )}
          </div>
        </section>
      ))}

      {!viewModel.groups.length ? (
        <ActivityEmptyPanel title="אין פעילות להצגה" description="כשיהיו הודעות, שינויי לוח, תזכורות נוכחות או אירועים — הם יופיעו כאן בצורה מסודרת." />
      ) : null}
    </div>
  );
}

export function useV6ActivityNavigationHandlers(openTab: (tab: V6Tab) => void, openScreen: (screen: V6Screen) => void) {
  return {
    openActivityItem(item: V6ActivityItem) {
      const target = selectV6ActivityItemNavigation(item);
      if (target.screen) {
        openScreen(target.screen);
        return;
      }
      openTab(target.tab ?? "messages");
    },
    openActivityCenter() {
      openTab("messages");
    }
  };
}
