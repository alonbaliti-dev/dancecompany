import type { LocalDatabase } from "@/lib/local-db/db-types";
import {
  canTeacherCreateTarget,
  canTeacherCreateUpdateTarget,
  canTeacherEditTask,
  normalizeTask
} from "@/lib/studio-task-logic";
import type { StudentTask, StudioUpdate, UserProfile } from "@/lib/types";
import { domainGuards } from "../core/permissions";
import type { DomainMutationInput } from "../core/types";

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function buildCreateTaskMutation(
  actor: UserProfile,
  draft: Omit<StudentTask, "id" | "progressPercent" | "status"> & { id?: string }
): DomainMutationInput | null {
  if (!actor.permissions.isManagement && !canTeacherCreateTarget(actor, draft.targetType)) {
    return null;
  }
  const row: StudentTask = normalizeTask({
    ...draft,
    id: draft.id ?? newId("st"),
    progressPercent: 0,
    status: "not_started"
  });
  return {
    actor,
    guard: domainGuards.createTask(actor),
    mutate: (db) => ({ ...db, tasks: [...db.tasks, row] }),
    audit: {
      action: `משימה נוצרה: ${row.title}`,
      targetType: "task",
      targetId: row.id,
      severity: "info"
    },
    activity: {
      kind: "task_completed",
      messageHe: `משימה חדשה: ${row.title}`,
      relatedType: "task",
      relatedId: row.id,
      visibility: "studio"
    }
  };
}

export function buildUpdateTaskMutation(
  actor: UserProfile,
  taskId: string,
  patch: Partial<StudentTask>
): DomainMutationInput | null {
  return {
    actor,
    guard: domainGuards.teacherOrManagement(actor),
    mutate: (db) => ({
      ...db,
      tasks: db.tasks.map((t) => {
        if (t.id !== taskId) return t;
        if (!actor.permissions.isManagement && !canTeacherEditTask(actor, t)) return t;
        return normalizeTask({ ...t, ...patch, id: t.id });
      })
    }),
    audit: {
      action: "משימה עודכנה",
      targetType: "task",
      targetId: taskId,
      severity: "info"
    }
  };
}

export function buildCompleteTaskMutation(actor: UserProfile, taskId: string): DomainMutationInput {
  const sid = actor.id;
  return {
    actor,
    guard: () => ({ allowed: true }),
    mutate: (db) => ({
      ...db,
      tasks: db.tasks.map((t) => {
        if (t.id !== taskId) return t;
        let next: StudentTask = { ...t };
        if (t.targetType === "personal" && t.assignedStudentIds?.includes(sid)) {
          next.completedCount = t.targetCompletions;
        } else {
          next.perStudentCompletions = {
            ...t.perStudentCompletions,
            [sid]: t.targetCompletions
          };
        }
        return normalizeTask(next);
      })
    }),
    audit: {
      action: "משימה הושלמה",
      targetType: "task",
      targetId: taskId,
      severity: "info"
    },
    activity: {
      kind: "task_completed",
      messageHe: `${actor.name} השלים/ה משימה`,
      relatedType: "task",
      relatedId: taskId,
      visibility: "group"
    }
  };
}

export function buildCreateStudioUpdateMutation(
  actor: UserProfile,
  draft: Omit<StudioUpdate, "id" | "readByUserIds" | "studioId"> & { id?: string; studioId?: string }
): DomainMutationInput | null {
  if (!actor.permissions.isManagement && !canTeacherCreateUpdateTarget(actor, draft.targetType)) {
    return null;
  }
  const row: StudioUpdate = {
    ...draft,
    studioId: draft.studioId ?? actor.studioId,
    id: draft.id ?? newId("up"),
    readByUserIds: []
  };
  return {
    actor,
    guard: domainGuards.sendStudioUpdate(actor),
    mutate: (db) => ({
      ...db,
      messages: {
        ...db.messages,
        studioUpdates: [row, ...db.messages.studioUpdates]
      }
    }),
    audit: {
      action: `עדכון סטודיו: ${row.title}`,
      targetType: "notification",
      targetId: row.id,
      severity: "info"
    },
    activity: {
      kind: "update_sent",
      messageHe: row.title,
      relatedType: "studio_update",
      relatedId: row.id,
      visibility: "studio"
    }
  };
}
