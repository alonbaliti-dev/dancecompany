/**
 * One-shot / repeatable: export current TypeScript seeds → `/database/*.json`.
 * Run: npx tsx scripts/generate-database.ts
 */
import { authAccountSeeds } from "../lib/auth/studio-accounts";
import { seedAttendanceRecords } from "../lib/attendance-intelligence/seed";
import { DEFAULT_EDITABLE_COPY } from "../lib/content/default-copy";
import { seedNotifications, seedGroupChats, seedChatMessages } from "../lib/communication-seed";
import { STUDIO_LK, STUDIO_DEMO } from "../lib/platform/constants";
import {
  seedAuditLog,
  seedBranding,
  seedGlobalFeatureFlags,
  seedStudioFeatureFlags,
  seedStudios
} from "../lib/platform-seed";
import { seedGalleryItems } from "../lib/gallery-seed";
import { seedLegacyEvents } from "../lib/legacy-events-seed";
import { buildStudioDirectoryUsers } from "../lib/studio/build-directory-users";
import { schedule } from "../lib/mock-data";
import { achievements } from "../lib/mock-data";
import { seedShopOrders, seedShopProducts } from "../lib/shop-seed";
import { studioGroups } from "../lib/studio-groups-catalog";
import { createInitialStudentTasks, createInitialStudioUpdates } from "../lib/studio-data-initial";
import { seedPrivateLessonBookings, seedPrivateLessonProducts } from "../lib/private-lessons/seed";
import { seedPrivateLessonAvailabilityRequests } from "../lib/private-lessons/availability-seed";
import {
  seedAttendance,
  seedDigitalFiles,
  seedGamification,
  seedGoals,
  seedParentDashboard,
  seedPerformance,
  seedReports,
  seedVideos
} from "../lib/product-seed";
import { seedFacultyRecords, seedStudioMission } from "../lib/faculty-seed";
import { seedLegacyMilestones, seedStudioQuotes } from "../lib/studio-legacy-seed";
import {
  seedAiDailyForStudent,
  seedCalendarEntries,
  seedFeedback,
  seedHeatmapDays,
  seedLiveFeed,
  seedRehearsalSessions,
  seedRiskAlerts,
  seedStudentLevels,
  seedStudioHealth
} from "../lib/studio-os-seed";
import {
  seedPlatformBilling,
  seedReleaseNotes,
  seedStudioBilling
} from "../lib/platform-seed";
import { performanceCountdown, seedTeacherDashboardMaster, trainingCategories, trainings } from "../lib/mock-data";
import type { LocalAuthCredential } from "../lib/auth/credentials";
import { usersWithoutLegacyPasswords } from "../lib/auth/credentials";
import type { DbUserRecord, LocalDatabase, ParentStudentLink } from "../lib/local-db/db-types";
import { EMPTY_DATABASE } from "../lib/local-db/db-types";
import { seedConsents, seedPlatformOs, seedSeasons } from "../lib/platform-os/defaults";
import { writeLocalDatabaseToDisk } from "../lib/local-db/write-db";
import { writePublicFallbackBundle } from "../lib/local-db/write-fallback-bundle";
import { migrateLegacyIdsDeep } from "../lib/studio/legacy-id-map";
import { syncRelationshipLinks } from "../lib/users/user-type";

function buildParentStudentLinks(users: ReturnType<typeof buildStudioDirectoryUsers>): ParentStudentLink[] {
  const links: ParentStudentLink[] = [];
  for (const u of users) {
    if (u.type !== "parent" && !u.isParent) continue;
    for (const sid of u.linkedStudentIds ?? []) {
      links.push({
        id: `ps_${u.id}_${sid}`,
        studioId: u.studioId,
        parentUserId: u.id,
        studentUserId: sid
      });
    }
  }
  return links;
}

function buildAuthCredentials(users: DbUserRecord[]): LocalAuthCredential[] {
  const passwordById = Object.fromEntries(authAccountSeeds.map((s) => [s.profile.id, s.initialPassword]));
  const now = new Date().toISOString();
  return users
    .filter((u) => passwordById[u.id])
    .map((u) => ({
      userId: u.id,
      phone: u.phone,
      passwordHashOrDevPassword: passwordById[u.id]!,
      passwordUpdatedAt: u.passwordLastChangedAt ?? u.createdAt ?? now
    }));
}

