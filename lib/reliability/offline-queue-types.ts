export type OfflineQueueDomain =
  | "attendance"
  | "messages"
  | "media_uploads"
  | "notifications"
  | "shop_orders"
  | "profile_updates";

export type OfflineQueueStatus = "queued" | "syncing" | "synced" | "failed" | "cancelled";

export type OfflineQueueItem<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  academyId: string;
  actorUserId: string;
  domain: OfflineQueueDomain;
  operation: string;
  payload: TPayload;
  status: OfflineQueueStatus;
  createdAt: string;
  updatedAt: string;
  retryCount: number;
  nextRetryAt?: string;
  lastErrorCode?: string;
};

export type OfflineQueuePolicy = {
  domain: OfflineQueueDomain;
  maxRetries: number;
  requiresUserConfirmation: boolean;
  blocksClassWorkflow: boolean;
};

export const phase6OfflineQueuePolicies: readonly OfflineQueuePolicy[] = [
  { domain: "attendance", maxRetries: 10, requiresUserConfirmation: false, blocksClassWorkflow: false },
  { domain: "messages", maxRetries: 5, requiresUserConfirmation: true, blocksClassWorkflow: false },
  { domain: "media_uploads", maxRetries: 8, requiresUserConfirmation: false, blocksClassWorkflow: false },
  { domain: "notifications", maxRetries: 5, requiresUserConfirmation: true, blocksClassWorkflow: false },
  { domain: "shop_orders", maxRetries: 3, requiresUserConfirmation: true, blocksClassWorkflow: true },
  { domain: "profile_updates", maxRetries: 3, requiresUserConfirmation: true, blocksClassWorkflow: false }
];
