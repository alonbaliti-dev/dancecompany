import { getDirectoryUsers } from "@/lib/directory-store";
import { getStaffUserIds } from "@/lib/notification-logic";
import { userGroupIds } from "@/lib/studio-roster";
import type { DanceGroupChat, UserProfile } from "@/lib/types";

export const STAFF_CHAT_ID = "chat_staff";

export function groupChatForGroupId(groupId: string, chats: DanceGroupChat[]): DanceGroupChat | undefined {
  return chats.find((c) => c.chatType === "dance_group" && c.groupId === groupId);
}

export function isStaffChat(chat: DanceGroupChat): boolean {
  return chat.chatType === "staff";
}

export function canAccessStaffChat(user: UserProfile): boolean {
  return user.permissions.isTeacher || user.permissions.isManagement;
}

/** Chats the user may open (dance groups + staff channel when allowed). */
export function getAccessibleGroupChats(user: UserProfile, chats: DanceGroupChat[]): DanceGroupChat[] {
  const dance = chats.filter((c) => c.chatType === "dance_group");
  let accessible: DanceGroupChat[] = [];

  if (user.permissions.isManagement) {
    accessible = dance;
  } else if (user.permissions.isTeacher) {
    const gids = new Set(userGroupIds(user));
    accessible = dance.filter((c) => (c.groupId && gids.has(c.groupId)) || c.teacherIds.includes(user.id));
  } else {
    accessible = dance.filter((c) => c.studentIds.includes(user.id));
  }

  const staff = chats.find((c) => c.id === STAFF_CHAT_ID);
  if (staff && canAccessStaffChat(user)) accessible = [staff, ...accessible];
  return accessible;
}

export function canAccessGroupChat(user: UserProfile, chat: DanceGroupChat): boolean {
  if (isStaffChat(chat)) return canAccessStaffChat(user);
  return getAccessibleGroupChats(user, [chat]).length > 0;
}

export function canModerateChat(user: UserProfile, chat: DanceGroupChat): boolean {
  if (isStaffChat(chat)) {
    if (user.permissions.isManagement) return true;
    return Boolean(user.canPinStaffMessages);
  }
  if (user.permissions.isManagement) return true;
  if (user.permissions.isTeacher && chat.teacherIds.includes(user.id)) return true;
  const gids = new Set(userGroupIds(user));
  return user.permissions.isTeacher && Boolean(chat.groupId && gids.has(chat.groupId));
}

/** Management: full moderation; staff chat teachers: pin only when canPinStaffMessages */
export function canRemoveMessage(user: UserProfile, chat: DanceGroupChat): boolean {
  if (isStaffChat(chat)) return user.permissions.isManagement;
  return canModerateChat(user, chat);
}

export function canSendStudioUpdate(user: UserProfile): boolean {
  return user.permissions.isTeacher || user.permissions.isManagement;
}

export function primaryTeacherNameForChat(chat: DanceGroupChat): string {
  if (isStaffChat(chat)) return "צוות הסטודיו";
  const teachers = getDirectoryUsers().filter((u) => chat.teacherIds.includes(u.id));
  return teachers[0]?.name ?? "צוות הסטודיו";
}

export function staffParticipantIds(): string[] {
  return getStaffUserIds();
}
