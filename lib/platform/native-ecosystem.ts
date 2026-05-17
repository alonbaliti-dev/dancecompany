import type { EntityId, IsoDateTimeString } from "@/lib/types/base";

/**
 * Phase 12 native ecosystem contracts.
 *
 * These types are intentionally inert. They document future API, sync,
 * device, display and backstage boundaries without wiring native apps,
 * display clients, realtime providers, service workers or runtime UI.
 */

export type NativeEcosystemRole =
  | "student"
  | "parent"
  | "teacher"
  | "assistant"
  | "academy_management"
  | "academy_owner"
  | "stage_manager"
  | "volunteer"
  | "super_admin";

export type NativeEcosystemSurface =
  | "web_pwa"
  | "ios_app"
  | "android_app"
  | "ipad_app"
  | "apple_watch_companion"
  | "studio_lobby_display"
  | "rehearsal_room_display"
  | "backstage_display"
  | "production_display"
  | "event_countdown_screen"
  | "live_schedule_board"
  | "tv_gallery_mode";

export type NativeDeviceFamily = "web" | "ios" | "android" | "ipad" | "watch" | "display" | "tv";

export type NativeEcosystemStatus = "documented" | "contract_only" | "adapter_later" | "deferred";

export type NativePermissionIntent =
  | "read_academy_snapshot"
  | "read_personal_schedule"
  | "mark_attendance"
  | "manage_rehearsal"
  | "manage_backstage"
  | "view_safe_display"
  | "view_staff_display"
  | "capture_media"
  | "upload_media"
  | "publish_media_after_review"
  | "send_live_update"
  | "register_device"
  | "manage_device";

export type NativeSyncPrimitive = "snapshot" | "command" | "event" | "queue_item" | "media_job" | "notification_intent";

export type NativeSyncConflictPolicy =
  | "server_wins"
  | "latest_server_state_with_user_confirmation"
  | "stage_manager_authority"
  | "merge_duplicate_media_drafts"
  | "read_only_no_conflict";

export type NativeNotificationPriority = "info" | "reminder" | "urgent" | "emergency";

export type NativeNotificationCadence = "instant" | "batched" | "digest" | "quiet_hours_deferred";

export type NativeMediaSyncState = "draft" | "queued" | "uploading" | "uploaded" | "processing" | "ready_for_review" | "published" | "failed";

export type NativeDisplayMode =
  | "lobby_today"
  | "rehearsal_room"
  | "backstage_queue"
  | "production_timeline"
  | "event_countdown"
  | "live_schedule"
  | "gallery_memory";

export type NativeWatchExperience =
  | "attendance_quick_mark"
  | "rehearsal_reminder"
  | "backstage_countdown"
  | "teacher_quick_action"
  | "stretch_reminder"
  | "event_notification"
  | "arrival_reminder";

export type NativeBackstageCapability =
  | "run_of_show_timeline"
  | "backstage_check_in"
  | "costume_readiness"
  | "emergency_contact_access"
  | "stage_queue"
  | "rehearsal_sequencing"
  | "production_communication"
  | "live_event_update";

export type NativeDesignAdaptationArea =
  | "native_touch"
  | "watch_glance"
  | "studio_display"
  | "event_mode_theme"
  | "backstage_theme"
  | "large_media_gallery"
  | "motion_haptics"
  | "accessibility_scaling";

export type NativeEcosystemPermissionContract = {
  requiredIntents: readonly NativePermissionIntent[];
  allowedRoles: readonly NativeEcosystemRole[];
  requiresServerValidation: true;
  requiresAudit: boolean;
  notes?: string;
};

export type NativeAcademyScopedContract = {
  id: EntityId;
  academyId: EntityId;
  surface: NativeEcosystemSurface;
  status: NativeEcosystemStatus;
  permission: NativeEcosystemPermissionContract;
  localFallbackPreserved: true;
};

export type NativeApiBoundaryContract = NativeAcademyScopedContract & {
  domain: "native_api_boundary";
  deviceFamily: NativeDeviceFamily;
  sharedLogicSource: "platform_api_and_domain_services";
  clientOwnsBusinessRules: false;
  authenticationFlow: "server_trusted_session_and_academy_membership";
  normalUsersCanSwitchAcademies: false;
  superAdminSwitchingRequiresExplicitAudit: true;
};

