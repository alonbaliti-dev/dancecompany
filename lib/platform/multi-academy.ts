import type { EntityId, IsoDateString, IsoDateTimeString } from "@/lib/types/base";
import type { AcademyBranding, AcademyFeatureFlag, V6Permissions } from "@/lib/v6/types";

/**
 * Phase 10 multi-academy contracts.
 *
 * These models are intentionally inert: they prepare Super Admin tools,
 * migrations, support runbooks and future UI without changing live LK Studio flows.
 */

export type AcademyLifecycleState = "draft" | "setup" | "pilot" | "active" | "paused" | "archived" | "recovery";

export type AcademyManagementRole = "academy_owner" | "academy_management" | "teacher" | "assistant" | "parent" | "student";

export type AcademyCreationChannel = "super_admin_manual" | "super_admin_import" | "migration_from_existing_academy";

export type AcademyFeaturePackageKey = "basic_academy" | "competition_academy" | "kids_focused_academy" | "adult_dance_academy" | "performing_arts_academy";

export type AcademyEntitlement =
  | "shop"
  | "private_lessons"
  | "ai_insights"
  | "gallery"
  | "event_mode"
  | "backstage_mode_later"
  | "advanced_notifications"
  | "practice_tracking"
  | "payments_later"
  | "storage_usage_later";

export type AcademyAnalyticsMetric =
  | "engagement"
  | "attendance_trends"
  | "practice_completion"
  | "gallery_usage"
  | "event_participation"
  | "payment_order_summaries";

export type AcademySupportTool =
  | "academy_setup"
  | "academy_repair"
  | "user_migration"
  | "academy_export_import"
  | "academy_archive"
  | "academy_recovery";

export type AcademyBrandingDraft = {
  logoUrl?: string;
  colors: {
    primary: string;
    secondary: string;
    highlight: string;
  };
  loginPage: {
    welcomeText: string;
    backgroundMood: string;
    customHeroImageUrl?: string;
  };
  galleryMood: string;
  eventStyle: string;
  shopAtmosphere: string;
  futureDomain?: {
    subdomain?: string;
    customDomain?: string;
    status: "not_configured" | "reserved_for_later";
  };
};

export type AcademyContactInfo = {
  ownerName?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
};

export type AcademyAdminAssignment = {
  userId: EntityId;
  role: "academy_owner" | "academy_management";
  assignedBySuperAdminUserId: EntityId;
  assignedAt: IsoDateTimeString;
};

export type AcademyRolePermissionDefaults = Record<AcademyManagementRole, Partial<V6Permissions>>;

export type AcademyOnboardingDraft = {
  id: EntityId;
  academyId: EntityId;
  createdBySuperAdminUserId: EntityId;
  channel: AcademyCreationChannel;
  lifecycleState: AcademyLifecycleState;
  academy: {
    name: string;
    slug: string;
    location: string;
    timezone: string;
    contactInfo: AcademyContactInfo;
  };
  branding: AcademyBrandingDraft;
  featurePackageKey: AcademyFeaturePackageKey;
  defaultPermissions: AcademyRolePermissionDefaults;
  academyAdminAssignment?: AcademyAdminAssignment;
  noPublicSelfSignup: true;
  audit: {
    required: true;
    action: "academy.create";
    sensitiveFields: readonly ("contactInfo" | "adminAssignment" | "branding")[];
  };
};

export type AcademyFeaturePackage = {
  key: AcademyFeaturePackageKey;
  label: string;
  description: string;
  enabledFlags: readonly AcademyFeatureFlag[];
  entitlements: readonly AcademyEntitlement[];
  defaultRolePermissions: AcademyRolePermissionDefaults;
  billingReadiness: "not_billed" | "future_subscription_contract_only";
};

export type AcademyMediaIsolationContract = {
  academyId: EntityId;
  bucket: "academy-media";
  keyPrefix: `academies/${string}/`;
  galleriesPrefix: `academies/${string}/galleries/`;
  archivePrefix: `academies/${string}/archive/`;
  uploadsPrefix: `academies/${string}/uploads/`;
  publicAccess: "never_direct_for_private_media";
  visibilitySourceOfTruth: "academy_scoped_media_metadata";
  crossAcademyAccessAllowed: false;
};

