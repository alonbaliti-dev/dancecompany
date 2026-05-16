"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { useDomainMutation } from "@/lib/hooks/useDomainMutation";
import * as studioTasks from "@/lib/domains/studio-tasks/operations";
import {
  canTeacherCreateTarget,
  canTeacherCreateUpdateTarget,
  canTeacherEditTask,
  normalizeTask
} from "@/lib/studio-task-logic";
import type { StudentTask, StudioUpdate, TaskFrequency, UserProfile } from "@/lib/types";

type Ctx = {
  user: UserProfile;
  tasks: StudentTask[];
  updates: StudioUpdate[];
  recordTaskProgress: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  markUpdateRead: (updateId: string) => void;
  createTask: (draft: Omit<StudentTask, "id" | "progressPercent" | "status"> & { id?: string }) => void;
  updateTask: (taskId: string, patch: Partial<StudentTask>) => void;
  createUpdate: (draft: Omit<StudioUpdate, "id" | "readByUserIds" | "studioId"> & { id?: string; studioId?: string }) => void;
  updateUpdate: (updateId: string, patch: Partial<StudioUpdate>) => void;
};

const StudioDataContext = createContext<Ctx | null>(null);

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function StudioDataProvider({ user, children }: { user: UserProfile; children: ReactNode }) {
  const { db, setDb } = useLocalDatabase();
  const mutate = useDomainMutation();
  const tasks = db.tasks;
  const updates = db.messages.studioUpdates;

  const setTasks = useCallback(
    (updater: StudentTask[] | ((prev: StudentTask[]) => StudentTask[])) => {
      setDb((prev) => ({
        ...prev,
        tasks: typeof updater === "function" ? updater(prev.tasks).map(normalizeTask) : updater.map(normalizeTask)
      }));
    },
    [setDb]
  );

  const setUpdates = useCallback(
    (updater: StudioUpdate[] | ((prev: StudioUpdate[]) => StudioUpdate[])) => {
      setDb((prev) => ({
        ...prev,
        messages: {
          ...prev.messages,
          studioUpdates: typeof updater === "function" ? updater(prev.messages.studioUpdates) : updater
        }
      }));
    },
    [setDb]
  );

  const recordTaskProgress = useCallback(
    (taskId: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const sid = user.id;
          let next: StudentTask = { ...t };
          if (t.targetType === "personal" && t.assignedStudentIds?.includes(sid)) {
            next.completedCount = Math.min(t.targetCompletions, t.completedCount + 1);
          } else {
            const cur = t.perStudentCompletions?.[sid] ?? 0;
            next.perStudentCompletions = { ...t.perStudentCompletions, [sid]: Math.min(t.targetCompletions, cur + 1) };
          }
          return normalizeTask(next);
        })
      );
    },
    [user.id]
  );

  const completeTask = useCallback(
    (taskId: string) => {
      mutate(studioTasks.buildCompleteTaskMutation(user, taskId));
    },
    [mutate, user]
  );

  const markUpdateRead = useCallback(
    (updateId: string) => {
      setUpdates((prev) =>
        prev.map((u) => {
          if (u.id !== updateId) return u;
          if (u.readByUserIds.includes(user.id)) return u;
          return { ...u, readByUserIds: [...u.readByUserIds, user.id] };
        })
      );
    },
    [user.id]
  );

  const createTask = useCallback(
    (draft: Omit<StudentTask, "id" | "progressPercent" | "status"> & { id?: string }) => {
      const input = studioTasks.buildCreateTaskMutation(user, draft);
      if (input) mutate({ ...input, actor: user });
    },
    [mutate, user]
  );

  const updateTask = useCallback(
    (taskId: string, patch: Partial<StudentTask>) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          if (!user.permissions.isManagement && !canTeacherEditTask(user, t)) return t;
          return normalizeTask({ ...t, ...patch, id: t.id });
        })
      );
    },
    [user]
  );

  const createUpdate = useCallback(
    (draft: Omit<StudioUpdate, "id" | "readByUserIds" | "studioId"> & { id?: string; studioId?: string }) => {
      const input = studioTasks.buildCreateStudioUpdateMutation(user, draft);
      if (input) mutate({ ...input, actor: user });
    },
    [mutate, user]
  );

  const updateUpdate = useCallback(
    (updateId: string, patch: Partial<StudioUpdate>) => {
      setUpdates((prev) =>
        prev.map((u) => {
          if (u.id !== updateId) return u;
          if (u.createdByUserId !== user.id && !user.permissions.isManagement) return u;
          return { ...u, ...patch, id: u.id };
        })
      );
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      tasks,
      updates,
      recordTaskProgress,
      completeTask,
      markUpdateRead,
      createTask,
      updateTask,
      createUpdate,
      updateUpdate
    }),
    [user, tasks, updates, recordTaskProgress, completeTask, markUpdateRead, createTask, updateTask, createUpdate, updateUpdate]
  );

  return <StudioDataContext.Provider value={value}>{children}</StudioDataContext.Provider>;
}

export function useStudioData(): Ctx {
  const x = useContext(StudioDataContext);
  if (!x) throw new Error("useStudioData must be used within StudioDataProvider");
  return x;
}

export function useStudioDataOptional(): Ctx | null {
  return useContext(StudioDataContext);
}

export type { StudentTask, StudioUpdate, TaskFrequency };
