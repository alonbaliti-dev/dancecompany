import { APP_VERSION, STUDIO_DEMO, STUDIO_LK } from "@/lib/platform/constants";
import type {
  AuditLogEntry,
  FeatureFlags,
  PlatformBillingSummary,
  ReleaseNote,
  StudioBranding,
  StudioRecord
} from "@/lib/types";

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  aiCoach: true,
  liveEventFeed: true,
  parentPeaceMode: true,
  videoUploads: true,
  staffChat: true,
  gallery: true,
  achievementsBoard: true,
  reports: true,
  payments: true,
  shop: true,
  studioIdentity: true
};

const demoFlags: FeatureFlags = {
  ...DEFAULT_FEATURE_FLAGS,
  payments: false,
  liveEventFeed: false,
  shop: true,
  studioIdentity: true
};

export function seedStudios(): StudioRecord[] {
  return [
    {
      id: STUDIO_LK,
      name: "LK Dance School — מנהלת סטודיו LK (דמו)",
      status: "active",
      plan: "pro",
      activeUsers: 128,
      storageGb: 42,
      createdAt: "2024-01-15"
    },
    {
      id: STUDIO_DEMO,
      name: "סטודיו מאייר",
      status: "active",
      plan: "starter",
      activeUsers: 24,
      storageGb: 6,
      createdAt: "2025-11-01"
    }
  ];
}

export function seedBranding(studioId: string): StudioBranding {
  if (studioId === STUDIO_DEMO) {
    return {
      studioName: "סטודיו מאייר",
      logoText: "מא",
      primaryColor: "#6366f1",
      accentColor: "#a5b4fc",
      appName: "מערכת סטודיו — מאייר"
    };
  }
  return {
    studioName: "LK Dance School — מנהלת סטודיו LK (דמו)",
    logoText: "LK",
    primaryColor: "#b91c1c",
    accentColor: "#fbbf24",
    appName: "מרחב התלמיד/ה · כפר ויתקין"
  };
}

export function seedGlobalFeatureFlags(): FeatureFlags {
  return { ...DEFAULT_FEATURE_FLAGS };
}

export function seedStudioFeatureFlags(studioId: string): FeatureFlags {
  return studioId === STUDIO_DEMO ? { ...demoFlags } : { ...DEFAULT_FEATURE_FLAGS };
}

export function seedAuditLog(): AuditLogEntry[] {
  const t = "2026-05-14T10:00:00.000Z";
  return [
    {
      id: "aud_1",
      studioId: STUDIO_LK,
      actorUserId: "u_liata",
      actorName: "מנהלת סטודיו LK (דמו)",
      action: "שינוי הרשאות משתמש",
      targetType: "user",
      targetId: "u_noa",
      timestamp: t,
      severity: "info"
    },
    {
      id: "aud_2",
      studioId: STUDIO_LK,
      actorUserId: "u_noa",
      actorName: "שירה מ. (דמו)",
      action: "נשלחה התראה לקבוצה",
      targetType: "notification",
      targetId: "n_demo",
      timestamp: "2026-05-14T09:30:00.000Z",
      severity: "info"
    },
    {
      id: "aud_3",
      studioId: STUDIO_LK,
      actorUserId: "u_creator",
      actorName: "אלון בליטי",
      action: "עודכנה תכונת מאמן AI",
      targetType: "feature_flag",
      timestamp: "2026-05-13T18:00:00.000Z",
      severity: "warning"
    },
    {
      id: "aud_4",
      studioId: STUDIO_DEMO,
      actorUserId: "u_creator",
      actorName: "אלון בליטי",
      action: "נוסף פריט לגלריה",
      targetType: "gallery",
      targetId: "gal_demo",
      timestamp: "2026-05-12T14:00:00.000Z",
      severity: "info"
    }
  ];
}

export function seedReleaseNotes(): ReleaseNote[] {
  return [
    {
      id: "rn_1",
      version: APP_VERSION.latest,
      title: "חוויית שימוש משודרגת",
      body: "שיפור מרכזי ב״היום״, מסלול מקצועי וממשק ניהול מעודכן.",
      publishedAt: "2026-05-14",
      type: "release"
    },
    {
      id: "rn_2",
      version: APP_VERSION.current,
      title: "גרסת בסיס יציבה",
      body: "תרגול, התקדמות, צ׳אט קבוצות ולוח אירועים.",
      publishedAt: "2026-05-01",
      type: "release"
    },
    {
      id: "rn_3",
      version: "0.10.0",
      title: "חיבור Supabase",
      body: "סנכרון ענן, גיבויים אוטומטיים וניהול רב-סטודיו מלא.",
      publishedAt: "2026-06-01",
      type: "upcoming"
    },
    {
      id: "rn_4",
      version: APP_VERSION.current,
      title: "תחזוקה מתוכננת",
      body: "יום ראשון 02:00–04:00 — עדכון שרתים ללא השבתה מלאה.",
      publishedAt: "2026-05-18",
      type: "maintenance"
    }
  ];
}

export function seedPlatformBilling(): PlatformBillingSummary {
  return {
    plan: "Platform Pro",
    monthlyPriceNis: 890,
    paymentStatus: "paid",
    activeStudents: 152,
    storageGb: 48
  };
}

export function seedStudioBilling(studioId: string): PlatformBillingSummary {
  if (studioId === STUDIO_DEMO) {
    return {
      plan: "Starter",
      monthlyPriceNis: 290,
      paymentStatus: "trial",
      activeStudents: 24,
      storageGb: 6
    };
  }
  return {
    plan: "Pro",
    monthlyPriceNis: 590,
    paymentStatus: "paid",
    activeStudents: 104,
    storageGb: 36
  };
}
