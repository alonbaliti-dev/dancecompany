/**
 * Application service layer — orchestrates repositories, security, and side effects.
 * Contexts call these services (or thin hooks wrapping them) instead of raw Supabase.
 */
import type { UserProfile } from "@/lib/types";
import type {
  IAuditRepository,
  IAuthRepository,
  IChatRepository,
  IEventRepository,
  IFeatureFlagRepository,
  IGalleryRepository,
  IGroupRepository,
  INotificationRepository,
  IShopRepository,
  ITaskRepository,
  IUpdateRepository
} from "@/lib/database/repositories/interfaces";

export type ServiceContext = {
  user: UserProfile;
  /** Set when Supabase session is active; null in mock-only dev. */
  supabaseReady: boolean;
};

export type LKServices = {
  auth: IAuthRepository;
  tasks: ITaskRepository;
  notifications: INotificationRepository;
  updates: IUpdateRepository;
  chats: IChatRepository;
  gallery: IGalleryRepository;
  events: IEventRepository;
  shop: IShopRepository;
  audit: IAuditRepository;
  groups: IGroupRepository;
  featureFlags: IFeatureFlagRepository;
};
