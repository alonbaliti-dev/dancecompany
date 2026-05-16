import { usersWithoutLegacyPasswords } from "@/lib/auth/credentials";
import { DB_FILES } from "./paths";
import { EMPTY_DATABASE, type LocalDatabase } from "./db-types";

/** Map in-memory DB → file name → JSON payload (for export / API write). */
export function splitDatabaseToFiles(db: LocalDatabase): Record<string, unknown> {
  return {
    [DB_FILES.studios]: db.studios,
    [DB_FILES.users]: usersWithoutLegacyPasswords(db.users),
    [DB_FILES.authCredentials]: db.authCredentials ?? [],
    [DB_FILES.groups]: db.groups,
    [DB_FILES.classes]: db.classes,
    [DB_FILES.parentsStudents]: db.parentsStudents,
    [DB_FILES.tasks]: db.tasks,
    [DB_FILES.attendance]: db.attendance,
    [DB_FILES.messages]: db.messages,
    [DB_FILES.notifications]: db.notifications,
    [DB_FILES.chats]: db.chats,
    [DB_FILES.gallery]: db.gallery,
    [DB_FILES.events]: db.events,
    [DB_FILES.achievements]: db.achievements,
    [DB_FILES.shopProducts]: db.shopProducts,
    [DB_FILES.shopOrders]: db.shopOrders,
    [DB_FILES.privateLessons]: db.privateLessons,
    [DB_FILES.teachersAvailability]: db.teachersAvailability,
    [DB_FILES.editableTexts]: db.editableTexts,
    [DB_FILES.featureFlags]: db.featureFlags,
    [DB_FILES.branding]: db.branding,
    [DB_FILES.auditLog]: db.auditLog,
    [DB_FILES.studioOs]: db.studioOs,
    [DB_FILES.productData]: db.productData,
    [DB_FILES.faculty]: db.faculty,
    [DB_FILES.studioIdentity]: db.studioIdentity,
    [DB_FILES.platformMeta]: db.platformMeta,
    [DB_FILES.trainings]: db.trainings,
    [DB_FILES.systemSettings]: db.systemSettings,
    [DB_FILES.platformOs]: db.platformOs,
    [DB_FILES.seasons]: db.seasons,
    [DB_FILES.consents]: db.consents
  };
}

export function mergeFilesToDatabase(files: Partial<Record<string, unknown>>): LocalDatabase {
  return {
    version: 1,
    studios: (files[DB_FILES.studios] as LocalDatabase["studios"]) ?? [],
    users: (files[DB_FILES.users] as LocalDatabase["users"]) ?? [],
    authCredentials: (files[DB_FILES.authCredentials] as LocalDatabase["authCredentials"]) ?? [],
    groups: (files[DB_FILES.groups] as LocalDatabase["groups"]) ?? [],
    classes: (files[DB_FILES.classes] as LocalDatabase["classes"]) ?? [],
    parentsStudents: (files[DB_FILES.parentsStudents] as LocalDatabase["parentsStudents"]) ?? [],
    tasks: (files[DB_FILES.tasks] as LocalDatabase["tasks"]) ?? [],
    attendance: (files[DB_FILES.attendance] as LocalDatabase["attendance"]) ?? {
      sessions: [],
      intelligenceRecords: []
    },
    messages: (files[DB_FILES.messages] as LocalDatabase["messages"]) ?? {
      studioUpdates: [],
      chatMessages: []
    },
    notifications: (files[DB_FILES.notifications] as LocalDatabase["notifications"]) ?? [],
    chats: (files[DB_FILES.chats] as LocalDatabase["chats"]) ?? [],
    gallery: (files[DB_FILES.gallery] as LocalDatabase["gallery"]) ?? [],
    events: (files[DB_FILES.events] as LocalDatabase["events"]) ?? [],
    achievements: (files[DB_FILES.achievements] as LocalDatabase["achievements"]) ?? [],
    shopProducts: (files[DB_FILES.shopProducts] as LocalDatabase["shopProducts"]) ?? [],
    shopOrders: (files[DB_FILES.shopOrders] as LocalDatabase["shopOrders"]) ?? [],
    privateLessons: (files[DB_FILES.privateLessons] as LocalDatabase["privateLessons"]) ?? {
      products: [],
      bookings: []
    },
    teachersAvailability: (files[DB_FILES.teachersAvailability] as LocalDatabase["teachersAvailability"]) ?? [],
    editableTexts: (files[DB_FILES.editableTexts] as LocalDatabase["editableTexts"]) ?? [],
    featureFlags: (files[DB_FILES.featureFlags] as LocalDatabase["featureFlags"]) ?? {
      global: {
        aiCoach: false,
        liveEventFeed: false,
        parentPeaceMode: false,
        videoUploads: false,
        staffChat: false,
        gallery: false,
        achievementsBoard: false,
        reports: false,
        payments: false,
        shop: false,
        studioIdentity: false
      },
      byStudio: {}
    },
    branding: (files[DB_FILES.branding] as LocalDatabase["branding"]) ?? {},
    auditLog: (files[DB_FILES.auditLog] as LocalDatabase["auditLog"]) ?? [],
    studioOs: (files[DB_FILES.studioOs] as LocalDatabase["studioOs"]) ?? EMPTY_DATABASE.studioOs,
    productData: (files[DB_FILES.productData] as LocalDatabase["productData"]) ?? EMPTY_DATABASE.productData,
    faculty: (files[DB_FILES.faculty] as LocalDatabase["faculty"]) ?? EMPTY_DATABASE.faculty,
    studioIdentity:
      (files[DB_FILES.studioIdentity] as LocalDatabase["studioIdentity"]) ?? EMPTY_DATABASE.studioIdentity,
    platformMeta: (files[DB_FILES.platformMeta] as LocalDatabase["platformMeta"]) ?? EMPTY_DATABASE.platformMeta,
    trainings: (files[DB_FILES.trainings] as LocalDatabase["trainings"]) ?? EMPTY_DATABASE.trainings,
    systemSettings:
      (files[DB_FILES.systemSettings] as LocalDatabase["systemSettings"]) ?? EMPTY_DATABASE.systemSettings,
    platformOs: (files[DB_FILES.platformOs] as LocalDatabase["platformOs"]) ?? EMPTY_DATABASE.platformOs,
    seasons: (files[DB_FILES.seasons] as LocalDatabase["seasons"]) ?? EMPTY_DATABASE.seasons,
    consents: (files[DB_FILES.consents] as LocalDatabase["consents"]) ?? EMPTY_DATABASE.consents
  };
}
