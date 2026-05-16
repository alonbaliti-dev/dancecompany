"use client";

import { useMemo, useState } from "react";
import { Bell, ChevronLeft, ShieldAlert } from "lucide-react";
import { useCommunication } from "@/context/CommunicationContext";
import { compareFlowPriority } from "@/lib/flow-priority";
import {
  filterNotifications,
  formatNotificationTargetLabel,
  getNotificationReadRate,
  isNotificationRead,
  type NotificationFilterId
} from "@/lib/notification-logic";
import { MOCK_TODAY } from "@/lib/studio-task-logic";
import type { MainTabId, Notification, StackTabId } from "@/lib/types";
import { hubRow, surfaces } from "@/lib/design-system/tokens";
import { Card, GhostButton, Header, SectionEyebrow, SectionTitle, cx } from "./ui";

const FILTERS: { id: NotificationFilterId; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "urgent", label: "דחוף" },
  { id: "unread", label: "לא נקרא" },
  { id: "studio", label: "מהסטודיו" },
  { id: "teacher", label: "מהמורה" }
];

function priorityPill(p: Notification["priority"]) {
  if (p === "urgent") return "border-rose-400/35 bg-rose-500/14 text-rose-50";
  if (p === "important") return "border-amber-400/32 bg-amber-500/12 text-amber-50";
  return "border-white/12 bg-white/[0.06] text-white/48";
}

function NotificationRow({ n, userId, onOpen }: { n: Notification; userId: string; onOpen: () => void }) {
  const read = isNotificationRead(n, userId);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cx(
        hubRow,
        surfaces.menuRow,
        "items-start",
        !read ? "border-emerald-400/18 bg-emerald-500/[0.05]" : "border-white/[0.07] bg-white/[0.02]"
      )}
    >
      <ChevronLeft className="mt-1 shrink-0 text-white/22" size={18} />
      <span className="mt-0.5 shrink-0">
        {n.priority === "urgent" ? <ShieldAlert size={20} className="text-rose-200/85" /> : <Bell size={20} className="text-white/40" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {!read ? <span className="rounded-full bg-emerald-400/18 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">חדש</span> : null}
          <span className={cx("rounded-full border px-2 py-0.5 text-[10px] font-semibold", priorityPill(n.priority))}>
            {n.priority === "urgent" ? "דחוף" : n.priority === "important" ? "חשוב" : "רגיל"}
          </span>
          <span className="text-[10px] text-white/35">
            {new Date(n.createdAt).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })}
          </span>
        </div>
        <p className="mt-1.5 font-semibold text-white">{n.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-white/45">{n.body}</p>
        <p className="mt-1 text-[10px] text-white/32">מאת {n.createdByName}</p>
      </div>
    </button>
  );
}

function SentLogRow({ n }: { n: Notification }) {
  const rate = getNotificationReadRate(n);
  return (
    <Card animated={false} className="border-white/[0.07]">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className={cx("rounded-full border px-2 py-0.5 text-[10px] font-semibold", priorityPill(n.priority))}>
          {n.priority === "urgent" ? "דחוף" : n.priority === "important" ? "חשוב" : "רגיל"}
        </span>
        <span className="text-[10px] text-white/35">
          {new Date(n.createdAt).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })}
        </span>
      </div>
      <p className="mt-2 font-semibold text-white">{n.title}</p>
      <p className="mt-1 text-sm text-white/45">{formatNotificationTargetLabel(n)}</p>
      <p className="mt-2 text-xs text-white/38">
        נוצר ע״י {n.createdByName} · קריאה {rate.read}/{rate.total} ({rate.pct}%)
      </p>
    </Card>
  );
}

