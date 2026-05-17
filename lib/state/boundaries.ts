/**
 * Client state boundaries (React contexts) vs server data.
 *
 * | Layer | Location | Persistence | Production |
 * |-------|----------|-------------|------------|
 * | Session user | PlatformContext / page | localStorage + academy app session | httpOnly cookie |
 * | Studio tasks/updates | StudioDataContext | memory → Supabase | Realtime optional |
 * | Comms | CommunicationContext | memory → Supabase | Realtime channels |
 * | Shop cart | ShopContext | session | Server cart |
 * | Device layout | DeviceLayoutContext | localStorage prefs | Client only |
 * | Feature flags | PlatformContext | seed → `feature_flags` table | Per studio |
 *
 * Rule: contexts orchestrate UI; `lib/services/*` performs authorized IO.
 */

export const CLIENT_ONLY_KEYS = ["lk_view_mode", "lk_device_prefs", "lk_onboarding_done", "lk_session"] as const;
