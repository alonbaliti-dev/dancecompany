"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { getDirectoryUsers } from "@/lib/directory-store";
import { useDomainMutation } from "@/lib/hooks/useDomainMutation";
import * as userOps from "@/lib/domains/users/operations";
import type { UserDraft } from "@/lib/domains/users/types";
import { nextUserId } from "@/lib/users/user-logic";
import { syncRelationshipLinks } from "@/lib/users/user-type";
import type { DirectoryUser, UserProfile } from "@/lib/types";

export type { UserDraft } from "@/lib/domains/users/types";

type Ctx = {
  users: DirectoryUser[];
  getUser: (id: string) => DirectoryUser | undefined;
  createUser: (actor: UserProfile, draft: UserDraft) => DirectoryUser | null;
  updateUser: (actor: UserProfile, id: string, draft: Partial<UserDraft>) => DirectoryUser | null;
  setStatus: (actor: UserProfile, id: string, status: UserProfile["status"]) => boolean;
  resetPassword: (actor: UserProfile, userId: string, newPassword: string) => boolean;
  changeOwnPassword: (actor: UserProfile, newPassword: string) => boolean;
  linkParentStudent: (actor: UserProfile, parentId: string, studentId: string) => void;
  unlinkParentStudent: (actor: UserProfile, parentId: string, studentId: string) => void;
};

const UserDirectoryContext = createContext<Ctx | null>(null);

export function UserDirectoryProvider({ children }: { children: ReactNode }) {
  const { db } = useLocalDatabase();
  const mutate = useDomainMutation();
  const users = useMemo(() => syncRelationshipLinks(db.users), [db.users]);

  const getUser = useCallback((id: string) => users.find((u) => u.id === id), [users]);

  const createUser = useCallback(
    (actor: UserProfile, draft: UserDraft): DirectoryUser | null => {
      const id = draft.id ?? nextUserId("u");
      const input = userOps.buildCreateUserMutation(actor, users, draft, id);
      if (!input) return null;
      const result = mutate({ ...input, actor });
      if (!result.ok) return null;
      return result.database.users.find((u) => u.id === id) ?? null;
    },
    [users, mutate]
  );

  const updateUser = useCallback(
    (actor: UserProfile, id: string, draft: Partial<UserDraft>): DirectoryUser | null => {
      const input = userOps.buildUpdateUserMutation(actor, users, id, draft);
      if (!input) return null;
      const result = mutate({ ...input, actor });
      if (!result.ok) return null;
      return result.database.users.find((u) => u.id === id) ?? null;
    },
    [users, mutate]
  );

  const setStatus = useCallback(
    (actor: UserProfile, id: string, status: UserProfile["status"]): boolean => {
      const input = userOps.buildSetUserStatusMutation(actor, users, id, status);
      if (!input) return false;
      return mutate({ ...input, actor }).ok;
    },
    [users, mutate]
  );

  const resetPassword = useCallback(
    (actor: UserProfile, userId: string, newPassword: string): boolean => {
      const input = userOps.buildResetPasswordMutation(actor, users, userId, newPassword);
      if (!input) return false;
      return mutate({ ...input, actor }).ok;
    },
    [users, mutate]
  );

  const changeOwnPassword = useCallback(
    (actor: UserProfile, newPassword: string): boolean => {
      const input = userOps.buildChangeOwnPasswordMutation(actor, users, newPassword);
      if (!input) return false;
      return mutate({ ...input, actor }).ok;
    },
    [users, mutate]
  );

  const linkParentStudent = useCallback(
    (actor: UserProfile, parentId: string, studentId: string) => {
      const input = userOps.buildLinkParentStudentMutation(actor, users, parentId, studentId);
      if (input) mutate({ ...input, actor });
    },
    [users, mutate]
  );

  const unlinkParentStudent = useCallback(
    (actor: UserProfile, parentId: string, studentId: string) => {
      const input = userOps.buildUnlinkParentStudentMutation(actor, users, parentId, studentId);
      if (input) mutate({ ...input, actor });
    },
    [users, mutate]
  );

  const value = useMemo(
    () => ({
      users,
      getUser,
      createUser,
      updateUser,
      setStatus,
      resetPassword,
      changeOwnPassword,
      linkParentStudent,
      unlinkParentStudent
    }),
    [users, getUser, createUser, updateUser, setStatus, resetPassword, changeOwnPassword, linkParentStudent, unlinkParentStudent]
  );

  return <UserDirectoryContext.Provider value={value}>{children}</UserDirectoryContext.Provider>;
}

export function useUserDirectory() {
  const ctx = useContext(UserDirectoryContext);
  if (!ctx) throw new Error("useUserDirectory requires UserDirectoryProvider");
  return ctx;
}

/** Read-only access for modules that only need listing (falls back to seeds). */
export function useDirectoryUsers(): DirectoryUser[] {
  const ctx = useContext(UserDirectoryContext);
  return ctx?.users ?? getDirectoryUsers();
}