export type NativeDeviceRegistrationContract = NativeAcademyScopedContract & {
  domain: "device_registration";
  userId: EntityId;
  deviceFamily: NativeDeviceFamily;
  pushTokenStatus: "not_registered" | "registered_later" | "revoked" | "expired";
  consentRequired: true;
  quietHoursRequired: true;
  tokenScopedToAcademy: true;
};

export type NativeSyncContract = NativeAcademyScopedContract & {
  domain: "sync";
  primitive: NativeSyncPrimitive;
  sourceOfTruth: "platform_repository" | "cloudflare_r2_media";
  cacheScope: "academy" | "user" | "event" | "device_snapshot";
  offlineAllowed: boolean;
  conflictPolicy: NativeSyncConflictPolicy;
  idempotencyRequired: boolean;
  expiresAt?: IsoDateTimeString;
};

export type NativeOfflineQueueContract = NativeAcademyScopedContract & {
  domain: "offline_queue";
  actorUserId: EntityId;
  targetEntityId?: EntityId;
  action:
    | "attendance_mark"
    | "backstage_check_in"
    | "media_upload_draft"
    | "teacher_class_status"
    | "rehearsal_ready_state";
  allowedWhileOffline: true;
  blockedSensitiveActions: readonly ("role_change" | "billing" | "media_visibility_publish" | "academy_switch" | "emergency_contact_edit")[];
  idempotencyKey: string;
};

export type NativeNotificationContract = NativeAcademyScopedContract & {
  domain: "notification";
  priority: NativeNotificationPriority;
  cadence: NativeNotificationCadence;
  audience: "individual" | "role" | "group" | "event" | "academy_staff" | "emergency_contacts";
  requiresAudienceResolutionServerSide: true;
  quietHoursPolicy: "required_for_non_urgent";
  dedupeRequired: true;
  providerStatus: "not_integrated";
};

export type NativeMediaSyncContract = NativeAcademyScopedContract & {
  domain: "media_sync";
  mediaState: NativeMediaSyncState;
  captureSource: "web_upload" | "native_camera_later" | "background_upload_later" | "display_playback_later";
  storageProvider: "cloudflare_r2";
  keyPrefixPattern: "academies/{academyId}/...";
  requiresVisibilityReviewBeforePublish: true;
  largeScreenUsesApprovedRenditionsOnly: true;
};

export type NativeWatchContract = NativeAcademyScopedContract & {
  domain: "watch";
  experience: NativeWatchExperience;
  interactionModel: "single_glance_or_single_action";
  hapticsStatus: "adapter_later";
  maxSensitiveDetail: "none" | "assigned_group_status" | "event_countdown";
  mutations: "none" | "narrow_server_validated_commands";
};

export type NativeDisplaySnapshotContract = NativeAcademyScopedContract & {
  domain: "display";
  displayMode: NativeDisplayMode;
  readModel: "server_approved_snapshot";
  mutationAllowed: false;
  visibility: "safe_public" | "staff_only" | "production_only";
  staleStateIndicatorRequired: true;
  brandingSource: "academy_branding";
  distanceReadable: true;
};

export type NativeBackstageContract = NativeAcademyScopedContract & {
  domain: "backstage";
  eventId: EntityId;
  capability: NativeBackstageCapability;
  eventScoped: true;
  mobileFriendly: true;
  emergencyContactVisibility: "not_available" | "authorized_staff_only";
  stageManagerAuthority: boolean;
};

export type NativeDesignSystemContract = NativeAcademyScopedContract & {
  domain: "design_system";
  adaptationArea: NativeDesignAdaptationArea;
  createsDuplicateDesignSystem: false;
  requiresRtlReview: true;
  requiresAccessibilityReview: true;
  motionAndHapticsRespectReducedMotion: true;
};

export type NativeMultiDeviceQaContract = {
  id: EntityId;
  academyId: EntityId;
  deviceFamily: NativeDeviceFamily;
  surface: NativeEcosystemSurface;
  requiredChecks: readonly ("rtl" | "accessibility" | "offline" | "sync" | "privacy" | "stale_state" | "touch_target" | "reduced_motion")[];
  manualQaRequiredBeforeRuntimeRelease: true;
  phase12ManualQaStatus: "not_performed_docs_types_only";
};