export type AcademyAnalyticsContract = {
  academyId: EntityId;
  metric: AcademyAnalyticsMetric;
  viewer: "academy_management" | "super_admin";
  aggregationScope: "single_academy" | "platform_aggregate";
  storesPersonalDetails: false;
  storesMediaContent: false;
  requiresAcademyScopeFilter: true;
};

export type AcademySupportToolContract = {
  tool: AcademySupportTool;
  allowedRole: "super_admin";
  requiresAcademyId: true;
  requiresAudit: true;
  canAffectLiveAcademy: boolean;
  localFallbackPreserved: true;
};

export type AcademyScalingSafetyContract = {
  area: "queries" | "media" | "events" | "notifications" | "analytics" | "imports";
  rule: string;
  requiredIndexOrLimit: string;
  failureModeToAvoid: string;
};

export type AcademySubscriptionStatus = "not_started" | "trial_later" | "active_later" | "paused_later" | "cancelled_later";

export type AcademyBillingPreparation = {
  academyId: EntityId;
  featurePackageKey: AcademyFeaturePackageKey;
  subscriptionStatus: AcademySubscriptionStatus;
  billingPlanId?: EntityId;
  invoiceCustomerId?: EntityId;
  storageUsageTracking: "planned_not_enforced";
  enforcementMode: "none_phase_10";
  separatesAcademyBillingFromStudentPayments: true;
};

export type AcademySwitchingContract = {
  actorUserId: EntityId;
  activeAcademyId: EntityId;
  visibleAcademyName: string;
  allowedAcademyIds: readonly EntityId[];
  role: "super_admin";
  switchMode: "explicit_super_admin_action";
  brandingRefresh: "immediate_after_switch";
  crossEditProtection: "require_visible_current_academy_context";
  normalUsersCanSwitch: false;
};

export type AcademyTemplateKey = "kids_dance_academy" | "flamenco_academy" | "competition_academy" | "performing_arts_academy";

export type AcademyTemplatePreset = {
  key: AcademyTemplateKey;
  label: string;
  brandingDefaults: Pick<AcademyBranding, "accentColors" | "backgroundMood" | "galleryMood" | "eventMood" | "shopMood">;
  featurePackageKey: AcademyFeaturePackageKey;
  terminologyDefaults: readonly string[];
  eventStructureDefaults: readonly ("regular_classes" | "annual_show" | "competitions" | "workshops" | "recitals")[];
};

const noAccess: Partial<V6Permissions> = {};

export const phase10DefaultPermissions = {
  academy_owner: {
    manageUsers: true,
    editCredentials: true,
    editPermissions: true,
    manageStudio: true,
    manageAttendance: true,
    manageShop: true,
    managePrivateLessons: true,
    manageMedia: true,
    exportImportDb: true,
    editText: true,
    viewAudit: true,
    manageFlags: true,
    manageBranding: true,
    systemHealth: true
  },
  academy_management: {
    manageUsers: true,
    editCredentials: true,
    manageStudio: true,
    manageAttendance: true,
    manageShop: true,
    managePrivateLessons: true,
    manageMedia: true,
    editText: true,
    viewAudit: true,
    manageBranding: true,
    systemHealth: true
  },
  teacher: {
    manageAttendance: true,
    managePrivateLessons: true,
    manageMedia: true
  },
  assistant: {
    manageAttendance: true
  },
  parent: noAccess,
  student: noAccess
} as const satisfies AcademyRolePermissionDefaults;

