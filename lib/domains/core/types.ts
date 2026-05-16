import type { ActivityFeedKind } from "@/lib/platform-os/types";
import type { AuditLogEntry, UserProfile } from "@/lib/types";
import type { GuardResult } from "@/lib/security/guards";

export type DomainActor = Pick<
  UserProfile,
  "id" | "name" | "studioId" | "permissions" | "type" | "isParent" | "linkedStudentIds"
>;

export type DomainAuditInput = Omit<
  AuditLogEntry,
  "id" | "timestamp" | "actorUserId" | "actorName" | "studioId"
> & { studioId?: string };

export type DomainActivityInput = {
  kind: ActivityFeedKind;
  messageHe: string;
  messageEn?: string;
  visibility?: import("@/lib/platform-os/types").ActivityFeedItem["visibility"];
  relatedType?: string;
  relatedId?: string;
  targetUserIds?: string[];
  targetGroupIds?: string[];
};

export type DomainSyncInput = {
  actionType: string;
  payload: unknown;
};

export type DomainMutationInput = {
  actor: DomainActor;
  guard: GuardResult | (() => GuardResult);
  mutate: (db: import("@/lib/local-db/db-types").LocalDatabase) => import("@/lib/local-db/db-types").LocalDatabase;
  audit?: DomainAuditInput;
  activity?: DomainActivityInput;
  sync?: DomainSyncInput;
};

export type DomainMutationResult =
  | { ok: true; database: import("@/lib/local-db/db-types").LocalDatabase }
  | { ok: false; reason: string };
