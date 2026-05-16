import type { LocalDatabase } from "@/lib/local-db/db-types";
import { canAccessGroupChat, canModerateChat, canRemoveMessage } from "@/lib/communication-permissions";
import { authorizeSendStudioUpdate } from "@/lib/security/notifications";
import { checkRateLimit } from "@/lib/security/rate-limits";
import { validateChatPost } from "@/lib/security/chat-safety";
import { sanitizeDisplayText } from "@/lib/security/validation";
import { guard } from "@/lib/security/guards";
import type {
  ChatMessage,
  ChatMessageType,
  DanceGroupChat,
  Notification,
  SendStudioUpdatePayload,
  UserProfile
} from "@/lib/types";
import { domainGuards } from "../core/permissions";
import type { DomainMutationInput } from "../core/types";

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function buildSendChatMessageMutation(
  actor: UserProfile,
  chat: DanceGroupChat,
  input: {
    messageType: ChatMessageType;
    body: string;
    videoUrl?: string;
    attachedTaskId?: string;
    attachedGoalId?: string;
  },
  roleLabel: string
): DomainMutationInput | null {
  if (!canAccessGroupChat(actor, chat)) return null;
  const rate = checkRateLimit(actor.id, "chatMessage");
  if (!rate.allowed) return null;
  const filtered = validateChatPost(actor, chat, input.body);
  if (!filtered.allowed) {
    return {
      actor,
      guard: guard(false, "תוכן נחסם"),
      mutate: (db) => db,
      audit: {
        action: "תוכן נחסם בצ׳אט",
        targetType: "chat_message",
        targetId: chat.id,
        severity: "warning"
      }
    };
  }

  const row: ChatMessage = {
    id: newId("msg"),
    groupChatId: chat.id,
    senderUserId: actor.id,
    senderName: actor.name,
    senderRoleLabel: roleLabel,
    messageType: input.messageType,
    body: sanitizeDisplayText(input.body.trim()),
    videoUrl: input.videoUrl,
    attachedTaskId: input.attachedTaskId,
    attachedGoalId: input.attachedGoalId,
    createdAt: new Date().toISOString(),
    isPinned: false,
    moderationStatus: "visible"
  };

  return {
    actor,
    guard: guard(true),
    mutate: (db) => ({
      ...db,
      messages: {
        ...db.messages,
        chatMessages: [...db.messages.chatMessages, row]
      }
    }),
    activity: {
      kind: "notification",
      messageHe: `הודעה ב${chat.groupName}`,
      relatedType: "chat",
      relatedId: chat.id
    }
  };
}

export function buildSendStudioBroadcastMutation(
  actor: UserProfile,
  payload: SendStudioUpdatePayload,
  notification: Notification,
  pinnedMessage?: ChatMessage,
  pinnedChatId?: string
): DomainMutationInput | null {
  const authz = authorizeSendStudioUpdate(actor, payload);
  if (!authz.ok) return null;

  return {
    actor,
    guard: domainGuards.sendStudioUpdate(actor),
    mutate: (db) => {
      let next: LocalDatabase = {
        ...db,
        notifications: [notification, ...db.notifications]
      };
      if (pinnedMessage && pinnedChatId) {
        next = {
          ...next,
          messages: {
            ...next.messages,
            chatMessages: [...next.messages.chatMessages, pinnedMessage]
          },
          chats: next.chats.map((c) =>
            c.id === pinnedChatId
              ? {
                  ...c,
                  pinnedMessageIds: [pinnedMessage.id, ...c.pinnedMessageIds.filter((id) => id !== pinnedMessage.id)]
                }
              : c
          )
        };
      }
      return next;
    },
    audit: {
      action: "התראה נשלחה",
      targetType: "notification",
      targetId: notification.id,
      severity: "info"
    },
    activity: {
      kind: "update_sent",
      messageHe: payload.title,
      relatedType: "notification",
      relatedId: notification.id,
      visibility: "studio"
    }
  };
}

export function buildRemoveMessageMutation(
  actor: UserProfile,
  messageId: string,
  chat: DanceGroupChat
): DomainMutationInput | null {
  if (!canRemoveMessage(actor, chat)) return null;
  return {
    actor,
    guard: guard(canModerateChat(actor, chat)),
    mutate: (db) => ({
      ...db,
      messages: {
        ...db.messages,
        chatMessages: db.messages.chatMessages.map((m) =>
          m.id === messageId ? { ...m, moderationStatus: "removed" as const } : m
        )
      }
    }),
    audit: {
      action: "הודעה הוסרה",
      targetType: "chat_message",
      targetId: messageId,
      severity: "warning"
    },
    activity: { kind: "moderation", messageHe: "הודעה הוסרה בצ׳אט", relatedType: "chat_message", relatedId: messageId }
  };
}

export function buildPinMessageMutation(
  actor: UserProfile,
  messageId: string,
  chatId: string,
  chat: DanceGroupChat
): DomainMutationInput | null {
  if (!canModerateChat(actor, chat)) return null;
  return {
    actor,
    guard: guard(true),
    mutate: (db) => ({
      ...db,
      messages: {
        ...db.messages,
        chatMessages: db.messages.chatMessages.map((m) =>
          m.id === messageId ? { ...m, isPinned: true } : m
        )
      },
      chats: db.chats.map((c) =>
        c.id === chatId
          ? { ...c, pinnedMessageIds: [messageId, ...c.pinnedMessageIds.filter((id) => id !== messageId)] }
          : c
      )
    }),
    audit: {
      action: "הודעה הוצמדה",
      targetType: "chat_message",
      targetId: messageId,
      severity: "info"
    }
  };
}

export function appendNotificationsToDb(db: LocalDatabase, rows: Notification[]): LocalDatabase {
  return { ...db, notifications: [...rows, ...db.notifications] };
}