export const phase10FeaturePackages = [
  {
    key: "basic_academy",
    label: "Basic academy",
    description: "Core attendance, gallery, messages and simple shop foundations for a calm first rollout.",
    enabledFlags: ["attendance", "media_gallery", "shop"],
    entitlements: ["gallery", "shop"],
    defaultRolePermissions: phase10DefaultPermissions,
    billingReadiness: "future_subscription_contract_only"
  },
  {
    key: "competition_academy",
    label: "Competition academy",
    description: "Adds event mode, practice tracking and future backstage readiness for competition-heavy schools.",
    enabledFlags: ["attendance", "media_gallery", "event_mode", "daily_practice", "ai_insights"],
    entitlements: ["gallery", "event_mode", "practice_tracking", "ai_insights", "backstage_mode_later", "advanced_notifications"],
    defaultRolePermissions: phase10DefaultPermissions,
    billingReadiness: "future_subscription_contract_only"
  },
  {
    key: "kids_focused_academy",
    label: "Kids-focused academy",
    description: "Parent-linked communication, galleries and events with conservative defaults for younger students.",
    enabledFlags: ["attendance", "media_gallery", "event_mode", "shop", "push_notifications"],
    entitlements: ["gallery", "event_mode", "shop", "advanced_notifications"],
    defaultRolePermissions: phase10DefaultPermissions,
    billingReadiness: "future_subscription_contract_only"
  },
  {
    key: "adult_dance_academy",
    label: "Adult dance academy",
    description: "Direct student communication, adult groups, private lessons and practice tracking.",
    enabledFlags: ["attendance", "media_gallery", "adult_groups", "private_lessons", "daily_practice"],
    entitlements: ["gallery", "private_lessons", "practice_tracking"],
    defaultRolePermissions: phase10DefaultPermissions,
    billingReadiness: "future_subscription_contract_only"
  },
  {
    key: "performing_arts_academy",
    label: "Performing arts academy",
    description: "A broader arts preset for productions, galleries, shop items and future advanced events.",
    enabledFlags: ["attendance", "media_gallery", "event_mode", "shop", "private_lessons", "ai_insights"],
    entitlements: ["gallery", "event_mode", "shop", "private_lessons", "ai_insights", "advanced_notifications"],
    defaultRolePermissions: phase10DefaultPermissions,
    billingReadiness: "future_subscription_contract_only"
  }
] as const satisfies readonly AcademyFeaturePackage[];

export const phase10AcademyTemplates = [
  {
    key: "kids_dance_academy",
    label: "Kids dance academy",
    brandingDefaults: {
      accentColors: { primary: "#D7B56D", secondary: "#8A6A2D", highlight: "#F6E6B5" },
      backgroundMood: "warm, safe, elegant and parent-trust focused",
      galleryMood: "protected memories and class moments",
      eventMood: "clear family event preparation",
      shopMood: "simple uniforms, accessories and event items"
    },
    featurePackageKey: "kids_focused_academy",
    terminologyDefaults: ["groups", "parents", "teachers", "show preparation"],
    eventStructureDefaults: ["regular_classes", "annual_show", "workshops"]
  },
  {
    key: "flamenco_academy",
    label: "Flamenco academy",
    brandingDefaults: {
      accentColors: { primary: "#B91C1C", secondary: "#111111", highlight: "#F6D365" },
      backgroundMood: "dramatic stage lighting with premium flamenco energy",
      galleryMood: "expressive performance memories",
      eventMood: "recitals, rehearsals and costume readiness",
      shopMood: "costumes, shoes and performance essentials"
    },
    featurePackageKey: "adult_dance_academy",
    terminologyDefaults: ["classes", "repertoire", "technique", "performances"],
    eventStructureDefaults: ["regular_classes", "recitals", "workshops"]
  },
  {
    key: "competition_academy",
    label: "Competition academy",
    brandingDefaults: {
      accentColors: { primary: "#7C3AED", secondary: "#1E1B4B", highlight: "#FDE68A" },
      backgroundMood: "focused, energetic and achievement-oriented",
      galleryMood: "competition memories and progress",
      eventMood: "competition timelines and backstage readiness",
      shopMood: "team gear, payments and event items"
    },
    featurePackageKey: "competition_academy",
    terminologyDefaults: ["teams", "competitions", "practice", "readiness"],
    eventStructureDefaults: ["regular_classes", "competitions", "annual_show"]
  },
  {
    key: "performing_arts_academy",
    label: "Performing arts academy",
    brandingDefaults: {
      accentColors: { primary: "#0EA5E9", secondary: "#312E81", highlight: "#FCD34D" },
      backgroundMood: "creative stage atmosphere across dance and performance",
      galleryMood: "productions, classes and student growth",
      eventMood: "recitals, shows and workshops",
      shopMood: "tickets, workshops and academy merchandise"
    },
    featurePackageKey: "performing_arts_academy",
    terminologyDefaults: ["programs", "productions", "students", "faculty"],
    eventStructureDefaults: ["regular_classes", "annual_show", "recitals", "workshops"]
  }
] as const satisfies readonly AcademyTemplatePreset[];

