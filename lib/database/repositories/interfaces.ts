/**
 * Repository contracts — implemented by Supabase queries today, mock seeds in dev.
 * Each method documents the future table/view and RLS expectations.
 */
import type {
  AuditLogEntry,
  DanceGroupChat,
  GalleryItem,
  GeneratedAchievement,
  Notification,
  ShopOrder,
  ShopProduct,
  StudentTask,
  StudioEvent,
  StudioGroup,
  StudioUpdate,
  UserProfile
} from "@/lib/types";
import type { EntityId } from "@/lib/types/base";

export type ListParams = {
  studioId: string;
  limit?: number;
  cursor?: string;
};

export interface IAuthRepository {
  /** profiles + user_permissions joined on auth.users */
  getProfileByAuthId(authUserId: string): Promise<UserProfile | null>;
}

export interface ITaskRepository {
  /** `tasks` — RLS: studio_id + audience rules */
  listVisible(user: UserProfile): Promise<StudentTask[]>;
  getById(studioId: string, taskId: EntityId): Promise<StudentTask | null>;
  recordProgress(studioId: string, taskId: EntityId, studentId: EntityId, delta: number): Promise<void>;
}

export interface INotificationRepository {
  /** `notifications` + read receipts */
  listInbox(user: UserProfile, params?: ListParams): Promise<Notification[]>;
  markRead(studioId: string, notificationId: EntityId, userId: EntityId): Promise<void>;
}

export interface IUpdateRepository {
  /** `studio_updates` */
  listForUser(user: UserProfile): Promise<StudioUpdate[]>;
  create(row: Omit<StudioUpdate, "id" | "readByUserIds">): Promise<StudioUpdate>;
}

export interface IChatRepository {
  /** `group_chats`, `chat_messages` — Realtime channel per chat */
  listChats(user: UserProfile): Promise<DanceGroupChat[]>;
  subscribeMessages(chatId: EntityId, onMessage: (msg: unknown) => void): () => void;
}

export interface IGalleryRepository {
  /** `gallery_items` + Storage bucket `gallery/{studioId}/` */
  listVisible(user: UserProfile): Promise<GalleryItem[]>;
  createUploadUrl(studioId: string, path: string): Promise<{ signedUrl: string }>;
}

export interface IEventRepository {
  /** `studio_events`, `event_achievements` */
  listEvents(studioId: string): Promise<StudioEvent[]>;
}

export interface IAchievementRepository {
  listStudio(studioId: string): Promise<GeneratedAchievement[]>;
}

export interface IShopRepository {
  listProducts(studioId: string): Promise<ShopProduct[]>;
  listOrders(studioId: string, userId?: EntityId): Promise<ShopOrder[]>;
}

export interface IAuditRepository {
  /** Append-only `audit_logs` — management+ read, platform admin cross-studio */
  append(entry: Omit<AuditLogEntry, "id">): Promise<AuditLogEntry>;
  list(studioId: string, limit?: number): Promise<AuditLogEntry[]>;
}

export interface IGroupRepository {
  listGroups(studioId: string): Promise<StudioGroup[]>;
}

export interface IFeatureFlagRepository {
  getEffectiveFlags(studioId: string): Promise<Record<string, boolean>>;
}
