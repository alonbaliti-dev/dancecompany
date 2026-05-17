import { DEFAULT_ACADEMY_ID } from "@/lib/v6/seed";

export type AcademyScopedActor = {
  userId: string;
  academyId?: string;
  academyIds?: string[];
  role?: "student" | "parent" | "teacher" | "management" | "super_admin";
  platformRole?: "super_admin";
};

export type AcademyScope = {
  academyId: string;
  actorUserId?: string;
  isSuperAdmin: boolean;
  source: "explicit" | "actor" | "default";
};

export type AcademyScopedQuery = {
  academyId: string;
};

export function isSuperAdminActor(actor?: Pick<AcademyScopedActor, "role" | "platformRole"> | null) {
  return actor?.role === "super_admin" || actor?.platformRole === "super_admin";
}

export function createAcademyScope(options: { academyId?: string; actor?: AcademyScopedActor | null }): AcademyScope {
  const actor = options.actor ?? null;
  const academyId = options.academyId ?? actor?.academyId ?? actor?.academyIds?.[0] ?? DEFAULT_ACADEMY_ID;

  if (!isSuperAdminActor(actor) && actor?.academyIds?.length && !actor.academyIds.includes(academyId)) {
    throw new Error("Actor cannot access the requested academy scope.");
  }

  return {
    academyId,
    actorUserId: actor?.userId,
    isSuperAdmin: isSuperAdminActor(actor),
    source: options.academyId ? "explicit" : actor?.academyId || actor?.academyIds?.length ? "actor" : "default"
  };
}

export function requireAcademyScope(scope: AcademyScope | AcademyScopedQuery): string {
  if (!scope.academyId?.trim()) {
    throw new Error("academyId is required for repository calls.");
  }

  return scope.academyId;
}

export function assertScopedAcademyId(row: { academyId?: string; academy_id?: string }, scope: AcademyScope | AcademyScopedQuery) {
  const rowAcademyId = row.academyId ?? row.academy_id;
  const scopedAcademyId = requireAcademyScope(scope);

  if (!rowAcademyId) {
    throw new Error("Repository writes must include academyId.");
  }

  if (rowAcademyId !== scopedAcademyId) {
    throw new Error("Repository write academyId does not match active academy scope.");
  }
}

export function assertCanQueryGlobalData(actor?: AcademyScopedActor | null) {
  if (!isSuperAdminActor(actor)) {
    throw new Error("Global data queries require Super Admin context.");
  }
}
