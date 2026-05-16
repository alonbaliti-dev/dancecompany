"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { usePlatform } from "@/context/PlatformContext";
import {
  canAccessGroupChat,
  canModerateChat,
  canRemoveMessage,
  canSendStudioUpdate,
  getAccessibleGroupChats,
  isStaffChat
} from "@/lib/communication-permissions";
import { auditMessageRemoval, validateChatPost } from "@/lib/security/chat-safety";
import { authorizeSendStudioUpdate } from "@/lib/security/notifications";
import { canManageGalleryItem, canViewGalleryItem } from "@/lib/security/permissions";
import { checkRateLimit } from "@/lib/security/rate-limits";
import { sanitizeDisplayText } from "@/lib/security/validation";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { useDomainMutation } from "@/lib/hooks/useDomainMutation";
import * as commOps from "@/lib/domains/communication/operations";
import * as mediaOps from "@/lib/domains/media/operations";
import { canManageGallery } from "@/lib/gallery-permissions";
import {
  notificationAppliesToUser,
  isNotificationRead,
  resolveSendUpdateRecipients
} from "@/lib/notification-logic";
import { isStudentRole } from "@/lib/studio-roster";
import type {
  ChatMessage,
  ChatMessageType,
  DanceGroupChat,
  GalleryItem,
  GalleryUploadPayload,
  Notification,
  SaveToGalleryPayload,
  SendStudioUpdatePayload,
  UserProfile
} from "@/lib/types";

type Ctx = {
  user: UserProfile;
  allNotifications: Notification[];
  notifications: Notification[];
  sentNotifications: Notification[];
  unreadNotificationCount: number;
  groupChats: DanceGroupChat[];
  accessibleChats: DanceGroupChat[];
  messages: ChatMessage[];
  galleryItems: GalleryItem[];
  accessibleGallery: GalleryItem[];
  getMessagesForChat: (chatId: string) => ChatMessage[];
  getUnreadCountForChat: (chatId: string) => number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  sendChatMessage: (input: {
    groupChatId: string;
    messageType: ChatMessageType;
    body: string;
    videoUrl?: string;
    attachedTaskId?: string;
    attachedGoalId?: string;
  }) => void;
  sendStudioUpdate: (payload: SendStudioUpdatePayload) => { recipientCount: number; notificationId: string };
  pinMessage: (messageId: string, chatId: string) => void;
  unpinMessage: (messageId: string, chatId: string) => void;
  removeMessage: (messageId: string) => void;
  markMessageReviewed: (messageId: string) => void;
  setChatSeen: (chatId: string) => void;
  canModerate: (chat: DanceGroupChat) => boolean;
  canRemove: (chat: DanceGroupChat) => boolean;
  canSendUpdate: boolean;
  canManageGallery: boolean;
  uploadGalleryItem: (payload: GalleryUploadPayload) => string;
  saveMessageToGallery: (payload: SaveToGalleryPayload) => string;
  toggleGalleryPin: (id: string) => void;
  pushNotificationToUsers: (
    recipientIds: string[],
    row: Omit<Notification, "id" | "readByUserIds" | "targetType" | "targetUserIds">
  ) => void;
};

const CommunicationContext = createContext<Ctx | null>(null);

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function roleLabel(user: UserProfile): string {
  if (user.permissions.isManagement) return "הנהלה";
  if (user.permissions.isTeacher) return "מורה";
  return "תלמיד";
}

function pushBroadcastNotification(
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>,
  row: Omit<Notification, "id">
): string {
  const id = newId("notif");
  setNotifications((prev) => [{ ...row, id }, ...prev]);
  return id;
}

