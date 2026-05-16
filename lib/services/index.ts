/**
 * Service registry — swap mock vs Supabase implementations via env.
 *
 * Today: contexts own mock state (StudioDataContext, CommunicationContext).
 * Migration: inject `getServices(user)` that returns Supabase-backed repos.
 */
export { authService } from "./auth-service";
export { taskService } from "./task-service";
export { notificationService } from "./notification-service";
export { galleryService } from "./gallery-service";
export { studioService } from "./studio-service";
export { userService } from "./user-service";
export { auditService } from "./audit-service";
export { featureFlagService } from "./feature-flag-service";
export * from "./achievement-service";
export { chatService } from "./chat-service";
export { eventService } from "./event-service";
export { reportService } from "./report-service";
export { shopService } from "./shop-service";
export { updateService } from "./update-service";
export type { LKServices, ServiceContext } from "./interfaces";
