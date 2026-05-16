import { upsertAuthCredential, updateCredentialPhone } from "@/lib/auth/credentials";
import { setStoredPassword } from "@/lib/auth/mock-auth-store";
import type { LocalDatabase } from "@/lib/local-db/db-types";
import { appendAuditToDb } from "@/lib/local-db/audit-entry";
import { buildParentStudentLinksFromUsers } from "@/lib/local-db/parent-links";
import { groupIdToName, groupNameToId } from "@/lib/studio-group-ids";
import {
  auditParentLinked,
  auditParentUnlinked,
  auditPermissionsChanged,
  auditTeacherGroups,
  auditPasswordReset,
  auditUserCreated,
  auditUserDeactivated,
  auditUserEdited,
  auditUserRemoved,
  auditUserRestored
} from "@/lib/users/user-audit";
import { canCreateUser, canEditUser, canLinkParentStudent, canRemoveUser, canResetPassword } from "@/lib/users/user-guards";
import { guard } from "@/lib/security/guards";
import { enrichUserProfile, inferUserType, permissionsForUserType, syncRelationshipLinks } from "@/lib/users/user-type";
import type { DirectoryUser, UserPermissions, UserProfile, UserType } from "@/lib/types";
import type { DomainMutationInput } from "../core/types";
import type { UserDraft } from "./types";

function toDirectory(u: UserProfile, prev?: DirectoryUser): DirectoryUser {
  const assignedGroups =
    u.assignedGroupIds?.map((id) => groupIdToName(id)).filter(Boolean) as string[] ?? u.assignedGroups;
  return {
    ...u,
    assignedGroups,
    assignedGroupIds:
      u.assignedGroupIds ?? (assignedGroups.map((n) => groupNameToId(n)).filter(Boolean) as string[]),
    lastActiveAt: prev?.lastActiveAt ?? "—",
    permissionsModifiedBy: prev?.permissionsModifiedBy ?? null,
    permissionsModifiedAt: prev?.permissionsModifiedAt ?? null
  };
}

function applyUsersToDb(db: LocalDatabase, users: DirectoryUser[]): LocalDatabase {
  const synced = syncRelationshipLinks(users);
  return {
    ...db,
    users: synced,
    parentsStudents: buildParentStudentLinksFromUsers(synced)
  };
}

export function buildCreateUserMutation(
  actor: UserProfile,
  users: DirectoryUser[],
  draft: UserDraft,
  newId: string
): DomainMutationInput | null {
  if (!canCreateUser(actor, draft.type, draft.studioId)) return null;
  const initialPassword = draft.initialPassword?.trim() ?? "";
  if (initialPassword.length < 6) return null;

  const profile = enrichUserProfile({
    id: newId,
    studioId: draft.studioId,
    type: draft.type,
    name: draft.name.trim(),
    phone: draft.phone.trim(),
    email: draft.email?.trim(),
    status: draft.status,
    permissions: draft.permissions,
    assignedGroupIds: draft.assignedGroupIds,
    linkedStudentIds: draft.linkedStudentIds,
    linkedParentIds: draft.linkedParentIds,
    isParent: draft.type === "parent"
  });
  const row = toDirectory(profile);
  const audit = auditUserCreated(actor, newId, row.name, row.studioId);
  const now = new Date().toISOString();
  return {
    actor,
    guard: guard(true),
    mutate: (db) => {
      let next = applyUsersToDb(db, [
        ...users,
        { ...row, passwordLastChangedAt: now, createdAt: now, updatedAt: now }
      ]);
      next = upsertAuthCredential(next, newId, row.phone, initialPassword);
      setStoredPassword(newId, initialPassword);
      return next;
    },
    audit: {
      action: audit.action,
      targetType: "user",
      targetId: audit.targetId,
      severity: audit.severity
    },
    activity: {
      kind: "system",
      messageHe: audit.action,
      relatedType: "user",
      relatedId: newId,
      visibility: "studio"
    }
  };
}

export function buildUpdateUserMutation(
  actor: UserProfile,
  users: DirectoryUser[],
  id: string,
  draft: Partial<UserDraft>
): DomainMutationInput | null {
  const prev = users.find((u) => u.id === id);
  if (!prev || !canEditUser(actor, prev)) return null;

  const type = draft.type ?? inferUserType(prev);
  const permissions = draft.permissions ?? permissionsForUserType(type, prev.permissions);
  const profile = enrichUserProfile({
    ...prev,
    ...draft,
    id,
    type,
    permissions,
    updatedAt: new Date().toISOString()
  });
  const row: DirectoryUser = {
    ...toDirectory(profile, prev),
    permissionsModifiedBy: actor.name,
    permissionsModifiedAt: new Date().toLocaleDateString("he-IL")
  };

  return {
    actor,
    guard: guard(true),
    mutate: (db) => {
      let next = applyUsersToDb(
        db,
        users.map((u) => (u.id === id ? row : u))
      );
      const edited = auditUserEdited(actor, id, row.name, row.studioId);
      next = appendAuditToDb(next, actor, {
        studioId: edited.studioId,
        action: edited.action,
        targetType: "user",
        targetId: edited.targetId,
        severity: edited.severity
      });
      if (draft.permissions) {
        const perm = auditPermissionsChanged(actor, id, row.name, row.studioId);
        next = appendAuditToDb(next, actor, {
          studioId: perm.studioId,
          action: perm.action,
          targetType: "user",
          targetId: perm.targetId,
          severity: perm.severity
        });
      }
      if (draft.assignedGroupIds) {
        const grp = auditTeacherGroups(actor, id, row.studioId);
        next = appendAuditToDb(next, actor, {
          studioId: grp.studioId,
          action: grp.action,
          targetType: "user",
          targetId: grp.targetId,
          severity: grp.severity
        });
      }
      if (draft.phone) {
        next = updateCredentialPhone(next, id, row.phone);
      }
      return next;
    },
    activity: {
      kind: "system",
      messageHe: `עודכן משתמש: ${row.name}`,
      relatedType: "user",
      relatedId: id
    }
  };
}

