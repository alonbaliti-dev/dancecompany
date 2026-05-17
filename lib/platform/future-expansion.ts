/**
 * Inert Phase 4 contracts for future platform expansion.
 *
 * These types document academy-aware, permission-aware, audit-aware boundaries.
 * They are intentionally not wired into runtime UI, repositories, migrations, or providers.
 */

export type FutureExpansionDomain =
  | "multi_academy"
  | "event_show_mode"
  | "native_and_displays"
  | "ai_orchestration"
  | "communication"
  | "finance"
  | "media_pipeline"
  | "security_operations"
  | "design_system";

export type FutureFoundationStatus = "documented" | "contract_only" | "model_placeholder" | "deferred";

export type FutureActorRole = "student" | "parent" | "teacher" | "management" | "super_admin" | "stage_manager" | "volunteer";

export type FutureAuditLevel = "required" | "required_for_sensitive_changes" | "read_only";

export type FuturePermissionIntent =
  | "read_academy"
  | "switch_academy"
  | "manage_academy"
  | "manage_branding"
  | "manage_feature_package"
  | "manage_storage"
  | "view_analytics"
  | "manage_event"
  | "manage_backstage"
  | "publish_communication"
  | "approve_ai_draft"
  | "manage_finance"
  | "manage_media_pipeline"
  | "view_operational_health"
  | "manage_design_tokens";

export type FutureLifecycleStatus =
  | "draft"
  | "pilot"
  | "active"
  | "paused"
  | "completed"
  | "archived"
  | "disabled";

export type FutureAuditContract = {
  level: FutureAuditLevel;
  actionType: string;
  actorUserIdField: "actorUserId";
  academyIdField: "academyId";
  sensitiveFields?: readonly string[];
};

export type FuturePermissionContract = {
  requiredIntents: readonly FuturePermissionIntent[];
  allowedRoles: readonly FutureActorRole[];
  superAdminOverride: boolean;
  notes?: string;
};

export type FutureAcademyScopedContract = {
  id: string;
  academyId: string;
  status: FutureLifecycleStatus;
  permission: FuturePermissionContract;
  audit: FutureAuditContract;
};

export type FutureStorageIsolationPolicy = FutureAcademyScopedContract & {
  domain: "media_pipeline" | "event_show_mode" | "communication";
  provider: "cloudflare_r2";
  keyPrefixPattern: "academies/{academyId}/...";
  lifecyclePolicy: "manual_review" | "archive_after_retention" | "retain_until_deleted";
  publicAccess: "never_direct" | "signed_url_only" | "cdn_after_visibility_check";
};

export type FutureAcademyTemplate = FutureAcademyScopedContract & {
  domain: "multi_academy";
  templateKey: "starter" | "single_location" | "multi_location" | "competition_school" | "annual_show_heavy";
  presetAreas: readonly ("branding" | "schedule" | "communication" | "events" | "media_visibility" | "feature_package")[];
  canApplyWithoutReview: false;
};

export type FutureAcademyBrandingPackage = FutureAcademyScopedContract & {
  domain: "multi_academy" | "design_system";
  packageKey: string;
  supportsRtl: true;
  requiresAccessibilityReview: true;
  tokenScopes: readonly ("color" | "typography" | "spacing" | "motion" | "display")[];
};

export type FutureAcademyFeaturePackage = FutureAcademyScopedContract & {
  domain: "multi_academy";
  packageKey: "pilot" | "standard" | "professional" | "enterprise" | "event_season";
  enabledDomains: readonly FutureExpansionDomain[];
  billingMode: "not_implemented" | "future_contract_only";
  rolloutNotes: string;
};

export type FutureAcademyOnboardingStep =
  | "academy_shell"
  | "branding_preset"
  | "feature_package"
  | "people_import"
  | "permission_validation"
  | "data_integrity_check"
  | "pilot_launch"
  | "go_live";

export type FutureAcademyOnboardingPlan = FutureAcademyScopedContract & {
  domain: "multi_academy";
  slug: string;
  timezone: string;
  locale: "he-IL" | "en-US";
  currentStep: FutureAcademyOnboardingStep;
  completedSteps: readonly FutureAcademyOnboardingStep[];
  templateId?: string;
  brandingPackageId?: string;
  featurePackageId?: string;
};

export type FutureAcademySwitchingContract = FutureAcademyScopedContract & {
  domain: "multi_academy";
  switchMode: "explicit_user_action";
  activeAcademySource: "server_session" | "trusted_actor_scope";
  crossAcademyDataVisibleDuringSwitch: false;
};

export type FutureAcademyHealthSignal = FutureAcademyScopedContract & {
  domain: "multi_academy" | "security_operations";
  signalType: "sync" | "data_integrity" | "media_storage" | "failed_jobs" | "permission_anomaly" | "provider_outage";
  severity: "info" | "attention" | "critical";
  requiresAdminAlert: boolean;
};

