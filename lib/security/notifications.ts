/**
 * Notification security — target resolution must run server-side in production.
 */
import { resolveSendUpdateRecipients } from "@/lib/notification-logic";
import type { SendStudioUpdatePayload, UserProfile } from "@/lib/types";
import { canSendNotification } from "./permissions";
import type { NotificationSendTarget } from "./types";

export function authorizeSendStudioUpdate(
  user: UserProfile,
  payload: SendStudioUpdatePayload
): { ok: true; recipientCount: number } | { ok: false; reason: string } {
  const target: NotificationSendTarget = {
    studioId: user.studioId,
    targetType: payload.targetType,
    targetUserIds: payload.targetUserIds,
    targetGroupIds: payload.targetGroupIds
  };

  if (!canSendNotification(user, target)) {
    return { ok: false, reason: "אין הרשאה לשלוח עדכון ליעד זה" };
  }

  const recipientIds = resolveSendUpdateRecipients(payload, user);
  if (!recipientIds.length) {
    return { ok: false, reason: "לא נמצאו נמענים" };
  }

  return { ok: true, recipientCount: recipientIds.length };
}

/** Read receipts visible only to sender + management (see permissions.canViewNotificationReadReceipts). */
export function readReceiptVisibleTo(user: UserProfile, notificationCreatorId: string): boolean {
  if (user.id === notificationCreatorId) return true;
  return user.permissions.isManagement || user.permissions.isSuperAdmin;
}