export function buildSetUserStatusMutation(
  actor: UserProfile,
  users: DirectoryUser[],
  id: string,
  status: UserProfile["status"]
): DomainMutationInput | null {
  const prev = users.find((u) => u.id === id);
  if (!prev || !canEditUser(actor, prev)) return null;
  if (status === "removed" && !canRemoveUser(actor, prev)) return null;

  const row: DirectoryUser = {
    ...prev,
    status,
    updatedAt: new Date().toISOString(),
    permissionsModifiedBy: actor.name,
    permissionsModifiedAt: new Date().toLocaleDateString("he-IL")
  };

  const auditFn =
    status === "inactive"
      ? auditUserDeactivated
      : status === "removed"
        ? auditUserRemoved
        : auditUserRestored;
  const audit = auditFn(actor, id, row.name, row.studioId);

  return {
    actor,
    guard: guard(true),
    mutate: (db) =>
      applyUsersToDb(
        db,
        users.map((u) => (u.id === id ? row : u))
      ),
    audit: {
      action: audit.action,
      targetType: "user",
      targetId: audit.targetId,
      severity: audit.severity
    }
  };
}

export function buildLinkParentStudentMutation(
  actor: UserProfile,
  users: DirectoryUser[],
  parentId: string,
  studentId: string
): DomainMutationInput | null {
  const parent = users.find((u) => u.id === parentId);
  const student = users.find((u) => u.id === studentId);
  if (!parent || !student || !canLinkParentStudent(actor, parent, student)) return null;

  const pStudents = new Set(parent.linkedStudentIds ?? []);
  pStudents.add(studentId);
  const sParents = new Set(student.linkedParentIds ?? []);
  sParents.add(parentId);

  const audit = auditParentLinked(actor, parentId, studentId, parent.studioId);

  return {
    actor,
    guard: guard(true),
    mutate: (db) =>
      applyUsersToDb(
        db,
        users.map((u) => {
          if (u.id === parentId)
            return { ...u, linkedStudentIds: [...pStudents], updatedAt: new Date().toISOString() };
          if (u.id === studentId)
            return { ...u, linkedParentIds: [...sParents], updatedAt: new Date().toISOString() };
          return u;
        })
      ),
    audit: {
      action: audit.action,
      targetType: "user",
      targetId: parentId,
      severity: audit.severity
    },
    activity: {
      kind: "system",
      messageHe: "קישור הורה-תלמיד",
      relatedType: "user",
      relatedId: studentId
    }
  };
}

/** User changes their own password (current password verified by caller). */
export function buildChangeOwnPasswordMutation(
  actor: UserProfile,
  users: DirectoryUser[],
  newPassword: string
): DomainMutationInput | null {
  const target = users.find((u) => u.id === actor.id);
  if (!target || target.status !== "active") return null;
  if (newPassword.trim().length < 6) return null;
  return buildResetPasswordMutation(actor, users, actor.id, newPassword);
}

export function buildResetPasswordMutation(
  actor: UserProfile,
  users: DirectoryUser[],
  userId: string,
  newPassword: string
): DomainMutationInput | null {
  const target = users.find((u) => u.id === userId);
  if (!target || !canResetPassword(actor, target)) return null;
  if (newPassword.trim().length < 6) return null;

  const password = newPassword.trim();
  const now = new Date().toISOString();
  const audit = auditPasswordReset(actor, userId, target.name, target.studioId);

  return {
    actor,
    guard: guard(true),
    mutate: (db) => {
      let next = applyUsersToDb(
        db,
        users.map((u) =>
          u.id === userId
            ? {
                ...u,
                passwordLastChangedAt: now,
                updatedAt: now
              }
            : u
        )
      );
      next = upsertAuthCredential(next, userId, target.phone, password);
      setStoredPassword(userId, password);
      return next;
    },
    audit: {
      action: audit.action,
      targetType: "user",
      targetId: audit.targetId,
      severity: audit.severity
    },
    activity: {
      kind: "system",
      messageHe: audit.action,
      relatedType: "user",
      relatedId: userId,
      visibility: "studio"
    }
  };
}

export function buildUnlinkParentStudentMutation(
  actor: UserProfile,
  users: DirectoryUser[],
  parentId: string,
  studentId: string
): DomainMutationInput | null {
  const parent = users.find((u) => u.id === parentId);
  const student = users.find((u) => u.id === studentId);
  if (!parent || !student || !canLinkParentStudent(actor, parent, student)) return null;

  const audit = auditParentUnlinked(actor, parentId, studentId, parent.studioId);

  return {
    actor,
    guard: guard(true),
    mutate: (db) =>
      applyUsersToDb(
        db,
        users.map((u) => {
          if (u.id === parentId)
            return {
              ...u,
              linkedStudentIds: (u.linkedStudentIds ?? []).filter((id) => id !== studentId),
              updatedAt: new Date().toISOString()
            };
          if (u.id === studentId)
            return {
              ...u,
              linkedParentIds: (u.linkedParentIds ?? []).filter((id) => id !== parentId),
              updatedAt: new Date().toISOString()
            };
          return u;
        })
      ),
    audit: {
      action: audit.action,
      targetType: "user",
      targetId: parentId,
      severity: audit.severity
    }
  };
}
