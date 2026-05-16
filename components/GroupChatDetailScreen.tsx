"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MoreVertical, Pin, Play } from "lucide-react";
import { useCommunication } from "@/context/CommunicationContext";
import { BottomSheet } from "./BottomSheet";
import { isStaffChat } from "@/lib/communication-permissions";
import type { ChatMessage, DanceGroupChat } from "@/lib/types";
import { SaveToGallerySheet } from "./SaveToGallerySheet";
import { GhostButton, Header, PrimaryButton, cx } from "./ui";


function formatTimeLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("he-IL", { weekday: "short", day: "numeric", month: "short" });
}

function groupMessagesByTime(messages: ChatMessage[]): { label: string; items: ChatMessage[] }[] {
  const buckets = new Map<string, ChatMessage[]>();
  for (const m of messages) {
    const label = formatTimeLabel(m.createdAt);
    const arr = buckets.get(label) ?? [];
    arr.push(m);
    buckets.set(label, arr);
  }
  return [...buckets.entries()].map(([label, items]) => ({ label, items }));
}

function StaffChatNotice() {
  return (
    <p className="rounded-[14px] border border-sky-400/15 bg-sky-500/[0.06] px-3 py-2.5 text-center text-[12px] leading-relaxed text-sky-100/75">
      ערוץ פנימי למורים והנהלה בלבד — לא נגיש לתלמידים.
    </p>
  );
}

function DanceChatNotice() {
  return (
    <p className="rounded-[14px] border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-center text-[12px] leading-relaxed text-white/42">
      הצ׳אט מיועד לתכני ריקוד, תרגול ועדכוני קבוצה בלבד.
    </p>
  );
}

function MessageBubble({
  m,
  own,
  replyTo,
  onMenu
}: {
  m: ChatMessage;
  own: boolean;
  replyTo?: ChatMessage;
  onMenu?: () => void;
}) {
  const isVideo = m.messageType === "video";
  const isFeedback = m.messageType === "teacher_feedback";

  return (
    <div className={cx("flex w-full", own ? "justify-start" : "justify-end")}>
      <div
        className={cx(
          "relative max-w-[88%] rounded-[18px] border px-3.5 py-3 text-right",
          own ? "border-emerald-400/22 bg-emerald-500/[0.12]" : "border-white/[0.08] bg-white/[0.05]",
          isFeedback && "border-sky-400/20 bg-sky-500/[0.08]"
        )}
      >
        {onMenu ? (
          <button type="button" onClick={onMenu} className="absolute left-2 top-2 text-white/35 hover:text-white/60" aria-label="תפריט">
            <MoreVertical size={16} />
          </button>
        ) : null}
        <p className="text-[10px] font-semibold text-white/40">
          {m.senderName} · {m.senderRoleLabel}
        </p>
        {replyTo ? (
          <div className="mt-2 rounded-xl border border-white/[0.08] bg-black/25 px-2.5 py-2">
            <p className="text-[10px] text-white/35">בתגובה ל{replyTo.senderName}</p>
            <p className="mt-1 line-clamp-2 text-xs text-white/55">{replyTo.body}</p>
          </div>
        ) : null}
        {isVideo ? (
          <div className="mt-2 overflow-hidden rounded-xl border border-white/[0.1] bg-black/30">
            <div className="flex aspect-video items-center justify-center bg-gradient-to-b from-white/[0.06] to-transparent">
              <Play className="text-emerald-200/80" size={32} />
            </div>
            <p className="px-3 py-2 text-sm text-white/70">{m.body}</p>
          </div>
        ) : (
          <p className="mt-1.5 text-[15px] leading-relaxed text-white/85">{m.body}</p>
        )}
        <p className="mt-2 text-[10px] text-white/30">{formatTimeLabel(m.createdAt)}</p>
      </div>
    </div>
  );
}

