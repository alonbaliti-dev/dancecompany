import type { V6User } from "@/lib/v6/types";

export function v6UserSavedNotification(user: V6User, exists: boolean) {
  return {
    studioId: user.studioId,
    userIds: [user.id],
    title: exists ? "הפרטים שלך עודכנו" : "נוצר לך חשבון",
    body: "אפשר להתחבר עם הטלפון והסיסמה שנשמרו.",
    type: "user" as const,
    screen: "users" as const
  };
}