export type NativeEcosystemTrack = {
  area:
    | "native_apps"
    | "apple_watch"
    | "studio_displays"
    | "backstage_show_mode"
    | "immersive_media"
    | "advanced_mobile"
    | "push_live"
    | "api_sync"
    | "multi_device_qa"
    | "design_system";
  status: NativeEcosystemStatus;
  safeNow: readonly string[];
  deferred: readonly string[];
  requiredBoundaries: readonly string[];
};

export const phase12EcosystemTracks = [
  {
    area: "native_apps",
    status: "contract_only",
    safeNow: ["shared API boundaries", "portable domain contracts", "offline sync rules", "auth and push strategy"],
    deferred: ["iOS app", "Android app", "iPad app", "native camera implementation"],
    requiredBoundaries: ["academy scope", "server validation", "shared permissions", "local fallback"]
  },
  {
    area: "apple_watch",
    status: "documented",
    safeNow: ["watch action vocabulary", "glanceable interaction constraints", "server-validated command rules"],
    deferred: ["watch app", "haptics adapter", "complications"],
    requiredBoundaries: ["minimal data", "role targeting", "idempotency", "no overloaded UI"]
  },
  {
    area: "studio_displays",
    status: "contract_only",
    safeNow: ["display snapshot contracts", "safe-public and staff-only visibility", "stale-state requirements"],
    deferred: ["display clients", "TV/gallery runtime", "device management"],
    requiredBoundaries: ["server-approved snapshots", "academy branding", "privacy", "read-only by default"]
  },
  {
    area: "backstage_show_mode",
    status: "contract_only",
    safeNow: ["backstage capability contracts", "stage manager authority model", "emergency contact visibility boundary"],
    deferred: ["production operations UI", "live stage queue runtime", "show-day provider integration"],
    requiredBoundaries: ["event scope", "role safety", "audit", "mobile-friendly operations"]
  },
  {
    area: "immersive_media",
    status: "contract_only",
    safeNow: ["media sync states", "approved rendition rules", "large-screen visibility constraints"],
    deferred: ["highlight reel generation", "cinematic presentation mode", "annual show archive UI"],
    requiredBoundaries: ["R2 academy prefix", "visibility review", "approved renditions", "consent"]
  },
  {
    area: "advanced_mobile",
    status: "documented",
    safeNow: ["gesture, haptic and offline-first direction", "background upload contracts"],
    deferred: ["native gestures", "background upload implementation", "camera optimization"],
    requiredBoundaries: ["PWA-safe web", "adapter-level native features", "offline queue review"]
  },
  {
    area: "push_live",
    status: "contract_only",
    safeNow: ["notification priority, cadence and targeting contracts", "dedupe and quiet-hours requirements"],
    deferred: ["push provider wiring", "realtime provider", "delivery dashboards"],
    requiredBoundaries: ["server audience resolution", "consent", "rate limits", "no notification overload"]
  },
  {
    area: "api_sync",
    status: "contract_only",
    safeNow: ["sync primitive vocabulary", "cache scope rules", "conflict policies", "idempotency requirements"],
    deferred: ["native sync engine", "display sync runtime", "watch sync runtime"],
    requiredBoundaries: ["platform source of truth", "server reconciliation", "academy cache isolation"]
  },
  {
    area: "multi_device_qa",
    status: "documented",
    safeNow: ["QA device matrix", "RTL/accessibility/reduced-motion requirements"],
    deferred: ["manual native device QA", "watch QA", "display lab testing"],
    requiredBoundaries: ["no runtime release without manual QA", "privacy review", "large-screen readability"]
  },
  {
    area: "design_system",
    status: "documented",
    safeNow: ["native, watch, display, event and backstage adaptation contracts"],
    deferred: ["native token export", "watch theme runtime", "display renderer"],
    requiredBoundaries: ["single design system", "RTL", "accessibility", "reduced motion"]
  }
] as const satisfies readonly NativeEcosystemTrack[];

