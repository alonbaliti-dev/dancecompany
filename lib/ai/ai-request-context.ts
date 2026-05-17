import type { AIRequestContext, AIScope, AITargetEntityIds } from "./ai-types";

const roleScopes: Record<AIRequestContext["role"], AIScope[]> = {
  student: ["self"],
  parent: ["self", "linked_students"],
  teacher: ["self", "assigned_groups"],
  management: ["self", "assigned_groups", "studio_operations", "studio_management"],
  super_admin: ["self", "assigned_groups", "studio_operations", "studio_management", "system"]
};

export type AIContextValidationResult =
  | { ok: true; context: AIRequestContext }
  | { ok: false; code: string; message: string; status: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOnlySafeIds(ids: unknown): ids is string[] {
  return (
    Array.isArray(ids) &&
    ids.length <= 80 &&
    ids.every((id) => typeof id === "string" && /^[\p{L}\p{N}_:.-]{1,96}$/u.test(id))
  );
}

function parseTargetEntityIds(value: unknown): AITargetEntityIds | null {
  if (!isRecord(value)) return null;

  const parsed: AITargetEntityIds = {};
  for (const [key, ids] of Object.entries(value)) {
    if (!hasOnlySafeIds(ids)) return null;
    parsed[key as keyof AITargetEntityIds] = [...ids];
  }

  return Object.keys(parsed).length ? parsed : null;
}

function includesOnly(values: string[] | undefined, allowed: string[]) {
  return !values?.length || values.every((value) => allowed.includes(value));
}

function validateTargets(context: AIRequestContext): AIContextValidationResult | null {
  const { currentUser, allowedScope, targetEntityIds } = context;

  if (!includesOnly(targetEntityIds.studioIds, [currentUser.studioId])) {
    return { ok: false, code: "ai_forbidden_studio_target", message: "AI target studio is outside the current user studio.", status: 403 };
  }

  if (!includesOnly(targetEntityIds.academyIds, [context.academyId ?? currentUser.activeAcademyId ?? currentUser.academyId ?? currentUser.studioId])) {
    return { ok: false, code: "ai_forbidden_academy_target", message: "AI target academy is outside the current academy scope.", status: 403 };
  }

  if (currentUser.role === "super_admin" || currentUser.role === "management") return null;

  if (allowedScope === "self") {
    const selfTargets = [
      ...(targetEntityIds.userIds ?? []),
      ...(targetEntityIds.studentIds ?? []),
      ...(targetEntityIds.parentIds ?? []),
      ...(targetEntityIds.teacherIds ?? [])
    ];
    if (!selfTargets.every((id) => id === currentUser.id)) {
      return { ok: false, code: "ai_forbidden_self_target", message: "AI self scope can only target the current user.", status: 403 };
    }
  }

  if (allowedScope === "linked_students" && !includesOnly(targetEntityIds.studentIds, currentUser.linkedStudentIds)) {
    return { ok: false, code: "ai_forbidden_linked_student", message: "AI target student is not linked to the current parent.", status: 403 };
  }

  if (allowedScope === "assigned_groups" && !includesOnly(targetEntityIds.groupIds, currentUser.groupIds)) {
    return { ok: false, code: "ai_forbidden_group", message: "AI target group is not assigned to the current user.", status: 403 };
  }

  return null;
}

export function validateAIRequestContext(value: unknown): AIContextValidationResult {
  if (!isRecord(value) || !isRecord(value.currentUser)) {
    return { ok: false, code: "ai_context_required", message: "AI requests require currentUser, role, studioId, allowedScope, and targetEntityIds.", status: 401 };
  }

  const currentUser = value.currentUser as AIRequestContext["currentUser"];
  const role = value.role;
  const studioId = value.studioId;
  const academyId = typeof value.academyId === "string" ? value.academyId : currentUser.activeAcademyId ?? currentUser.academyId ?? currentUser.studioId;
  const allowedScope = value.allowedScope;
  const targetEntityIds = parseTargetEntityIds(value.targetEntityIds);

  if (
    typeof currentUser.id !== "string" ||
    typeof currentUser.studioId !== "string" ||
    typeof currentUser.role !== "string" ||
    typeof currentUser.active !== "boolean" ||
    !Array.isArray(currentUser.groupIds) ||
    !Array.isArray(currentUser.linkedStudentIds)
  ) {
    return { ok: false, code: "ai_invalid_user", message: "AI currentUser context is incomplete.", status: 400 };
  }

  if (!currentUser.active) {
    return { ok: false, code: "ai_inactive_user", message: "AI is not available for inactive users.", status: 403 };
  }

  if (role !== currentUser.role) {
    return { ok: false, code: "ai_role_mismatch", message: "AI request role does not match the current user.", status: 403 };
  }

  if (studioId !== currentUser.studioId) {
    return { ok: false, code: "ai_studio_mismatch", message: "AI request studio does not match the current user.", status: 403 };
  }

  if (currentUser.role !== "super_admin" && currentUser.academyIds?.length && !currentUser.academyIds.includes(academyId)) {
    return { ok: false, code: "ai_academy_denied", message: "AI request academy is not assigned to the current user.", status: 403 };
  }

  if (!roleScopes[currentUser.role]?.includes(allowedScope as AIScope)) {
    return { ok: false, code: "ai_scope_denied", message: "AI scope is not allowed for the current user role.", status: 403 };
  }

  if (!targetEntityIds) {
    return { ok: false, code: "ai_targets_required", message: "AI requests require explicit target entity IDs.", status: 400 };
  }

  const context = { currentUser, role: currentUser.role, studioId: currentUser.studioId, academyId, allowedScope: allowedScope as AIScope, targetEntityIds };
  return validateTargets(context) ?? { ok: true, context };
}

export const aiLocalMvpContextNotice =
  "Local MVP context validation: the server validates the submitted currentUser, role, studio, scope, and targets conservatively. Production auth should bind currentUser to a signed session before model access.";