export type FutureEventMode = "annual_show" | "competition" | "recital" | "rehearsal_day";

export type FutureStageReadinessState = "not_started" | "rehearsing" | "called" | "ready" | "on_stage" | "complete" | "blocked";

export type FutureEventOperationMode = "backstage" | "live_production" | "stage_manager" | "rehearsal_sequence" | "audience_updates";

export type FutureEventChecklistItem = FutureAcademyScopedContract & {
  domain: "event_show_mode";
  eventId: string;
  checklistType: "costume" | "arrival" | "emergency_contact" | "stage_readiness" | "rehearsal" | "production";
  ownerRole: FutureActorRole;
  completionState: "not_started" | "in_progress" | "done" | "blocked";
  sensitive: boolean;
};

export type FutureShowRunOrderItem = FutureAcademyScopedContract & {
  domain: "event_show_mode";
  eventId: string;
  mode: FutureEventMode;
  sequenceNumber: number;
  title: string;
  groupIds: readonly string[];
  expectedStartIso?: string;
  rehearsalSequence?: number;
  backstageStatus: FutureStageReadinessState;
  costumeStatus: "not_checked" | "partial" | "ready" | "issue_reported";
  readinessBlocker?: "missing_student" | "costume_issue" | "music_issue" | "stage_delay" | "emergency";
};

export type FutureStageTimelineItem = FutureAcademyScopedContract & {
  domain: "event_show_mode";
  eventId: string;
  mode: FutureEventMode;
  operationMode: FutureEventOperationMode;
  runOrderItemId?: string;
  plannedStartIso?: string;
  plannedEndIso?: string;
  readiness: FutureStageReadinessState;
  visibleToAudience: false;
};

export type FutureEventCheckInFlow = FutureAcademyScopedContract & {
  domain: "event_show_mode";
  eventId: string;
  mode: FutureEventMode;
  checkInType: "student_arrival" | "guardian_pickup" | "staff_arrival" | "volunteer_arrival";
  requiresEmergencyContactVisibility: boolean;
  liveUpdateAudience: "staff_only" | "teachers" | "parents" | "academy";
};

export type FutureDeviceSurface =
  | "apple_watch_companion"
  | "studio_lobby_display"
  | "rehearsal_room_display"
  | "backstage_screen"
  | "schedule_screen"
  | "class_status_board"
  | "teacher_display"
  | "rehearsal_countdown"
  | "attendance_quick_mode"
  | "backstage_display";

export type FutureWearableAction =
  | "attendance_quick_mark"
  | "rehearsal_reminder"
  | "countdown"
  | "student_stretch_reminder"
  | "teacher_quick_action"
  | "backstage_notification";

export type FutureDeviceSurfaceContract = FutureAcademyScopedContract & {
  domain: "native_and_displays";
  surface: FutureDeviceSurface;
  sourceOfTruth: "server_approved_snapshot";
  mayMutateOperationalState: false;
  refreshMode: "manual" | "short_polling" | "realtime_later";
  announcementMode?: "none" | "safe_public" | "staff_only";
  wearableActions?: readonly FutureWearableAction[];
};

export type FutureAISuggestionArea =
  | "choreography_assistance"
  | "movement_analysis"
  | "practice_consistency_analysis"
  | "engagement_prediction"
  | "media_auto_tagging"
  | "rehearsal_readiness"
  | "event_summarization"
  | "studio_operational_insights"
  | "onboarding_assistance"
  | "smart_reminders";

export type FutureAISuggestionContract = FutureAcademyScopedContract & {
  domain: "ai_orchestration";
  area: FutureAISuggestionArea;
  outputMode: "suggestion_only";
  autonomousActionsAllowed: false;
  requiresHumanApproval: true;
  contextPolicy: "permission_filtered_academy_scope";
};

export type FutureCommunicationChannel = "push" | "email" | "sms" | "whatsapp" | "in_app";

export type FutureCommunicationFlow = FutureAcademyScopedContract & {
  domain: "communication";
  channel: FutureCommunicationChannel;
  providerStatus: "not_integrated" | "adapter_contract_only";
  audience: "academy" | "role" | "group" | "event" | "individual" | "emergency_contacts";
  flowType: "broadcast" | "event_reminder" | "emergency_alert" | "reminder_campaign" | "direct";
  requiresConsent: boolean;
  quietHoursPolicy: "required";
};

export type FutureFinanceContract = FutureAcademyScopedContract & {
  domain: "finance";
  financeArea: "invoice" | "refund" | "academy_summary" | "teacher_payment" | "subscription_plan" | "academy_billing" | "revenue_summary" | "financial_export";
  implementationStatus: "not_implemented";
  separatesStudentCommerceFromAcademyBilling: true;
};

export type FutureMediaProcessingStatus = "queued" | "processing" | "needs_review" | "ready" | "failed" | "archived";

export type FutureMediaRenditionRef = {
  r2Key: string;
  mediaType: "thumbnail" | "preview" | "streaming_rendition" | "compressed_original";
  mimeType: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
};

