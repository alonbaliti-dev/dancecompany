"use client";

import { useMemo } from "react";
import { ChevronLeft, MessageCircle, Pin } from "lucide-react";
import { useCommunication } from "@/context/CommunicationContext";
import { isStaffChat, primaryTeacherNameForChat } from "@/lib/communication-permissions";
import type { DanceGroupChat } from "@/lib/types";
import { Card, Header } from "./ui";

function lastMessagePreview(chatId: string, getMessagesForChat: (id: string) => { body: string; createdAt: string; moderationStatus: string }[]) {
  const msgs = getMessagesForChat(chatId).filter((m) => m.moderationStatus === "visible");
  const last = msgs[msgs.length - 1];
  if (!last) return { text: "אין הודעות עדיין", time: "" };
  return {
    text: last.body.length > 56 ? `${last.body.slice(0, 56)}…` : last.body,
    time: new Date(last.createdAt).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })
  };
}

export function GroupChatsListScreen({
  onOpenChat,
  onSendUpdate
}: {
  onOpenChat: (chatId: string) => void;
  onSendUpdate?: () => void;
}) {
  const { accessibleChats, getMessagesForChat, getUnreadCountForChat, canSendUpdate } = useCommunication();

  const enriched = useMemo(() => {
    return accessibleChats.map((chat) => ({
      chat,
      unread: getUnreadCountForChat(chat.id),
      preview: lastMessagePreview(chat.id, getMessagesForChat),
      hasPinned: chat.pinnedMessageIds.length > 0
    }));
  }, [accessibleChats, getMessagesForChat, getUnreadCountForChat]);

  const staff = enriched.filter((e) => isStaffChat(e.chat));
  const groups = enriched.filter((e) => !isStaffChat(e.chat));

  return (
    <div className="space-y-8 pb-6">
      <Header
        title="צ׳אט קבוצות"
        subtitle="מרחב עבודה לתרגול, שאלות טכניות ועדכוני קבוצה — לא צ׳אט חברתי."
      />

      {canSendUpdate && onSendUpdate ? (
        <button
          type="button"
          onClick={onSendUpdate}
          className="w-full rounded-[18px] border border-emerald-400/20 bg-emerald-500/[0.08] px-4 py-3.5 text-right transition hover:bg-emerald-500/[0.12]"
        >
          <p className="text-sm font-semibold text-emerald-100">שליחת עדכון לתלמידים / קבוצה</p>
          <p className="mt-1 text-xs text-white/42">נשלח גם כהתראה באפליקציה</p>
        </button>
      ) : null}

      {staff.length ? (
        <div>
          <p className="mb-2 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">צוות הסטודיו</p>
          <div className="space-y-2.5">{staff.map(({ chat, unread, preview, hasPinned }) => (
            <ChatListCard key={chat.id} chat={chat} unread={unread} preview={preview} hasPinned={hasPinned} onOpen={() => onOpenChat(chat.id)} />
          ))}</div>
        </div>
      ) : null}
      <div>
        <p className="mb-2 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">קבוצות ריקוד</p>
        <div className="space-y-2.5">
        {groups.length === 0 && !staff.length ? (
          <Card animated={false}>
            <p className="py-8 text-center text-sm text-white/40">אין קבוצות משויכות לחשבון זה.</p>
          </Card>
        ) : (
          groups.map(({ chat, unread, preview, hasPinned }) => (
            <ChatListCard key={chat.id} chat={chat} unread={unread} preview={preview} hasPinned={hasPinned} onOpen={() => onOpenChat(chat.id)} />
          ))
        )}
        </div>
      </div>
    </div>
  );
}

function ChatListCard({
  chat,
  unread,
  preview,
  hasPinned,
  onOpen
}: {
  chat: DanceGroupChat;
  unread: number;
  preview: { text: string; time: string };
  hasPinned: boolean;
  onOpen: () => void;
}) {
  const teacher = primaryTeacherNameForChat(chat);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center justify-between gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.03] px-4 py-4 text-right transition hover:border-white/[0.12] hover:bg-white/[0.05]"
    >
      <ChevronLeft className="shrink-0 text-white/22" size={20} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-end gap-2">
          {hasPinned ? <Pin size={14} className="text-amber-200/80" /> : null}
          <p className="font-semibold text-white">{chat.groupName}</p>
        </div>
        <p className="mt-1 text-xs text-white/40">{isStaffChat(chat) ? "תיאום פנימי — מורים והנהלה" : `מורה: ${teacher}`}</p>
        <p className="mt-2 line-clamp-2 text-sm text-white/50">{preview.text}</p>
        {preview.time ? <p className="mt-1 text-[10px] text-white/32">{preview.time}</p> : null}
      </div>
      <div className="flex shrink-0 flex-col items-center gap-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/25">
          <MessageCircle className="text-emerald-200/85" size={22} />
        </span>
        {unread > 0 ? (
          <span className="min-w-[1.25rem] rounded-full bg-emerald-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>
        ) : null}
      </div>
    </button>
  );
}