function buildUsers(): DbUserRecord[] {
  const directory = syncRelationshipLinks(buildStudioDirectoryUsers());
  const demoStaffTypes = new Set(["teacher", "management"]);

  return directory.map((u) => ({
    ...u,
    isDemoStaff: demoStaffTypes.has(u.type ?? "student") && !u.permissions.isSuperAdmin
  }));
}

function buildAchievements() {
  const icons = ["flame", "check", "star"] as const;
  return achievements.map((a, i) => ({
    id: `ach_${i}`,
    title: a.title,
    body: a.body,
    icon: icons[i] ?? "star"
  }));
}

function main() {
  const users = buildUsers();
  const authCredentials = buildAuthCredentials(users);
  const db: LocalDatabase = {
    version: 1,
    studios: seedStudios(),
    users: usersWithoutLegacyPasswords(users),
    authCredentials,
    groups: studioGroups,
    classes: schedule,
    parentsStudents: buildParentStudentLinks(users),
    tasks: createInitialStudentTasks(),
    attendance: {
      sessions: seedAttendance(),
      intelligenceRecords: seedAttendanceRecords()
    },
    messages: {
      studioUpdates: createInitialStudioUpdates(),
      chatMessages: seedChatMessages()
    },
    notifications: seedNotifications(),
    chats: seedGroupChats(),
    gallery: seedGalleryItems(),
    events: seedLegacyEvents(),
    achievements: buildAchievements(),
    shopProducts: seedShopProducts(),
    shopOrders: seedShopOrders(),
    privateLessons: {
      products: seedPrivateLessonProducts(),
      bookings: seedPrivateLessonBookings()
    },
    teachersAvailability: seedPrivateLessonAvailabilityRequests(),
    editableTexts: [...DEFAULT_EDITABLE_COPY],
    featureFlags: {
      global: seedGlobalFeatureFlags(),
      byStudio: {
        [STUDIO_LK]: seedStudioFeatureFlags(STUDIO_LK),
        [STUDIO_DEMO]: seedStudioFeatureFlags(STUDIO_DEMO)
      }
    },
    branding: {
      [STUDIO_LK]: seedBranding(STUDIO_LK),
      [STUDIO_DEMO]: seedBranding(STUDIO_DEMO)
    },
    auditLog: seedAuditLog(),
    studioOs: {
      levelsByUser: seedStudentLevels(),
      heatmapDays: seedHeatmapDays(),
      feedback: seedFeedback(),
      rehearsals: seedRehearsalSessions(),
      liveFeed: seedLiveFeed(),
      riskAlerts: seedRiskAlerts(),
      calendarEntries: seedCalendarEntries(),
      aiDailyByUser: {
        u_maya: seedAiDailyForStudent("u_maya"),
        u_yuval: seedAiDailyForStudent("u_yuval")
      },
      studioHealth: seedStudioHealth()
    },
    productData: {
      goals: [...seedGoals("u_maya"), ...seedGoals("u_yuval")],
      filesByStudentId: seedDigitalFiles(),
      videos: seedVideos(),
      performance: seedPerformance(),
      gamification: seedGamification(),
      reports: seedReports(),
      parentDashboardByParentId: { u_parent_demo: seedParentDashboard("u_parent_demo") },
      teacherDashboardMaster: seedTeacherDashboardMaster()
    },
    faculty: seedFacultyRecords(),
    studioIdentity: {
      missionsByStudio: { [STUDIO_LK]: seedStudioMission() },
      quotes: seedStudioQuotes(),
      milestones: seedLegacyMilestones()
    },
    platformMeta: {
      releaseNotes: seedReleaseNotes(),
      platformBilling: seedPlatformBilling(),
      studioBillingByStudio: {
        [STUDIO_LK]: seedStudioBilling(STUDIO_LK),
        [STUDIO_DEMO]: seedStudioBilling(STUDIO_DEMO)
      },
      performanceCountdown
    },
    trainings: { categories: trainingCategories, items: trainings },
    systemSettings: { ...EMPTY_DATABASE.systemSettings, databaseSchemaVersion: 2 },
    platformOs: seedPlatformOs(),
    seasons: seedSeasons(),
    consents: seedConsents()
  };

  const migrated = migrateLegacyIdsDeep(db);
  writeLocalDatabaseToDisk(migrated);
  writePublicFallbackBundle(migrated);
  console.log("Wrote /database/*.json and public/fallback-bundle.json from seeds.");
}

main();