export function GroupChatDetailScreen({ chat }: { chat: DanceGroupChat }) {
  const {
    user,
    getMessagesForChat,
    sendChatMessage,
    setChatSeen,
    canModerate,
    canRemove,
    canManageGallery,
    pinMessage,
    unpinMessage,
    removeMessage,
    markMessageReviewed
  } = useCommunication();

  const [text, setText] = useState("");
  const [menuMsgId, setMenuMsgId] = useState<string | null>(null);
  const [attachSheet, setAttachSheet] = useState(false);
  const [saveGalleryOpen, setSaveGalleryOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(() => getMessagesForChat(chat.id), [getMessagesForChat, chat.id]);
  const pinned = useMemo(
    () => messages.filter((m) => chat.pinnedMessageIds.includes(m.id) || m.isPinned),
    [messages, chat.pinnedMessageIds]
  );
  const grouped = useMemo(
    () => groupMessagesByTime(messages.filter((m) => !chat.pinnedMessageIds.includes(m.id) && !m.isPinned)),
    [messages, chat.pinnedMessageIds]
  );

  useEffect(() => { setChatSeen(chat.id); }, [chat.id, setChatSeen]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const isOwn = (m: ChatMessage) => m.senderUserId === user.id;
  const moderate = canModerate(chat);
  const staffChat = isStaffChat(chat);
  const menuMsg = messages.find((m) => m.id === menuMsgId);
  const canSaveGallery =
    canManageGallery &&
    menuMsg &&
    (menuMsg.messageType === "video" || menuMsg.messageType === "text" || menuMsg.messageType === "teacher_feedback");

  const sendText = () => {
    const body = text.trim();
    if (!body) return;
    sendChatMessage({ groupChatId: chat.id, messageType: "text", body });
    setText("");
  };
  const sendNote = () => {
    const body = text.trim();
    if (!body) return;
    sendChatMessage({ groupChatId: chat.id, messageType: "note", body });
    setText("");
  };
  const sendVideo = () => {
    sendChatMessage({
      groupChatId: chat.id,
      messageType: "video",
      body: text.trim() || "העלאת תרגול לקבוצה",
      videoUrl: `mock://upload/${Date.now()}.mp4`
    });
    setText("");
    setAttachSheet(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-[calc(var(--nav-offset)+9rem)]">
      <Header title={chat.groupName} subtitle={staffChat ? "תיאום צוות · הערות פנימיות" : "תרגול · שאלות · עדכוני קבוצה"} />
      {staffChat ? <StaffChatNotice /> : <DanceChatNotice />}
      {pinned.length > 0 ? (
        <div className="space-y-2 rounded-[18px] border border-amber-400/18 bg-amber-500/[0.06] p-3">
          <div className="flex items-center justify-end gap-2 text-amber-100/90">
            <Pin size={14} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">הודעה נעוצה</span>
          </div>
          {pinned.map((m) => (
            <MessageBubble key={m.id} m={m} own={isOwn(m)} replyTo={messages.find((x) => x.id === m.replyToMessageId)} onMenu={moderate || canManageGallery ? () => setMenuMsgId(m.id) : undefined} />
          ))}
        </div>
      ) : null}
      <div className="scroll-touch max-h-[min(52vh,28rem)] space-y-5 overflow-y-auto overscroll-contain rounded-[20px] border border-white/[0.06] bg-black/20 p-3">
        {grouped.map((g) => (
          <div key={g.label}>
            <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">{g.label}</p>
            <div className="space-y-3">
              {g.items.map((m) => (
                <MessageBubble key={m.id} m={m} own={isOwn(m)} replyTo={messages.find((x) => x.id === m.replyToMessageId)} onMenu={moderate || canManageGallery ? () => setMenuMsgId(m.id) : undefined} />
              ))}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="composer-fixed">
        <div className="rounded-[22px] border border-white/[0.1] bg-[rgba(8,8,10,0.92)] p-3 shadow-[0_-8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="שאלה על תרגול, טכניקה או הערה קצרה..."
            rows={2}
            enterKeyHint="send"
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-right text-base text-white outline-none placeholder:text-white/30 touch-manipulation"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <GhostButton className="min-h-[2.75rem] !px-4 !py-2.5 !text-sm" onClick={sendNote}>
              הערת תרגול
            </GhostButton>
            <GhostButton className="min-h-[2.75rem] !px-4 !py-2.5 !text-sm" onClick={() => setAttachSheet(true)}>
              וידאו
            </GhostButton>
            <PrimaryButton className="mr-auto min-h-[2.75rem] !px-5 !py-2.5 !text-base" onClick={sendText}>
              שליחה
            </PrimaryButton>
          </div>
        </div>
      </div>
      <BottomSheet open={attachSheet} title="צירוף לתרגול" onClose={() => setAttachSheet(false)}>
        <div className="space-y-3 text-right">
          <PrimaryButton onClick={sendVideo}>צירוף וידאו לקבוצה</PrimaryButton>
          <GhostButton className="w-full" onClick={() => setAttachSheet(false)}>ביטול</GhostButton>
        </div>
      </BottomSheet>
      <BottomSheet open={Boolean(menuMsgId)} title="פעולות הודעה" onClose={() => setMenuMsgId(null)}>
        {menuMsg && (moderate || canManageGallery) ? (
          <div className="space-y-2 text-right">
            {moderate ? (
              <>
                <GhostButton className="w-full !justify-end" onClick={() => { if (menuMsg.isPinned) unpinMessage(menuMsg.id, chat.id); else pinMessage(menuMsg.id, chat.id); setMenuMsgId(null); }}>{menuMsg.isPinned ? "ביטול נעיצה" : "נעיצה לקבוצה"}</GhostButton>
                <GhostButton className="w-full !justify-end" onClick={() => { markMessageReviewed(menuMsg.id); setMenuMsgId(null); }}>סימון כנבדק</GhostButton>
              </>
            ) : null}
            {canSaveGallery ? <GhostButton className="w-full !justify-end" onClick={() => setSaveGalleryOpen(true)}>שמור לגלריית חומרים</GhostButton> : null}
            {canRemove(chat) ? <GhostButton className="w-full !justify-end !text-rose-200" onClick={() => { removeMessage(menuMsg.id); setMenuMsgId(null); }}>הסרת הודעה</GhostButton> : null}
          </div>
        ) : null}
      </BottomSheet>
      {menuMsg && canManageGallery ? (
        <SaveToGallerySheet open={saveGalleryOpen} onClose={() => { setSaveGalleryOpen(false); setMenuMsgId(null); }} chat={chat} message={menuMsg} />
      ) : null}
    </div>
  );
}