export function NotificationCenterScreen({
  onNavigate
}: {
  onNavigate: (target: { stack?: StackTabId; main?: MainTabId; chatId?: string }) => void;
}) {
  const { user, notifications, allNotifications, markNotificationRead, markAllNotificationsRead } = useCommunication();
  const [filter, setFilter] = useState<NotificationFilterId>("all");
  const [tab, setTab] = useState<"inbox" | "sent">("inbox");
  const mgmt = user.permissions.isManagement;

  const filtered = useMemo(() => filterNotifications(notifications, user, filter), [notifications, user, filter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ra = isNotificationRead(a, user.id);
      const rb = isNotificationRead(b, user.id);
      if (ra !== rb) return ra ? 1 : -1;
      const pc = compareFlowPriority(a.priority, b.priority);
      if (pc !== 0) return pc;
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
  }, [filtered, user.id]);

  const todayStart = useMemo(() => {
    const d = new Date(MOCK_TODAY);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const today = sorted.filter((n) => +new Date(n.createdAt) >= todayStart);
  const earlier = sorted.filter((n) => +new Date(n.createdAt) < todayStart);

  const sentLog = useMemo(
    () =>
      [...allNotifications].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [allNotifications]
  );

  const openNotification = (n: Notification) => {
    markNotificationRead(n.id);
    if (n.relatedType === "chat" && n.relatedId) {
      onNavigate({ stack: "group_chats", chatId: n.relatedId });
      return;
    }
    if (n.relatedType === "gallery") {
      onNavigate({ stack: "gallery" });
      return;
    }
    if (n.relatedType === "task") {
      onNavigate({ stack: "tasks_hub" });
      return;
    }
    if (n.relatedType === "attendance") {
      onNavigate({ stack: "attendance" });
      return;
    }
    onNavigate({ main: "messages" });
  };

  const hasUnread = notifications.some((n) => !isNotificationRead(n, user.id));

  return (
    <div className="space-y-8 pb-6">
      <Header title="מרכז התראות" subtitle="עדכונים רלוונטיים אליך — דחופים תמיד למעלה." />

      {mgmt ? (
        <div className="flex rounded-2xl border border-white/[0.1] bg-black/35 p-1">
          <button type="button" onClick={() => setTab("inbox")} className={cx("flex-1 rounded-xl py-2 text-sm font-semibold", tab === "inbox" ? "bg-white/12 text-white" : "text-white/45")}>תיבת נכנס</button>
          <button type="button" onClick={() => setTab("sent")} className={cx("flex-1 rounded-xl py-2 text-sm font-semibold", tab === "sent" ? "bg-white/12 text-white" : "text-white/45")}>נשלחו</button>
        </div>
      ) : null}

      {(tab === "inbox" || !mgmt) ? (
        <div className="flex flex-wrap justify-end gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cx(
                "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition",
                filter === f.id ? "border-emerald-400/30 bg-emerald-500/12 text-emerald-50" : "border-white/10 bg-white/[0.03] text-white/45"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : null}

      {tab === "inbox" ? (
        <>
          {hasUnread ? (
            <GhostButton className="w-full !text-[12px]" onClick={markAllNotificationsRead}>
              סימון הכל כנקרא
            </GhostButton>
          ) : null}

          <div>
            <SectionEyebrow>היום</SectionEyebrow>
            <div className="mt-3 space-y-2">
              {today.length === 0 ? (
                <Card animated={false}>
                  <p className="py-6 text-center text-sm text-white/38">אין התראות היום.</p>
                </Card>
              ) : (
                today.map((n) => <NotificationRow key={n.id} n={n} userId={user.id} onOpen={() => openNotification(n)} />)
              )}
            </div>
          </div>

          <div>
            <SectionEyebrow>מוקדם יותר</SectionEyebrow>
            <div className="mt-3 space-y-2">
              {earlier.length === 0 ? (
                <Card animated={false}>
                  <p className="py-6 text-center text-sm text-white/38">אין פריטים בארכיון.</p>
                </Card>
              ) : (
                earlier.map((n) => <NotificationRow key={n.id} n={n} userId={user.id} onOpen={() => openNotification(n)} />)
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {sentLog.length === 0 ? (
            <Card animated={false}>
              <p className="py-8 text-center text-sm text-white/40">אין עדיין התראות שנשלחו.</p>
            </Card>
          ) : (
            sentLog.map((n) => <SentLogRow key={n.id} n={n} />)
          )}
        </div>
      )}
    </div>
  );
}