export function createNativeApiBoundaryContract(input: {
  id: EntityId;
  academyId: EntityId;
  surface: NativeEcosystemSurface;
  deviceFamily: NativeDeviceFamily;
  allowedRoles: readonly NativeEcosystemRole[];
}): NativeApiBoundaryContract {
  return {
    id: input.id,
    academyId: input.academyId,
    surface: input.surface,
    status: "contract_only",
    domain: "native_api_boundary",
    deviceFamily: input.deviceFamily,
    sharedLogicSource: "platform_api_and_domain_services",
    clientOwnsBusinessRules: false,
    authenticationFlow: "server_trusted_session_and_academy_membership",
    normalUsersCanSwitchAcademies: false,
    superAdminSwitchingRequiresExplicitAudit: true,
    localFallbackPreserved: true,
    permission: {
      requiredIntents: ["read_academy_snapshot"],
      allowedRoles: input.allowedRoles,
      requiresServerValidation: true,
      requiresAudit: false
    }
  };
}

export function createDisplaySnapshotContract(input: {
  id: EntityId;
  academyId: EntityId;
  surface: Extract<
    NativeEcosystemSurface,
    "studio_lobby_display" | "rehearsal_room_display" | "backstage_display" | "production_display" | "event_countdown_screen" | "live_schedule_board" | "tv_gallery_mode"
  >;
  displayMode: NativeDisplayMode;
  visibility: NativeDisplaySnapshotContract["visibility"];
}): NativeDisplaySnapshotContract {
  return {
    id: input.id,
    academyId: input.academyId,
    surface: input.surface,
    status: "contract_only",
    domain: "display",
    displayMode: input.displayMode,
    readModel: "server_approved_snapshot",
    mutationAllowed: false,
    visibility: input.visibility,
    staleStateIndicatorRequired: true,
    brandingSource: "academy_branding",
    distanceReadable: true,
    localFallbackPreserved: true,
    permission: {
      requiredIntents: [input.visibility === "safe_public" ? "view_safe_display" : "view_staff_display"],
      allowedRoles: input.visibility === "safe_public" ? ["super_admin", "academy_owner", "academy_management"] : ["super_admin", "academy_owner", "academy_management", "teacher", "stage_manager"],
      requiresServerValidation: true,
      requiresAudit: input.visibility !== "safe_public"
    }
  };
}

export function createWatchActionContract(input: {
  id: EntityId;
  academyId: EntityId;
  experience: NativeWatchExperience;
  allowedRoles: readonly NativeEcosystemRole[];
}): NativeWatchContract {
  return {
    id: input.id,
    academyId: input.academyId,
    surface: "apple_watch_companion",
    status: "contract_only",
    domain: "watch",
    experience: input.experience,
    interactionModel: "single_glance_or_single_action",
    hapticsStatus: "adapter_later",
    maxSensitiveDetail: input.experience === "backstage_countdown" ? "event_countdown" : "assigned_group_status",
    mutations: input.experience === "attendance_quick_mark" || input.experience === "teacher_quick_action" ? "narrow_server_validated_commands" : "none",
    localFallbackPreserved: true,
    permission: {
      requiredIntents: input.experience === "attendance_quick_mark" ? ["mark_attendance"] : ["read_personal_schedule"],
      allowedRoles: input.allowedRoles,
      requiresServerValidation: true,
      requiresAudit: input.experience === "attendance_quick_mark" || input.experience === "teacher_quick_action"
    }
  };
}

export function createOfflineQueueContract(input: {
  id: EntityId;
  academyId: EntityId;
  surface: NativeEcosystemSurface;
  actorUserId: EntityId;
  action: NativeOfflineQueueContract["action"];
  idempotencyKey: string;
  targetEntityId?: EntityId;
}): NativeOfflineQueueContract {
  return {
    id: input.id,
    academyId: input.academyId,
    surface: input.surface,
    status: "contract_only",
    domain: "offline_queue",
    actorUserId: input.actorUserId,
    targetEntityId: input.targetEntityId,
    action: input.action,
    allowedWhileOffline: true,
    blockedSensitiveActions: ["role_change", "billing", "media_visibility_publish", "academy_switch", "emergency_contact_edit"],
    idempotencyKey: input.idempotencyKey,
    localFallbackPreserved: true,
    permission: {
      requiredIntents: input.action === "media_upload_draft" ? ["upload_media"] : ["mark_attendance"],
      allowedRoles: ["teacher", "assistant", "academy_management", "academy_owner", "stage_manager", "super_admin"],
      requiresServerValidation: true,
      requiresAudit: true
    }
  };
}
