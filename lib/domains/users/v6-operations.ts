import type { V6Credential, V6Database, V6User } from "@/lib/v6/types";
import { v6Allowed, v6Denied, type V6DomainResult } from "../core/v6";
import { canV6EditCredentials, canV6ManageUsers } from "./guards";

export function buildV6UpsertUserOperation(db: V6Database, actor: V6User, user: V6User, credential?: V6Credential): V6DomainResult<{ exists: boolean; user: V6User; credential?: V6Credential }> {
  if (!canV6ManageUsers(actor, user)) return v6Denied("אין הרשאה לניהול משתמשים");
  if (!user.name.trim()) return v6Denied("שם משתמש הוא שדה חובה");
  if (!user.phone.trim()) return v6Denied("טלפון הוא שדה חובה");
  if (!user.role) return v6Denied("חובה לבחור תפקיד למשתמש");
  if (credential && credential.password.trim().length < 6) return v6Denied("סיסמה חייבת לכלול לפחות 6 תווים");
  if (credential && credential.phone.trim() !== user.phone.trim()) return v6Denied("טלפון ההתחברות חייב להתאים לטלפון המשתמש");
  const invalidGroup = user.groupIds.some((groupId) => !db.groups.some((group) => group.id === groupId));
  if (invalidGroup) return v6Denied("שיוך קבוצה לא תקין");
  const invalidLinkedStudent = user.linkedStudentIds.some((studentId) => !db.users.some((item) => item.id === studentId && item.role === "student"));
  if (invalidLinkedStudent) return v6Denied("קישור תלמיד/ה לא תקין");
  const exists = db.users.some((item) => item.id === user.id);
  const normalizedActive = user.status ? user.status === "active" : user.active;
  return v6Allowed({
    exists,
    user: {
      ...user,
      name: user.name.trim(),
      phone: user.phone.trim(),
      active: normalizedActive,
      status: user.status ?? (normalizedActive ? "active" : "inactive"),
      groupIds: [...new Set(user.groupIds)],
      linkedStudentIds: [...new Set(user.linkedStudentIds)],
      linkedParentIds: [...new Set(user.linkedParentIds ?? [])],
      danceStyleIds: [...new Set(user.danceStyleIds ?? [])],
      notes: user.notes?.trim(),
      communicationPrefs: user.communicationPrefs?.trim(),
      responsibility: user.responsibility?.trim()
    },
    credential: credential ? { ...credential, phone: credential.phone.trim(), password: credential.password.trim() } : undefined
  });
}

export function buildV6ResetPasswordOperation(actor: V6User, target: V6User, password: string): V6DomainResult<{ userId: string; password: string }> {
  if (!canV6EditCredentials(actor, target)) return v6Denied("אין הרשאה לאיפוס סיסמה");
  if (password.trim().length < 6) return v6Denied("סיסמה חייבת לכלול לפחות 6 תווים");
  return v6Allowed({ userId: target.id, password: password.trim() });
}