export const phase10ScalingSafety = [
  {
    area: "queries",
    rule: "Every production query starts from academy_id and selects only required fields.",
    requiredIndexOrLimit: "Indexes on academy_id plus common filters such as group_id, event_id, created_at and status.",
    failureModeToAvoid: "Cross-academy scans that slow down every academy as onboarding grows."
  },
  {
    area: "media",
    rule: "R2 keys, metadata and visibility rules all include the same academyId.",
    requiredIndexOrLimit: "Paginate galleries and never list broad R2 prefixes from user requests.",
    failureModeToAvoid: "Large galleries loading originals or revealing another academy prefix."
  },
  {
    area: "events",
    rule: "Event screens load active event structure separately from heavy archive media.",
    requiredIndexOrLimit: "Indexes on academy_id, event_id, starts_at and status.",
    failureModeToAvoid: "Annual show archives slowing current class or event operations."
  },
  {
    area: "notifications",
    rule: "Audience resolution is academy-scoped before provider dispatch.",
    requiredIndexOrLimit: "Batch sends by academy, role and group with rate limits.",
    failureModeToAvoid: "Noisy duplicate sends or cross-academy broadcast leaks."
  },
  {
    area: "analytics",
    rule: "Academies see only their own aggregated data; Super Admin sees platform aggregates without personal details.",
    requiredIndexOrLimit: "Aggregate by academy_id, metric, date bucket and role.",
    failureModeToAvoid: "Analytics becoming a source of personal data exposure."
  },
  {
    area: "imports",
    rule: "Imports run as reviewed Super Admin jobs with dry-run reports and rollback notes.",
    requiredIndexOrLimit: "Chunk large imports and validate academy_id on every row.",
    failureModeToAvoid: "A bad import corrupting LK Studio or another live academy."
  }
] as const satisfies readonly AcademyScalingSafetyContract[];

export const phase10SupportTools = [
  { tool: "academy_setup", allowedRole: "super_admin", requiresAcademyId: true, requiresAudit: true, canAffectLiveAcademy: false, localFallbackPreserved: true },
  { tool: "academy_repair", allowedRole: "super_admin", requiresAcademyId: true, requiresAudit: true, canAffectLiveAcademy: true, localFallbackPreserved: true },
  { tool: "user_migration", allowedRole: "super_admin", requiresAcademyId: true, requiresAudit: true, canAffectLiveAcademy: true, localFallbackPreserved: true },
  { tool: "academy_export_import", allowedRole: "super_admin", requiresAcademyId: true, requiresAudit: true, canAffectLiveAcademy: true, localFallbackPreserved: true },
  { tool: "academy_archive", allowedRole: "super_admin", requiresAcademyId: true, requiresAudit: true, canAffectLiveAcademy: true, localFallbackPreserved: true },
  { tool: "academy_recovery", allowedRole: "super_admin", requiresAcademyId: true, requiresAudit: true, canAffectLiveAcademy: true, localFallbackPreserved: true }
] as const satisfies readonly AcademySupportToolContract[];

export function buildAcademyMediaIsolationContract(academyId: EntityId): AcademyMediaIsolationContract {
  return {
    academyId,
    bucket: "academy-media",
    keyPrefix: `academies/${academyId}/`,
    galleriesPrefix: `academies/${academyId}/galleries/`,
    archivePrefix: `academies/${academyId}/archive/`,
    uploadsPrefix: `academies/${academyId}/uploads/`,
    publicAccess: "never_direct_for_private_media",
    visibilitySourceOfTruth: "academy_scoped_media_metadata",
    crossAcademyAccessAllowed: false
  };
}