export function CommunicationProvider({ user, children }: { user: UserProfile; children: ReactNode }) {
  const { appendAudit } = usePlatform();
  const { db, setDb } = useLocalDatabase();
  const mutate = useDomainMutation();
  const notifications = db.notifications;
  const groupChats = db.chats;
  const messages = db.messages.chatMessages;
  const galleryItems = db.gallery;

  const setNotifications = useCallback(
    (updater: Notification[] | ((prev: Notification[]) => Notification[])) => {
      setDb((prev) => ({
        ...prev,
        notifications: typeof updater === "function" ? updater(prev.notifications) : updater
      }));
    },
    [setDb]
  );

  const setGroupChats = useCallback(
    (updater: DanceGroupChat[] | ((prev: DanceGroupChat[]) => DanceGroupChat[])) => {
      setDb((prev) => ({
        ...prev,
        chats: typeof updater === "function" ? updater(prev.chats) : updater
      }));
    },
    [setDb]
  );

  const setMessages = useCallback(
    (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
      setDb((prev) => ({
        ...prev,
        messages: {
          ...prev.messages,
          chatMessages: typeof updater === "function" ? updater(prev.messages.chatMessages) : updater
        }
      }));
    },
    [setDb]
  );

  const setGalleryItems = useCallback(
    (updater: GalleryItem[] | ((prev: GalleryItem[]) => GalleryItem[])) => {
      setDb((prev) => ({
        ...prev,
        gallery: typeof updater === "function" ? updater(prev.gallery) : updater
      }));
    },
    [setDb]
  );
  const [chatLastSeen, setChatLastSeen] = useState<Record<string, string>>({});

  const accessibleChats = useMemo(() => getAccessibleGroupChats(user, groupChats), [user, groupChats]);

  const notificationsForUser = useMemo(
    () => notifications.filter((n) => notificationAppliesToUser(n, user)),
    [notifications, user]
  );

  const sentNotifications = useMemo(() => {
    if (!user.permissions.isManagement) return [];
    return notifications.filter((n) => n.createdByUserId === user.id || user.permissions.isManagement);
  }, [notifications, user]);

  const unreadNotificationCount = useMemo(
    () => notificationsForUser.filter((n) => !isNotificationRead(n, user.id)).length,
    [notificationsForUser, user.id]
  );

  const accessibleGallery = useMemo(
    () => galleryItems.filter((g) => canViewGalleryItem(user, g)),
    [galleryItems, user]
  );

  const getMessagesForChat = useCallback(
    (chatId: string) =>
      messages
        .filter((m) => m.groupChatId === chatId && m.moderationStatus !== "removed")
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    [messages]
  );

  const getUnreadCountForChat = useCallback(
    (chatId: string) => {
      const seen = chatLastSeen[chatId];
      const seenTs = seen ? +new Date(seen) : 0;
      return messages.filter(
        (m) =>
          m.groupChatId === chatId &&
          m.moderationStatus === "visible" &&
          m.senderUserId !== user.id &&
          +new Date(m.createdAt) > seenTs
      ).length;
    },
    [messages, chatLastSeen, user.id]
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id && !n.readByUserIds.includes(user.id) ? { ...n, readByUserIds: [...n.readByUserIds, user.id] } : n))
      );
    },
    [user.id]
  );

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (!notificationAppliesToUser(n, user)) return n;
        if (n.readByUserIds.includes(user.id)) return n;
        return { ...n, readByUserIds: [...n.readByUserIds, user.id] };
      })
    );
  }, [user]);

  const setChatSeen = useCallback((chatId: string) => {
    setChatLastSeen((prev) => ({ ...prev, [chatId]: new Date().toISOString() }));
  }, []);

  const notifyUsers = useCallback(
    (recipientIds: string[], row: Omit<Notification, "id" | "readByUserIds">) => {
      const unique = [...new Set(recipientIds)].filter((id) => id !== user.id);
      if (!unique.length) return;
      pushBroadcastNotification(setNotifications, {
        ...row,
        targetType: unique.length === 1 ? "student" : "students",
        targetUserIds: unique,
        readByUserIds: []
      });
    },
    [user.id]
  );

  const sendChatMessage = useCallback(
    (input: {
      groupChatId: string;
      messageType: ChatMessageType;
      body: string;
      videoUrl?: string;
      attachedTaskId?: string;
      attachedGoalId?: string;
    }) => {
      const chat = groupChats.find((c) => c.id === input.groupChatId);
      if (!chat) return;

      const built = commOps.buildSendChatMessageMutation(user, chat, input, roleLabel(user));
      if (!built) return;
      const result = mutate({ ...built, actor: user });
      if (!result.ok) return;

      const targets = new Set<string>();
      if (isStaffChat(chat)) {
        chat.teacherIds.forEach((tid) => {
          if (tid !== user.id) targets.add(tid);
        });
      } else if (isStudentRole(user.permissions)) {
        chat.teacherIds.forEach((tid) => {
          if (tid !== user.id) targets.add(tid);
        });
      } else {
        chat.studentIds.forEach((sid) => {
          if (sid !== user.id) targets.add(sid);
        });
      }

      if (targets.size) {
        notifyUsers([...targets], {
          studioId: chat.studioId,
          title: input.messageType === "video" ? `סרטון ב${chat.groupName}` : `הודעה ב${chat.groupName}`,
          body: `${user.name}: ${input.body.slice(0, 80)}${input.body.length > 80 ? "…" : ""}`,
          createdByUserId: user.id,
          createdByName: user.name,
          targetType: "students",
          priority: "normal",
          relatedType: "chat",
          relatedId: chat.id,
          createdAt: new Date().toISOString()
        });
      }
    },
    [user, groupChats, notifyUsers, mutate]
  );

  const sendStudioUpdate = useCallback(
    (payload: SendStudioUpdatePayload) => {
      const recipientIds = resolveSendUpdateRecipients(payload, user);
      if (!recipientIds.length) return { recipientCount: 0, notificationId: "" };

      const notificationId = newId("notif");
      const notification: Notification = {
        id: notificationId,
        studioId: user.studioId,
        title: payload.title,
        body: payload.body,
        createdByUserId: user.id,
        createdByName: user.name,
        targetType: payload.targetType,
        targetUserIds: payload.targetUserIds,
        targetGroupIds: payload.targetGroupIds,
        priority: payload.priority,
        relatedType: payload.pinToGroupChat ? "chat" : "update",
        relatedId: payload.targetGroupIds?.[0],
        readByUserIds: [],
        createdAt: new Date().toISOString()
      };

      let pinnedMessage: ChatMessage | undefined;
      let pinnedChatId: string | undefined;
      if (payload.pinToGroupChat && payload.targetGroupIds?.[0]) {
        const chat = groupChats.find((c) => c.groupId === payload.targetGroupIds![0]);
        if (chat && canAccessGroupChat(user, chat)) {
          pinnedChatId = chat.id;
          pinnedMessage = {
            id: newId("msg"),
            groupChatId: chat.id,
            senderUserId: user.id,
            senderName: user.name,
            senderRoleLabel: roleLabel(user),
            messageType: "text",
            body: `📌 ${payload.title}\n\n${payload.body}`,
            createdAt: new Date().toISOString(),
            isPinned: true,
            moderationStatus: "visible"
          };
        }
      }

      const built = commOps.buildSendStudioBroadcastMutation(
        user,
        payload,
        notification,
        pinnedMessage,
        pinnedChatId
      );
      if (!built) return { recipientCount: 0, notificationId: "" };
      mutate({ ...built, actor: user });

      return { recipientCount: recipientIds.length, notificationId };
    },
    [user, groupChats, mutate]
  );

  const uploadGalleryItem = useCallback(
    (payload: GalleryUploadPayload): string => {
      const input = mediaOps.buildGalleryUploadMutation(user, payload);
      if (!input) return "";
      const result = mutate({ ...input, actor: user });
      if (!result.ok) return "";
      const added = result.database.gallery[0];
      return added?.id ?? "";
    },
    [user, mutate]
  );

  const saveMessageToGallery = useCallback(
    (payload: SaveToGalleryPayload): string => {
      const msg = messages.find((m) => m.id === payload.messageId);
      const chat = groupChats.find((c) => c.id === payload.chatId);
      if (!msg || !chat) return "";
      const input = mediaOps.buildSaveChatToGalleryMutation(user, payload, msg, chat);
      if (!input) return "";
      const result = mutate({ ...input, actor: user });
      if (!result.ok) return "";
      const id = result.database.gallery[0]?.id ?? "";
      if (payload.notifyUsers && id) {
        pushBroadcastNotification(setNotifications, {
          studioId: chat.studioId,
          title: "חומר חדש בגלריה",
          body: payload.title,
          createdByUserId: user.id,
          createdByName: user.name,
          targetType: payload.assignedStudentIds?.length ? "students" : "dance_group",
          targetUserIds: payload.assignedStudentIds,
          targetGroupIds: payload.assignedGroupIds ?? (chat.groupId ? [chat.groupId] : undefined),
          priority: "normal",
          relatedType: "gallery",
          relatedId: id,
          readByUserIds: [],
          createdAt: new Date().toISOString()
        });
      }
      return id;
    },
    [user, messages, groupChats, mutate]
  );

  const toggleGalleryPin = useCallback((id: string) => {
    setGalleryItems((prev) => prev.map((g) => (g.id === id ? { ...g, isPinned: !g.isPinned } : g)));
  }, []);

  const pinMessage = useCallback(
    (messageId: string, chatId: string) => {
      const chat = groupChats.find((c) => c.id === chatId);
      if (!chat) return;
      const input = commOps.buildPinMessageMutation(user, messageId, chatId, chat);
      if (input) mutate({ ...input, actor: user });
    },
    [user, groupChats, mutate]
  );

  const unpinMessage = useCallback(
    (messageId: string, chatId: string) => {
      const chat = groupChats.find((c) => c.id === chatId);
      if (!chat || !canModerateChat(user, chat)) return;
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, isPinned: false } : m)));
      setGroupChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, pinnedMessageIds: c.pinnedMessageIds.filter((id) => id !== messageId) } : c))
      );
    },
    [user, groupChats]
  );

  const removeMessage = useCallback(
    (messageId: string) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg) return;
      const chat = groupChats.find((c) => c.id === msg.groupChatId);
      if (!chat) return;
      const input = commOps.buildRemoveMessageMutation(user, messageId, chat);
      if (input) mutate({ ...input, actor: user });
    },
    [user, groupChats, messages, mutate]
  );

  const markMessageReviewed = useCallback(
    (messageId: string) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg) return;
      const chat = groupChats.find((c) => c.id === msg.groupChatId);
      if (!chat || !canModerateChat(user, chat)) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reviewedAt: new Date().toISOString() } : m))
      );
    },
    [user, groupChats, messages]
  );

  const value = useMemo(
    () => ({
      user,
      allNotifications: notifications,
      notifications: notificationsForUser,
      sentNotifications,
      unreadNotificationCount,
      groupChats,
      accessibleChats,
      messages,
      galleryItems,
      accessibleGallery,
      getMessagesForChat,
      getUnreadCountForChat,
      markNotificationRead,
      markAllNotificationsRead,
      sendChatMessage,
      sendStudioUpdate,
      pinMessage,
      unpinMessage,
      removeMessage,
      markMessageReviewed,
      setChatSeen,
      canModerate: (chat: DanceGroupChat) => canModerateChat(user, chat),
      canRemove: (chat: DanceGroupChat) => canRemoveMessage(user, chat),
      canSendUpdate: canSendStudioUpdate(user),
      canManageGallery: canManageGallery(user),
      uploadGalleryItem,
      saveMessageToGallery,
      toggleGalleryPin,
      pushNotificationToUsers: notifyUsers
    }),
    [
      user,
      notifications,
      notificationsForUser,
      sentNotifications,
      unreadNotificationCount,
      groupChats,
      accessibleChats,
      messages,
      galleryItems,
      accessibleGallery,
      getMessagesForChat,
      getUnreadCountForChat,
      markNotificationRead,
      markAllNotificationsRead,
      sendChatMessage,
      sendStudioUpdate,
      pinMessage,
      unpinMessage,
      removeMessage,
      markMessageReviewed,
      setChatSeen,
      uploadGalleryItem,
      saveMessageToGallery,
      toggleGalleryPin,
      notifyUsers
    ]
  );

  return <CommunicationContext.Provider value={value}>{children}</CommunicationContext.Provider>;
}

export function useCommunication(): Ctx {
  const x = useContext(CommunicationContext);
  if (!x) throw new Error("useCommunication requires CommunicationProvider");
  return x;
}