export type FutureMediaPipelineJob = FutureAcademyScopedContract & {
  domain: "media_pipeline";
  jobType:
    | "transcode_video"
    | "generate_thumbnail"
    | "prepare_streaming"
    | "compress_asset"
    | "optimize_cdn"
    | "archive_asset"
    | "ai_tag_media"
    | "create_highlight_reel"
    | "generate_memory_timeline";
  sourceStorage: "cloudflare_r2";
  processingStatus: FutureMediaProcessingStatus;
  outputRefs?: readonly FutureMediaRenditionRef[];
  visibilityCheckRequiredBeforePublish: true;
  idempotencyKeyRequired: true;
};

export type FutureSecurityOperationsContract = FutureAcademyScopedContract & {
  domain: "security_operations";
  operationArea: "monitoring" | "audit_expansion" | "academy_isolation" | "media_access" | "backup_lifecycle" | "disaster_recovery" | "operational_logs" | "admin_alerts";
  storesSensitiveData: false;
  requiresRunbook: true;
};

export type FutureDesignSystemContract = FutureAcademyScopedContract & {
  domain: "design_system";
  designArea: "academy_theme" | "event_mode_theme" | "backstage_mode" | "studio_display" | "accessibility_scaling" | "large_media_gallery" | "native_adaptation";
  touchesRuntimeUi: false;
  requiresRtlReview: true;
  requiresAccessibilityReview: true;
};

export type FutureExpansionTrack = {
  domain: FutureExpansionDomain;
  status: FutureFoundationStatus;
  safeNow: readonly string[];
  deferred: readonly string[];
  requiredContracts: readonly string[];
};

export const futureExpansionTracks = [
  {
    domain: "multi_academy",
    status: "contract_only",
    safeNow: ["academy-aware models", "template contracts", "feature package contracts", "storage isolation policies", "health signal vocabulary"],
    deferred: ["full SaaS billing", "automatic onboarding imports", "cross-academy dashboards"],
    requiredContracts: ["permission", "audit", "academy scope", "local fallback"]
  },
  {
    domain: "event_show_mode",
    status: "contract_only",
    safeNow: ["run order models", "check-in contracts", "checklist models", "stage timeline placeholders", "backstage status vocabulary"],
    deferred: ["live production dashboards", "competition mode UI", "stage manager workflows"],
    requiredContracts: ["permission", "audit", "emergency contact visibility", "event scope"]
  },
  {
    domain: "native_and_displays",
    status: "documented",
    safeNow: ["surface contracts", "wearable action vocabulary", "server-approved snapshot expectations"],
    deferred: ["Apple Watch app", "native push", "display device control"],
    requiredContracts: ["read-only snapshots", "academy scope", "device permissions"]
  },
  {
    domain: "ai_orchestration",
    status: "contract_only",
    safeNow: ["suggestion-only orchestration contracts", "approval requirements", "future AI area vocabulary"],
    deferred: ["movement analysis", "autonomous workflows", "provider expansion"],
    requiredContracts: ["human approval", "permission-filtered context", "audit"]
  },
  {
    domain: "communication",
    status: "model_placeholder",
    safeNow: ["channel contracts", "emergency alert contracts", "campaign vocabulary", "consent and quiet-hours requirements"],
    deferred: ["real push provider", "SMS provider", "WhatsApp provider"],
    requiredContracts: ["targeting", "consent", "audit", "rate limits"]
  },
  {
    domain: "finance",
    status: "documented",
    safeNow: ["finance area vocabulary", "revenue summary placeholders", "financial export placeholders", "academy billing separation"],
    deferred: ["accounting", "payment processing", "teacher payouts", "subscription enforcement"],
    requiredContracts: ["permission", "audit", "refund policy", "billing ownership"]
  },
  {
    domain: "media_pipeline",
    status: "contract_only",
    safeNow: ["R2-first job contracts", "processing status models", "rendition references", "visibility checks", "idempotency requirements"],
    deferred: ["transcoding workers", "streaming", "AI tagging", "highlight reels"],
    requiredContracts: ["storage isolation", "visibility", "audit", "job retry policy"]
  },
  {
    domain: "security_operations",
    status: "documented",
    safeNow: ["monitoring vocabulary", "audit expansion boundaries", "backup and recovery contracts"],
    deferred: ["live monitoring provider", "alert routing", "automated recovery"],
    requiredContracts: ["academy isolation", "audit", "runbooks", "admin permissions"]
  },
  {
    domain: "design_system",
    status: "documented",
    safeNow: ["theme contract vocabulary", "display mode constraints", "RTL and accessibility review requirements"],
    deferred: ["theme editor", "native design token export", "large gallery rebuild"],
    requiredContracts: ["RTL review", "accessibility review", "no runtime UI churn"]
  }
] as const satisfies readonly FutureExpansionTrack[];