export function isR2KeyInsideAcademy(key: string, academyId: EntityId) {
  return key.startsWith(`academies/${academyId}/`);
}

export function createAcademyOnboardingDraft(input: {
  id: EntityId;
  academyId: EntityId;
  createdBySuperAdminUserId: EntityId;
  name: string;
  slug: string;
  location: string;
  timezone: string;
  contactInfo?: AcademyContactInfo;
  branding: AcademyBrandingDraft;
  featurePackageKey: AcademyFeaturePackageKey;
  academyAdminAssignment?: AcademyAdminAssignment;
}): AcademyOnboardingDraft {
  return {
    id: input.id,
    academyId: input.academyId,
    createdBySuperAdminUserId: input.createdBySuperAdminUserId,
    channel: "super_admin_manual",
    lifecycleState: "draft",
    academy: {
      name: input.name,
      slug: normalizeAcademySlug(input.slug),
      location: input.location,
      timezone: input.timezone,
      contactInfo: input.contactInfo ?? {}
    },
    branding: input.branding,
    featurePackageKey: input.featurePackageKey,
    defaultPermissions: phase10DefaultPermissions,
    academyAdminAssignment: input.academyAdminAssignment,
    noPublicSelfSignup: true,
    audit: {
      required: true,
      action: "academy.create",
      sensitiveFields: ["contactInfo", "adminAssignment", "branding"]
    }
  };
}

export function normalizeAcademySlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createAcademyBillingPreparation(input: {
  academyId: EntityId;
  featurePackageKey: AcademyFeaturePackageKey;
  billingPlanId?: EntityId;
}): AcademyBillingPreparation {
  return {
    academyId: input.academyId,
    featurePackageKey: input.featurePackageKey,
    subscriptionStatus: "not_started",
    billingPlanId: input.billingPlanId,
    storageUsageTracking: "planned_not_enforced",
    enforcementMode: "none_phase_10",
    separatesAcademyBillingFromStudentPayments: true
  };
}

export function createAcademyAnalyticsContract(input: {
  academyId: EntityId;
  metric: AcademyAnalyticsMetric;
  viewer: "academy_management" | "super_admin";
}): AcademyAnalyticsContract {
  return {
    academyId: input.academyId,
    metric: input.metric,
    viewer: input.viewer,
    aggregationScope: input.viewer === "super_admin" ? "platform_aggregate" : "single_academy",
    storesPersonalDetails: false,
    storesMediaContent: false,
    requiresAcademyScopeFilter: true
  };
}

export function createAcademySwitchingContract(input: {
  actorUserId: EntityId;
  activeAcademyId: EntityId;
  visibleAcademyName: string;
  allowedAcademyIds: readonly EntityId[];
}): AcademySwitchingContract {
  return {
    ...input,
    role: "super_admin",
    switchMode: "explicit_super_admin_action",
    brandingRefresh: "immediate_after_switch",
    crossEditProtection: "require_visible_current_academy_context",
    normalUsersCanSwitch: false
  };
}

export function getPhase10FeaturePackage(key: AcademyFeaturePackageKey): AcademyFeaturePackage {
  return phase10FeaturePackages.find((featurePackage) => featurePackage.key === key) ?? phase10FeaturePackages[0];
}

export function getPhase10AcademyTemplate(key: AcademyTemplateKey): AcademyTemplatePreset {
  return phase10AcademyTemplates.find((template) => template.key === key) ?? phase10AcademyTemplates[0];
}

export function assertNoCrossAcademyMediaAccess(key: string, academyId: EntityId) {
  if (!isR2KeyInsideAcademy(key, academyId)) {
    throw new Error("Media key is outside the active academy scope.");
  }
}

export type AcademyMigrationCheckpoint = {
  academyId: EntityId;
  checkpointDate: IsoDateString;
  state: "not_started" | "dry_run" | "ready_for_review" | "migrated" | "rolled_back";
  verifiedAreas: readonly ("users" | "roles" | "groups" | "attendance" | "media" | "shop" | "events" | "audit")[];
  superAdminApprovedByUserId?: EntityId;
};
