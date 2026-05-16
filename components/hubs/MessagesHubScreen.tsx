"use client";

import { useMemo } from "react";
import { Bell, MessageCircle, Send } from "lucide-react";
import { useCommunication } from "@/context/CommunicationContext";
import { useStudioData } from "@/context/StudioDataContext";
import { compareUpdatesForInbox } from "@/lib/flow-priority";
import type { UserProfile } from "@/lib/types";
import { updateVisibleToStudent } from "@/lib/studio-task-logic";
import { CollapsibleSection } from "../ui/CollapsibleSection";
import { EmptyState, Header, HubLinkRow, HubTile, screenClass } from "../ui";

export function MessagesHubScreen({
  user,
  onOpenNotifications,
  onOpenChats,
  onOpenSendUpdate
}: {
  user: UserProfile;
  onOpenNotifications: () => void;
  onOpenChats: () => void;
  onOpenSendUpdate?: () => void;
}) {
  const { updates, markUpdateRead } = useStudioData();
  const { unreadNotificationCount, accessibleChats, getUnreadCountForChat } = useCommunication();

  const chatUnread = useMemo(
    () => accessibleChats.reduce((sum, c) => sum + getUnreadCountForChat(c.id), 0),
    [accessibleChats, getUnreadCountForChat]
  );

  const recentUpdates = useMemo(
    () =>
      updates
        .filter((u) => updateVisibleToStudent(u, user))
        .sort((a, b) => compareUpdatesForInbox(a, b, user.id))
        .slice(0, 3),
    [updates, user]
  );

  const unreadUpdates = recentUpdates.filter((u) => !u.readByUserIds.includes(user.id)).length;

  return (
    <div className={screenClass}>
      <Header title="הודעות" subtitle="מה חשוב לדעת עכשיו — בלי רעש מיותר." />

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <HubTile
          icon={Bell}
          title="התראות"
          subtitle={unreadNotificationCount > 0 ? `${unreadNotificationCount} חדשות` : "הכול נקרא"}
          badge={unreadNotificationCount}
          onClick={onOpenNotifications}
          tone="info"
        />
        <HubTile
          icon={MessageCircle}
          title="צ׳אטים"
          subtitle={chatUnread > 0 ? `${chatUnread} הודעות חדשות` : "שיחות הקבוצה"}
          badge={chatUnread}
          onClick={onOpenChats}
          tone="accent"
        />
      </div>

      {onOpenSendUpdate ? (
        <HubLinkRow icon={Send} title="שליחת עדכון" subtitle="לקבוצה או לתלמידים" onClick={onOpenSendUpdate} tone="teacher" />
      ) : null}

      <CollapsibleSection title="עדכוני סטודיו" count={unreadUpdates} defaultOpen={unreadUpdates > 0}>
        {recentUpdates.length === 0 ? (
          <EmptyState title="אין עדכונים" description="כשתגיע הודעה מהסטודיו — תופיע כאן." tone="info" />
        ) : (
          recentUpdates.map((u) => {
            const unread = !u.readByUserIds.includes(user.id);
            return (
              <HubLinkRow
                key={u.id}
                icon={Bell}
                title={u.title}
                subtitle={`${unread ? "חדש · " : ""}${u.createdByName}`}
                onClick={() => {
                  if (unread) markUpdateRead(u.id);
                  onOpenNotifications();
                }}
                tone={unread ? "accent" : "info"}
              />
            );
          })
        )}
      </CollapsibleSection>
    </div>
  );
}
