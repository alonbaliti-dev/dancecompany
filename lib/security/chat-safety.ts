/**
 * Chat safety — moderation, staff isolation, content filter placeholder.
 */
import { isStaffChat } from "@/lib/communication-permissions";
import type { DanceGroupChat, UserProfile } from "@/lib/types";
import { canModerateChat, canPostInGroupChat } from "./permissions";
import { assertStudioScope } from "./studio-isolation";

/** Off-topic / abuse placeholder — production: server-side ML or keyword pipeline. */
const OFF_TOPIC_PATTERNS = [
  /\b(מכירה|קניה|קריפטו|ביטקוין|הימורים)\b/i,
  /\b(buy|sell|crypto|gambling)\b/i
];

export type ContentFilterResult =
  | { allowed: true }
  | { allowed: false; reason: "off_topic" | "empty" | "too_long"; message: string };

export function filterChatMessageContent(body: string): ContentFilterResult {
  const trimmed = body.trim();
  if (!trimmed) return { allowed: false, reason: "empty", message: "הודעה ריקה" };
  if (trimmed.length > 4000) return { allowed: false, reason: "too_long", message: "הודעה ארוכה מדי" };
  for (const re of OFF_TOPIC_PATTERNS) {
    if (re.test(trimmed)) {
      return {
        allowed: false,
        reason: "off_topic",
        message: "ההודעה לא קשורה לתוכן הסטודיו. נא לשמור על שיח מקצועי."
      };
    }
  }
  return { allowed: true };
}

export function canStudentSeeChat(user: UserProfile, chat: DanceGroupChat): boolean {
  if (isStaffChat(chat)) return false;
  return canPostInGroupChat(user, chat) || chat.studentIds.includes(user.id);
}

export function canUserModerateChat(user: UserProfile, chat: DanceGroupChat): boolean {
  return canModerateChat(user, chat);
}

export function auditMessageRemoval(params: {
  actor: UserProfile;
  chat: DanceGroupChat;
  messageId: string;
}): { action: string; targetType: string; targetId: string; studioId: string; severity: "warning" } {
  return {
    action: "הודעה הוסרה מצ׳אט",
    targetType: "chat_message",
    targetId: params.messageId,
    studioId: params.chat.studioId,
    severity: "warning"
  };
}

export function validateChatPost(user: UserProfile, chat: DanceGroupChat, body: string): ContentFilterResult | { allowed: true } {
  if (!assertStudioScope(user, chat.studioId)) {
    return { allowed: false, reason: "empty", message: "אין הרשאה לצ׳אט זה" };
  }
  if (!canPostInGroupChat(user, chat)) {
    return { allowed: false, reason: "empty", message: "אין הרשאה לפרסם בצ׳אט זה" };
  }
  return filterChatMessageContent(body);
}
