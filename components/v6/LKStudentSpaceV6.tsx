"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Database,
  Download,
  Flag,
  HeartPulse,
  ImagePlus,
  Images,
  Lock,
  MessageCircle,
  MoonStar,
  Plus,
  Receipt,
  School,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Trophy,
  Upload,
  Users
} from "lucide-react";
import { V6AppProvider, useV6 } from "@/lib/v6/AppProvider";
import { permissionsFor, roleLabel } from "@/lib/v6/seed";
import {
  AppShellFrame,
  BidiNumber,
  BottomNavDock,
  BottomSheet,
  Button as V6Button,
  DirectionalChevron,
  FeedRow as V6FeedRow,
  FormField,
  HeroSurface,
  InlineMetric,
  RtlText,
  SafeMeta,
  SafeTitle,
  SelectField,
  SheetActions,
  SurfaceContent,
  SegmentedControl,
  StatusBadge as V6StatusBadge,
  Surface,
  Toast as V6Toast,
  LovableActionRow,
  LovableEditorialPanel,
  MobileScreen,
  V6ShopProductCard,
  V6ShopProductGrid,
  v6Cx,
  v6Lovable,
  v6LovableForm,
  v6Motion,
  v6Surface,
  v6Tone,
  v6Type,
  v6Visual,
  type V6Tone
} from "@/components/v6/design-system";
import { HomeScreen } from "@/components/v6/screens/HomeScreen";
import { selectV6LessonsForActor, selectV6StudentsForAttendanceGroup } from "@/lib/domains/attendance/selectors";
import { buildV6SaveAttendanceOperation } from "@/lib/domains/attendance/operations";
import { selectV6ActivityCenterForActor } from "@/lib/v6/activity-center";
import { ActivityCenterPanel, useV6ActivityNavigationHandlers } from "@/components/v6/activity-center/activity-center-section";
import { selectV6PrivateLessonsForActor } from "@/lib/domains/private-lessons/selectors";
import { buildV6SaveProductOperation, v6InventoryStatuses, v6ProductCategories, v6ProductTypes } from "@/lib/domains/shop/operations";
import { selectV6ShopProductsForActor, selectV6FeaturedShopLanes } from "@/lib/domains/shop/selectors";
import { selectV6MediaForActor } from "@/lib/domains/media/selectors";
import { selectV6GalleryCollectionsForActor } from "@/lib/domains/media/selectors";
import { selectV6EventOperatingSummary, selectV6SchoolYearEvents } from "@/lib/domains/events/selectors";
import { buildV6ResetPasswordOperation, buildV6UpsertUserOperation } from "@/lib/domains/users/v6-operations";
import { groupUsersByRole, selectV6UsersByRole, sortByHebrewName } from "@/lib/domains/users/selectors";
import { selectV6SystemIssues } from "@/lib/domains/system/selectors";
import { resolveV6ProductImageUrl, selectV6ProductPriceLabel } from "@/lib/v6/view-models";
import { computeV6ManagementHealth, computeV6PrivateLessonCoordination, summarizeV6Audit } from "@/lib/engines/v6";
import type { V6AttendanceRecord, V6AttendanceStatus, V6CalendarEvent, V6MediaItem, V6Permissions, V6Product, V6Role, V6Screen, V6Tab, V6User } from "@/lib/v6/types";

type Tone = "studio" | "flamenco" | "hiphop" | "classic" | "modern" | "pointe" | "repertoire" | "management" | "admin" | "shop" | "urgent";

type IntegrationHealthItem = {
  id: string;
  labelHe: string;
  statusHe: "מחובר" | "חסר" | "בדיקה נכשלה" | "מצב בדיקה" | "כבוי" | "במעקב";
  detailHe: string;
};

type IntegrationHealthReport = {
  generatedAt: string;
  items: IntegrationHealthItem[];
  latestErrors: string[];
};

const tones: Record<Tone, { text: string; soft: string; border: string; glow: string; grad: string }> = {
  studio: { text: "text-emerald-100", soft: "bg-emerald-300/12", border: "border-emerald-100/16", glow: "shadow-emerald-950/20", grad: "from-emerald-300/18 via-white/[0.055] to-cyan-300/8" },
  flamenco: { text: "text-amber-100", soft: "bg-red-400/14", border: "border-amber-100/18", glow: "shadow-red-950/20", grad: "from-red-500/20 via-amber-300/10 to-black/10" },
  hiphop: { text: "text-fuchsia-100", soft: "bg-fuchsia-400/14", border: "border-fuchsia-100/18", glow: "shadow-fuchsia-950/20", grad: "from-violet-500/20 via-fuchsia-400/10 to-black/10" },
  classic: { text: "text-rose-100", soft: "bg-rose-200/12", border: "border-rose-100/18", glow: "shadow-rose-950/20", grad: "from-rose-100/16 via-slate-200/8 to-black/10" },
  modern: { text: "text-cyan-100", soft: "bg-cyan-300/12", border: "border-cyan-100/18", glow: "shadow-cyan-950/20", grad: "from-slate-400/18 via-cyan-300/8 to-black/10" },
  pointe: { text: "text-pink-100", soft: "bg-pink-200/12", border: "border-pink-100/18", glow: "shadow-pink-950/20", grad: "from-pink-200/18 via-stone-100/8 to-black/10" },
  repertoire: { text: "text-amber-100", soft: "bg-amber-300/12", border: "border-amber-100/18", glow: "shadow-amber-950/20", grad: "from-amber-300/20 via-orange-300/8 to-black/10" },
  management: { text: "text-blue-100", soft: "bg-blue-400/12", border: "border-blue-100/18", glow: "shadow-blue-950/20", grad: "from-blue-500/20 via-cyan-300/8 to-black/10" },
  admin: { text: "text-violet-100", soft: "bg-violet-300/13", border: "border-violet-100/20", glow: "shadow-violet-950/20", grad: "from-violet-300/20 via-zinc-100/8 to-black/10" },
  shop: { text: "text-yellow-100", soft: "bg-yellow-300/12", border: "border-yellow-100/18", glow: "shadow-yellow-950/20", grad: "from-yellow-300/18 via-emerald-200/8 to-black/10" },
  urgent: { text: "text-rose-100", soft: "bg-rose-500/14", border: "border-rose-100/20", glow: "shadow-rose-950/20", grad: "from-rose-500/20 via-red-300/8 to-black/10" }
};

const permissionLabels: Array<[keyof V6Permissions, string]> = [
  ["manageUsers", "ניהול משתמשים"],
  ["editCredentials", "עריכת התחברות"],
  ["editPermissions", "הרשאות"],
  ["manageAttendance", "נוכחות"],
  ["manageShop", "חנות"],
  ["managePrivateLessons", "שיעורים פרטיים"],
  ["manageMedia", "מדיה"],
  ["exportImportDb", "ייצוא/ייבוא"],
  ["viewAudit", "יומן פעולות"]
];

const attendanceStatusLabel: Record<V6AttendanceStatus, string> = {
  present: "נוכח/ת",
  absent: "חסר/ה",
  late: "איחור",
  excused: "מוצדק",
  missing: "חסר/ה"
};

const productTypeLabel: Record<NonNullable<V6Product["type"]>, string> = {
  physical: "מוצר פיזי",
  event_ticket: "כרטיס לאירוע",
  private_lesson: "שיעור פרטי",
  workshop_camp: "סדנה / מחנה",
  accessory: "אביזר",
  clothing: "ביגוד"
};

const inventoryStatusLabel: Record<NonNullable<V6Product["inventoryStatus"]>, string> = {
  in_stock: "במלאי",
  out_of_stock: "אזל מהמלאי",
  limited: "כמות מוגבלת",
  preorder: "הזמנה מוקדמת",
  draft: "טיוטה / מוסתר"
};

const productPriceModeLabel: Record<NonNullable<V6Product["priceMode"]>, string> = {
  paid: "מחיר רגיל",
  free: "חינם",
  request: "מחיר לפי בקשה"
};

const eventTypeLabel: Record<V6CalendarEvent["type"], string> = {
  regular_class: "שיעור רגיל",
  rehearsal: "חזרה",
  general_rehearsal: "חזרה כללית",
  competition: "תחרות",
  performance: "הופעה",
  annual_show: "מופע סוף שנה",
  workshop: "סדנה",
  private_lesson: "שיעור פרטי",
  studio_announcement: "הודעת סטודיו",
  payment_deadline: "דדליין תשלום",
  costume_equipment_deadline: "דדליין ציוד ותלבושת"
};

const eventStatusTone: Record<V6CalendarEvent["status"], V6Tone> = {
  draft: "management",
  scheduled: "studio",
  needs_attention: "urgent",
  ready: "success",
  completed: "modern",
  archived: "admin"
};

type V6SheetType = "add-user" | "edit-user" | "view-user" | "add-product" | "edit-product" | "attendance" | "link-parent" | "reset-password" | "upload-media";
type V6SheetMode = "add" | "edit" | "view";
type V6ActiveSheet = {
  type: V6SheetType;
  entityId?: string;
  mode?: V6SheetMode;
  payload?: Record<string, unknown>;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function uniqueBy<T>(items: T[], keyFor: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyFor(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

let v6ClientIdCounter = 0;

function nextV6ClientId(prefix: string) {
  v6ClientIdCounter += 1;
  return `${prefix}_${v6ClientIdCounter.toString(36)}`;
}

type MediaApiItem = {
  id: string;
  academy_id: string;
  group_id: string | null;
  class_id: string | null;
  event_id: string | null;
  product_id: string | null;
  uploaded_by_user_id: string | null;
  uploaded_by_name: string | null;
  lesson_date: string | null;
  lesson_time: string | null;
  tags: string[];
  r2_bucket: string;
  r2_key: string;
  thumbnail_key: string | null;
  file_name: string;
  mime_type: string;
  file_size: number;
  media_type: string;
  visibility: "group" | "group_parents" | "teacher_only" | "staff_only" | "management_only" | "shop_public" | "event_public" | "legacy_public";
  created_at: string;
  render_url: string | null;
};

type CreateUploadResponse =
  | { ok: true; mode: "r2"; mediaItemId: string; uploadUrl: string; method: "PUT"; headers: Record<string, string>; bucket: string; r2Key: string }
  | { ok: true; mode: "local_demo"; mediaItemId: string; bucket: string; r2Key: string; reason: string };

function academyIdFor(user: V6User) {
  return user.activeAcademyId ?? user.academyId ?? user.studioId;
}

function mapApiMediaToV6(item: MediaApiItem, fallbackTitle?: string): V6MediaItem {
  return {
    id: item.id,
    studioId: item.academy_id,
    academyId: item.academy_id,
    uploadedByUserId: item.uploaded_by_user_id ?? "unknown",
    uploaderName: item.uploaded_by_name ?? undefined,
    title: fallbackTitle ?? item.file_name,
    fileName: item.file_name,
    mediaType: item.media_type === "video" ? "video" : "image",
    groupId: item.group_id ?? undefined,
    classId: item.class_id ?? undefined,
    eventId: item.event_id ?? undefined,
    studentId: undefined,
    lessonDate: item.lesson_date ?? undefined,
    lessonTime: item.lesson_time ?? undefined,
    tags: item.tags,
    r2Bucket: item.r2_bucket,
    r2Key: item.r2_key,
    thumbnailKey: item.thumbnail_key ?? undefined,
    mimeType: item.mime_type,
    fileSize: item.file_size,
    linkedGroupId: item.group_id ?? undefined,
    linkedProductId: item.product_id ?? undefined,
    linkedEventId: item.event_id ?? undefined,
    localPreviewUrl: item.render_url ?? undefined,
    visibility: item.visibility === "shop_public" ? "shop" : item.visibility === "event_public" ? "event" : item.visibility === "management_only" ? "management" : item.visibility === "staff_only" || item.visibility === "teacher_only" ? "staff" : item.visibility === "legacy_public" ? "archive" : "group",
    createdAt: item.created_at
  };
}

async function persistProduct(product: V6Product, academyId: string) {
  const response = await fetch("/api/shop/products", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      academyId,
      product: {
        id: product.id,
        title: product.title,
        description: product.description,
        category: product.category,
        product_type: product.type,
        price: product.price,
        price_mode: product.priceMode,
        inventory_status: product.inventoryStatus,
        visibility: product.visibility,
        image_media_ids: product.imageMediaIds,
        featured_image_media_id: product.featuredImageMediaId ?? null,
        status: product.active ? "active" : "inactive",
        metadata: {
          sizes: product.sizes ?? [],
          colors: product.colors ?? [],
          notes: product.notes ?? null,
          pickupDeliveryNote: product.pickupDeliveryNote ?? null,
          memberOnly: product.memberOnly ?? false
        }
      }
    })
  });

  if (!response.ok) throw new Error("Product persistence failed.");
}

async function uploadMediaToR2(input: {
  file: File;
  user: V6User;
  academyId: string;
  title: string;
  visibility: "group" | "shop_public" | "event_public";
  groupId?: string;
  classId?: string;
  lessonDate?: string;
  productId?: string;
  eventId?: string;
  tags?: string[];
}) {
  const mediaType = input.file.type.startsWith("video/") ? "video" : "image";
  const createResponse = await fetch("/api/media/create-upload-url", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      academyId: input.academyId,
      actorUserId: input.user.id,
      actorName: input.user.name,
      fileName: input.file.name,
      mimeType: input.file.type,
      fileSize: input.file.size,
      mediaType,
      visibility: input.visibility,
      groupId: input.groupId,
      classId: input.classId,
      lessonDate: input.lessonDate,
      productId: input.productId,
      eventId: input.eventId,
      tags: input.tags ?? []
    })
  });
  const upload = (await createResponse.json()) as CreateUploadResponse | { ok: false; message?: string; reason?: string };
  if (!createResponse.ok || upload.ok === false) throw new Error(upload.ok === false ? (upload.message ?? upload.reason ?? "Upload URL failed.") : "Upload URL failed.");

  if (upload.mode === "local_demo") {
    return {
      media: {
        id: upload.mediaItemId,
        studioId: input.user.studioId,
        academyId: input.academyId,
        uploadedByUserId: input.user.id,
        uploaderName: input.user.name,
        title: input.title,
        fileName: input.file.name,
        mediaType,
        groupId: input.groupId,
        classId: input.classId,
        linkedGroupId: input.groupId,
        linkedProductId: input.productId,
        linkedEventId: input.eventId,
        lessonDate: input.lessonDate,
        tags: input.tags,
        r2Bucket: upload.bucket,
        r2Key: upload.r2Key,
        mimeType: input.file.type,
        fileSize: input.file.size,
        visibility: input.visibility === "shop_public" ? "shop" : input.visibility === "event_public" ? "event" : "group",
        localPreviewUrl: URL.createObjectURL(input.file),
        createdAt: new Date().toISOString()
      } satisfies V6MediaItem,
      persisted: false,
      message: upload.reason
    };
  }

  const putResponse = await fetch(upload.uploadUrl, {
    method: upload.method,
    headers: upload.headers,
    body: input.file
  });
  if (!putResponse.ok) throw new Error("R2 upload failed.");

  const completeResponse = await fetch("/api/media/complete-upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: upload.mediaItemId,
      academyId: input.academyId,
      actorUserId: input.user.id,
      groupId: input.groupId,
      classId: input.classId,
      eventId: input.eventId,
      productId: input.productId,
      uploadedByUserId: input.user.id,
      uploadedByName: input.user.name,
      lessonDate: input.lessonDate,
      tags: input.tags ?? [],
      visibility: input.visibility,
      r2Bucket: upload.bucket,
      r2Key: upload.r2Key,
      fileName: input.file.name,
      mimeType: input.file.type,
      fileSize: input.file.size,
      mediaType,
      status: "uploaded"
    })
  });
  const complete = (await completeResponse.json()) as { ok: true; mediaItem: MediaApiItem } | { ok: false; message?: string; messageEn?: string };
  if (!completeResponse.ok || complete.ok === false) throw new Error(complete.ok === false ? (complete.messageEn ?? complete.message ?? "Upload completion failed.") : "Upload completion failed.");

  return { media: mapApiMediaToV6(complete.mediaItem, input.title), persisted: true, message: "uploaded" };
}

function toneForStyle(style?: string): Tone {
  if (style?.includes("פלמנקו")) return "flamenco";
  if (style?.includes("היפ הופ")) return "hiphop";
  if (style?.includes("קלאסי")) return "classic";
  if (style?.includes("מודרני")) return "modern";
  if (style?.includes("פוינט")) return "pointe";
  if (style?.includes("רפרטואר")) return "repertoire";
  return "studio";
}

function toneForRole(role: V6Role): Tone {
  if (role === "super_admin") return "admin";
  if (role === "management") return "management";
  if (role === "teacher") return "studio";
  if (role === "parent") return "classic";
  return "hiphop";
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header dir="rtl" className={v6Cx(v6Lovable.card, "mx-auto w-full max-w-full overflow-hidden rounded-3xl p-4 text-start")}>
      <SurfaceContent className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <SafeMeta as="p" className={v6Lovable.eyebrow}>ניהול</SafeMeta>
          <SafeTitle as="h1" className="mt-1.5 text-balance text-lg font-semibold tracking-tight text-white/92">{title}</SafeTitle>
          {subtitle ? <SafeMeta as="p" className="mt-1.5 max-w-[22rem] text-sm leading-relaxed text-white/48">{subtitle}</SafeMeta> : null}
        </div>
        {action ? <div className="lk-safe-action-zone shrink-0 sm:max-w-[45%]">{action}</div> : null}
      </SurfaceContent>
    </header>
  );
}

function sheetKey(sheet: V6ActiveSheet) {
  return `${sheet.type}:${sheet.entityId ?? "new"}:${sheet.mode ?? "edit"}`;
}

function V6SheetController({ activeSheet, title, children, onClose }: { activeSheet: V6ActiveSheet | null; title: string; children: ReactNode; onClose: () => void }) {
  if (!activeSheet) return null;
  return (
    <BottomSheet key={sheetKey(activeSheet)} title={title} onClose={onClose}>
      {children}
    </BottomSheet>
  );
}

function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  return {
    message,
    show: (value: string) => {
      setMessage(value);
      window.setTimeout(() => setMessage(null), 2200);
    }
  };
}

function Login() {
  const { db, login } = useV6();
  const [phone, setPhone] = useState("0501110000");
  const [password, setPassword] = useState("creator2026");
  const { message, show } = useToast();
  const studio = db.studios[0];
  return (
    <main suppressHydrationWarning className="grid min-h-dynamic place-items-center overflow-x-hidden px-4 py-safe text-white sm:px-5" dir="rtl">
      <V6Toast message={message} />
      <div className={v6Cx("pointer-events-none fixed inset-0", v6Visual.canvas)} />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,247,223,0.066)_40%,transparent_56%),repeating-linear-gradient(90deg,rgba(255,255,255,0.010)_0,rgba(255,255,255,0.010)_1px,transparent_1px,transparent_10px)] opacity-48 mix-blend-screen" />
      <div className="pointer-events-none fixed bottom-0 left-1/2 h-[44vh] w-[min(90vw,450px)] -translate-x-1/2 rounded-t-full bg-[radial-gradient(ellipse_at_center,rgba(215,181,109,0.13),rgba(100,28,63,0.10)_42%,transparent_72%)] blur-sm" />
      <div className="relative mx-auto w-full max-w-[430px]">
        <div className="mb-7 text-center">
          <div className="relative mx-auto grid h-[104px] w-[104px] place-items-center rounded-[42px] border border-[rgba(215,181,109,0.18)] bg-[radial-gradient(circle_at_50%_20%,rgba(255,247,223,0.24),rgba(215,181,109,0.10)_38%,rgba(61,16,39,0.30))] shadow-[0_34px_96px_rgba(61,16,39,0.42),0_18px_70px_rgba(215,181,109,0.13),inset_0_1px_0_rgba(255,255,255,0.16)]">
            <div className="pointer-events-none absolute inset-4 rounded-[34px] border border-[rgba(255,255,255,0.07)]" />
            <MoonStar className="text-[#fff7df]" size={32} />
          </div>
          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.36em] text-[#f4d58d]/62">Backstage Access</p>
          <h1 suppressHydrationWarning className="lk-safe-title mx-auto mt-2 max-w-[22rem] text-center text-[clamp(2.25rem,10vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.070em]">{db.editableTexts.loginTitle ?? studio?.branding.name}</h1>
          <p className="mx-auto mt-4 max-w-xs text-[15px] leading-relaxed text-white/66">{db.editableTexts.loginSubtitle ?? studio?.branding.tagline}</p>
        </div>
        <form
          className={v6Cx("lk-safe-surface relative isolate mx-auto w-full max-w-full space-y-4 overflow-hidden rounded-[40px] border border-[rgba(244,213,141,0.14)] bg-[linear-gradient(150deg,rgba(255,247,223,0.13),rgba(255,255,255,0.044)_48%,rgba(61,16,39,0.30)_100%)] p-5 shadow-[0_42px_118px_rgba(0,0,0,0.68),0_20px_72px_rgba(215,181,109,0.09),inset_0_1px_0_rgba(255,247,223,0.13)] backdrop-blur-2xl sm:p-6", v6Visual.texture)}
          onSubmit={(e) => {
            e.preventDefault();
            const result = login(phone, password);
            if (result.ok === false) show(result.reason);
          }}
        >
          <div className="relative flex min-h-12 items-center gap-3 rounded-[24px] border border-[rgba(244,213,141,0.09)] bg-black/24 px-4 py-3 text-start text-[13px] font-bold text-white/62 shadow-[inset_0_1px_0_rgba(255,247,223,0.070)]"><Lock className="shrink-0 text-[#f4d58d]/85" size={16} /><span className="min-w-0 flex-1 leading-snug">כניסה מאובטחת לפי המסד</span></div>
          <FormField label="טלפון" value={phone} onChange={setPhone} />
          <FormField label="סיסמה" value={password} onChange={setPassword} type="password" />
          <div className="[&>button]:w-full"><V6Button type="submit">כניסה</V6Button></div>
        </form>
      </div>
    </main>
  );
}

function Shell() {
  const { db, user, logout } = useV6();
  const [tab, setTab] = useState<V6Tab>("dashboard");
  const [screen, setScreen] = useState<V6Screen>("home");
  const { message, show } = useToast();
  const activityCenter = useMemo(() => (user ? selectV6ActivityCenterForActor(db, user) : null), [db, user]);
  const unread = activityCenter?.unreadCount ?? 0;
  if (!user) return <Login />;
  const studio = db.studios.find((s) => s.id === user.studioId);
  const openScreen = (next: V6Screen) => {
    setScreen(next);
    setTab("more");
    window.scrollTo({ top: 0 });
  };
  const home = screen === "home";
  const atmosphere =
    !home && (screen === "users" || screen === "system" || screen === "calendar") ? "management" :
    !home && (screen === "database" || screen === "texts" || screen === "flags" || screen === "audit" || screen === "branding" || screen === "integrations") ? "admin" :
    home && tab === "shop" ? "shop" :
    home && tab === "more" && user.role === "super_admin" ? "admin" :
    home && tab === "more" && user.role === "management" ? "management" :
    home && user.role === "student" ? "student" :
    home && user.role === "teacher" ? "teacher" :
    "home";
  return (
    <>
      <V6Toast message={message} />
      <AppShellFrame user={user} studioName={studio?.name} onLogout={logout} atmosphere={atmosphere}>
        <div key={`${tab}-${screen}`}>
          {home && tab === "dashboard" ? <HomeScreen user={user} openScreen={openScreen} openTab={(next) => { setScreen("home"); setTab(next); window.scrollTo({ top: 0 }); }} /> : null}
          {home && tab === "lessons" ? <Lessons user={user} show={show} /> : null}
          {home && tab === "messages" ? <Messages user={user} show={show} openScreen={openScreen} openTab={(next) => { setScreen("home"); setTab(next); window.scrollTo({ top: 0 }); }} /> : null}
          {home && tab === "shop" ? <Shop user={user} show={show} openScreen={openScreen} /> : null}
          {home && tab === "more" ? <More user={user} openScreen={openScreen} openTab={(next) => { setScreen("home"); setTab(next); window.scrollTo({ top: 0 }); }} /> : null}
          {!home && screen === "users" ? <UsersScreen actor={user} show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "private_lessons" ? <PrivateLessons user={user} show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "media" ? <MediaScreen user={user} show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "calendar" ? <CalendarScreen user={user} back={() => setScreen("home")} /> : null}
          {!home && screen === "legacy" ? <LegacyScreen user={user} back={() => setScreen("home")} /> : null}
          {!home && screen === "database" ? <DatabaseScreen show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "texts" ? <TextsScreen actor={user} show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "flags" ? <FlagsScreen actor={user} show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "audit" ? <AuditScreen back={() => setScreen("home")} /> : null}
          {!home && screen === "system" ? <SystemScreen back={() => setScreen("home")} /> : null}
          {!home && screen === "branding" ? <BrandingScreen show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "integrations" ? <IntegrationHealthScreen user={user} back={() => setScreen("home")} /> : null}
        </div>
      </AppShellFrame>
      <BottomNavDock tab={tab} unread={unread} onTab={(next) => { setScreen("home"); setTab(next); window.scrollTo({ top: 0 }); }} />
    </>
  );
}

function MiniSummary({ icon: Icon, tone, label, title, meta }: { icon: React.ElementType; tone: Tone; label: string; title: string; meta: string }) {
  const t = v6Tone[tone];
  const numericTitle = /^(?:V)?[₪\d%+.,-]+$/.test(title);
  return (
    <div dir="rtl" className={v6Cx(v6Lovable.card, "flex items-center gap-3 rounded-2xl px-4 py-3 text-start")}>
      <span className={v6Cx("grid h-10 w-10 shrink-0 place-items-center rounded-2xl", t.soft, t.text)}><Icon size={15} strokeWidth={1.8} /></span>
      <span className="min-w-0 flex-1 text-start">
        <SafeMeta as="span" className={v6Lovable.eyebrow}>{label}</SafeMeta>
        <span className="mt-1 block break-words text-base font-semibold leading-tight tracking-tight text-white/92">{numericTitle ? <BidiNumber>{title}</BidiNumber> : <RtlText>{title}</RtlText>}</span>
        <SafeMeta as="span" className="mt-0.5 block text-[11px] font-medium text-white/42">{meta}</SafeMeta>
      </span>
    </div>
  );
}

function Lessons({ user, show }: { user: V6User; show: (message: string) => void }) {
  const { db, dispatch } = useV6();
  const lessons = selectV6LessonsForActor(db, user);
  const nextLesson = lessons[0];
  const [activeSheet, setActiveSheet] = useState<V6ActiveSheet | null>(null);
  const [classDate, setClassDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, { status: V6AttendanceStatus; note: string }>>({});
  const attendanceLessonId = activeSheet?.type === "attendance" ? activeSheet.entityId ?? "" : "";
  const attendanceLesson = db.lessons.find((lesson) => lesson.id === attendanceLessonId);
  const attendanceGroup = attendanceLesson ? db.groups.find((group) => group.id === attendanceLesson.groupId) : undefined;
  const attendanceStudents = attendanceGroup ? selectV6StudentsForAttendanceGroup(db, attendanceGroup.id) : [];
  const attendanceRecordsForLesson = attendanceLesson && attendanceGroup ? db.attendance.filter((record) => record.lessonId === attendanceLesson.id && record.groupId === attendanceGroup.id && record.classDate === classDate) : [];
  const attendanceMarkedCount = attendanceRecordsForLesson.length;
  const attendanceLastSaved = attendanceRecordsForLesson.map((record) => record.savedAt ?? record.updatedAt ?? record.createdAt).sort().at(-1);
  function openAttendance(lessonId: string) {
    const lesson = db.lessons.find((item) => item.id === lessonId);
    const group = lesson ? db.groups.find((item) => item.id === lesson.groupId) : undefined;
    if (!lesson || !group) {
      show("לא נמצאה קבוצה לשיעור");
      return;
    }
    const operation = buildV6SaveAttendanceOperation(db, user, { lessonId: lesson.id, groupId: group.id, classDate, records: [] });
    if (!operation.allowed && operation.reason !== "סטטוס נוכחות או תלמיד/ה לא תקינים") {
      show(operation.reason ?? "אין הרשאה לסימון נוכחות");
      return;
    }
    const students = selectV6StudentsForAttendanceGroup(db, group.id);
    if (!students.length) {
      show("אין תלמידים משויכים לקבוצה");
      return;
    }
    const nextDraft: Record<string, { status: V6AttendanceStatus; note: string }> = {};
    students.forEach((student) => {
      const existing = db.attendance.find((record) => record.lessonId === lesson.id && record.groupId === group.id && record.classDate === classDate && record.studentId === student.id);
      nextDraft[student.id] = { status: existing?.status ?? "present", note: existing?.note ?? "" };
    });
    setActiveSheet({ type: "attendance", entityId: lesson.id, mode: "edit", payload: { groupId: group.id, classDate } });
    setAttendanceDraft(nextDraft);
  }
  function setAttendanceStatus(studentId: string, status: V6AttendanceStatus) {
    setAttendanceDraft((draft) => ({ ...draft, [studentId]: { status, note: draft[studentId]?.note ?? "" } }));
  }
  function setAttendanceNote(studentId: string, note: string) {
    setAttendanceDraft((draft) => ({ ...draft, [studentId]: { status: draft[studentId]?.status ?? "present", note } }));
  }
  function markAllPresent() {
    setAttendanceDraft((draft) => Object.fromEntries(Object.entries(draft).map(([studentId, item]) => [studentId, { ...item, status: "present" as const }])));
    show("כולם סומנו נוכחים. אפשר לסמן חריגים עכשיו");
  }
  function saveAttendance() {
    if (!attendanceLesson || !attendanceGroup) {
      show("חובה לבחור קבוצה ושיעור");
      return;
    }
    const now = new Date().toISOString();
    const records: V6AttendanceRecord[] = attendanceStudents.map((student) => {
      const draft = attendanceDraft[student.id] ?? { status: "present" as const, note: "" };
      return {
        id: `att_${attendanceLesson.id}_${classDate}_${student.id}`,
        studioId: user.studioId,
        studentId: student.id,
        lessonId: attendanceLesson.id,
        groupId: attendanceGroup.id,
        classDate,
        status: draft.status,
        note: draft.note.trim() || undefined,
        markedByUserId: user.id,
        savedAt: now,
        createdAt: now,
        updatedAt: now
      };
    });
    const operation = buildV6SaveAttendanceOperation(db, user, { lessonId: attendanceLesson.id, groupId: attendanceGroup.id, classDate, records });
    if (!operation.allowed) {
      show(operation.reason ?? "לא ניתן לשמור נוכחות");
      return;
    }
    dispatch({ type: "save_attendance", actor: user, lessonId: attendanceLesson.id, groupId: attendanceGroup.id, classDate, records });
    setActiveSheet(null);
    show("הנוכחות נשמרה");
  }
  const attendanceEditor = attendanceLesson && attendanceGroup ? (
    <div className="flex flex-col gap-3">
      <LovableEditorialPanel
        kicker="נוכחות שיעור"
        title={`${attendanceGroup.name} · ${attendanceLesson.time}`}
        description={`${attendanceGroup.danceStyle ?? attendanceGroup.style} · ${db.users.filter((teacher) => attendanceGroup.teacherIds.includes(teacher.id)).map((teacher) => teacher.name).join(", ") || "מורה לא שויך"} · ${attendanceStudents.length} תלמידים`}
      >
        <SafeMeta as="p" className="text-xs leading-relaxed text-white/48">
          סומנו {attendanceMarkedCount}/{attendanceStudents.length} · {attendanceLastSaved ? `נשמר לאחרונה ${new Date(attendanceLastSaved).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}` : "טרם נשמר היום"}
        </SafeMeta>
      </LovableEditorialPanel>
      <div className={v6Cx(v6Lovable.card, "grid grid-cols-2 gap-2 rounded-2xl p-2 [&>button]:w-full")}>
        <V6Button onClick={saveAttendance}>שמירת נוכחות</V6Button>
        <V6Button variant="ghost" onClick={() => setActiveSheet(null)}>ביטול</V6Button>
      </div>
      <div className={v6Cx(v6Lovable.card, "grid gap-3 rounded-2xl p-4")}>
        <FormField label="תאריך שיעור" value={classDate} onChange={setClassDate} type="date" />
        <V6Button variant="ghost" onClick={markAllPresent}>סמן כולם נוכחים</V6Button>
      </div>
      <div className="flex flex-col gap-2">
        {attendanceStudents.map((student) => {
          const draft = attendanceDraft[student.id] ?? { status: "present" as V6AttendanceStatus, note: "" };
          const recentAbsences = db.attendance.filter((record) => record.studentId === student.id && (record.status === "absent" || record.status === "missing")).length;
          const parent = db.users.find((item) => item.role === "parent" && (item.linkedStudentIds.includes(student.id) || student.linkedParentIds?.includes(item.id)));
          const openTasks = db.tasks.filter((task) => student.groupIds.includes(task.groupId) && !task.doneByUserIds.includes(student.id)).length;
          return (
            <article key={student.id} className={v6Cx(v6Lovable.card, "rounded-2xl p-4 text-start")}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <SafeTitle as="p" className="text-base font-semibold tracking-tight text-white/92">{student.name}</SafeTitle>
                  <SafeMeta as="p" className={v6Cx("mt-1 text-[12px] font-semibold", draft.status === "absent" || draft.status === "missing" ? "text-rose-100" : draft.status === "late" ? "text-yellow-100" : "text-emerald-100")}>{attendanceStatusLabel[draft.status]}</SafeMeta>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] leading-relaxed text-white/46">
                {recentAbsences ? <span>היעדרויות אחרונות: <BidiNumber>{recentAbsences}</BidiNumber></span> : <span>נוכחות יציבה</span>}
                {openTasks ? <span>משימות פתוחות: <BidiNumber>{openTasks}</BidiNumber></span> : null}
                {parent && (user.role === "management" || user.role === "super_admin" || user.permissions.manageAttendance) ? <span>טלפון הורה: <BidiNumber>{parent.phone}</BidiNumber></span> : null}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">{(["present", "absent", "late", "excused"] as V6AttendanceStatus[]).map((status) => <button type="button" key={status} onClick={() => setAttendanceStatus(student.id, status)} className={v6Cx("justify-center", draft.status === status ? v6LovableForm.chipActive : v6LovableForm.chip)}>{attendanceStatusLabel[status]}</button>)}</div>
              <div className="mt-3"><FormField label="הערה" value={draft.note} onChange={(value) => setAttendanceNote(student.id, value)} placeholder="למשל סיבת היעדרות או איחור" /></div>
            </article>
          );
        })}
      </div>
      <SheetActions>
        <V6Button onClick={saveAttendance}>שמירת נוכחות</V6Button>
        <V6Button variant="ghost" onClick={() => setActiveSheet(null)}>ביטול</V6Button>
      </SheetActions>
    </div>
  ) : null;
  const canMarkAttendance = user.permissions.manageAttendance || user.role === "super_admin";
  return (
    <MobileScreen className="gap-7">
      <LovableEditorialPanel
        kicker="השיעור הקרוב"
        title={nextLesson?.title ?? "אין שיעור קרוב"}
        description={nextLesson ? `${nextLesson.weekday} · ${nextLesson.time} · ${nextLesson.room}` : "אפשר לתאם שיעור פרטי מהמסך הבא."}
        trailing={
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-100/10 text-emerald-100">
            <CalendarDays size={17} strokeWidth={1.8} aria-hidden="true" />
          </span>
        }
      />
      <section dir="rtl" className="flex flex-col gap-3 text-start">
        <div className="flex items-end justify-between gap-2 px-1">
          <div>
            <SafeMeta as="p" className={v6Lovable.eyebrow}>חזרות ושיעורים</SafeMeta>
            <SafeTitle as="h2" className={v6Cx(v6Lovable.sectionTitle, "mt-1") }>קצב השבוע</SafeTitle>
          </div>
          <SafeMeta as="span" className="text-[11px] font-medium text-white/40"><BidiNumber>{lessons.length}</BidiNumber></SafeMeta>
        </div>
        <div className="flex flex-col gap-2">
          {lessons.map((lesson) => {
            const group = db.groups.find((g) => g.id === lesson.groupId);
            const tone = toneForStyle(group?.style);
            const todayRecords = db.attendance.filter((record) => record.lessonId === lesson.id && record.classDate === classDate);
            const absentCount = todayRecords.filter((record) => record.status === "absent" || record.status === "missing").length;
            const lateCount = todayRecords.filter((record) => record.status === "late").length;
            const isNext = lesson.id === nextLesson?.id;
            const statusLine = todayRecords.length
              ? `${todayRecords.length} סומנו · ${absentCount} חסרים · ${lateCount} איחורים`
              : "טרם סומן היום";
            return (
              <article
                key={lesson.id}
                dir="rtl"
                className={v6Cx(
                  v6Lovable.card,
                  "rounded-2xl p-4 text-start",
                  isNext && "ring-1 ring-[#f4d58d]/30"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <SafeMeta as="p" className={v6Lovable.eyebrow}>{lesson.weekday}</SafeMeta>
                    <SafeTitle as="h3" className="mt-1 text-[15px] font-semibold tracking-[-0.012em] text-white/90">{lesson.title}</SafeTitle>
                    <SafeMeta as="p" className="mt-1 text-[12px] leading-relaxed text-white/48">
                      {lesson.room}
                      {group?.style ? <span className={v6Cx("ms-1 font-semibold", v6Tone[tone].text)}> · {group.style}</span> : null}
                    </SafeMeta>
                  </div>
                  <span className={v6Cx("inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-semibold tabular-nums", v6Tone[tone].soft, v6Tone[tone].text)}>
                    <BidiNumber>{lesson.time}</BidiNumber>
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <SafeMeta as="span" className="text-[11px] text-white/42">{statusLine}</SafeMeta>
                  {canMarkAttendance ? (
                    <button
                      type="button"
                      onClick={() => openAttendance(lesson.id)}
                      className={v6Cx("inline-flex min-h-9 items-center rounded-full bg-[#f4d58d] px-3 text-[11px] font-semibold text-zinc-950", v6Motion.pressSoft, v6Motion.focusRing, "touch-manipulation")}
                    >
                      סימון נוכחות
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
          {lessons.length === 0 ? (
            <LovableEditorialPanel description="אין שיעורים מתוזמנים כרגע. אפשר לבדוק שוב אחרי שמורה הוסיף שיעור." />
          ) : null}
        </div>
      </section>
      <V6SheetController activeSheet={attendanceEditor ? activeSheet : null} title="סימון נוכחות" onClose={() => setActiveSheet(null)}>{attendanceEditor}</V6SheetController>
    </MobileScreen>
  );
}

function NotificationRow({ icon: Icon, title, body, source, unread, tone = "studio", onClick }: { icon: React.ElementType; title: string; body: string; source: string; unread?: boolean; tone?: V6Tone; onClick?: () => void }) {
  const Component = onClick ? "button" : "div";
  return (
    <Component dir="rtl" onClick={onClick} className={v6Cx("group grid min-h-[42px] w-full grid-cols-[auto_1fr_auto] items-center gap-1.5 rounded-[12px] border px-2 py-1.5 text-start outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#f4d58d]/25", unread ? "border-[rgba(255,228,230,0.060)] bg-[rgba(255,228,230,0.024)]" : v6Surface.whisper)}>
      <span className={v6Cx("relative grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[9px]", v6Tone[tone].soft, v6Tone[tone].text)}>
        {unread ? <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-rose-200 shadow-[0_0_0_2px_rgba(8,5,6,0.88)]" /> : null}
        <Icon size={10.5} strokeWidth={1.9} />
      </span>
      <span className="min-w-0">
        <SafeTitle as="span" className="block truncate text-[11.5px] font-semibold tracking-[-0.008em] text-white/84">{title}</SafeTitle>
        <SafeMeta as="span" className="mt-px block truncate text-[9px] font-medium text-white/38">{body}</SafeMeta>
      </span>
      <span className="min-w-0 shrink-0 text-start">
        <SafeMeta as="span" className={v6Cx("block max-w-[3.8rem] truncate text-[8.5px] font-semibold", unread ? "text-rose-100/70" : "text-white/30")}>{unread ? "לא נקרא" : "נקרא"}</SafeMeta>
        <SafeMeta as="span" className="mt-px block max-w-[3.8rem] truncate text-[8px] text-white/26">{source}</SafeMeta>
      </span>
    </Component>
  );
}

function Messages({ user, show, openScreen, openTab }: { user: V6User; show: (message: string) => void; openScreen: (screen: V6Screen) => void; openTab: (tab: V6Tab) => void }) {
  const { db, dispatch } = useV6();
  const activityCenter = useMemo(() => selectV6ActivityCenterForActor(db, user, { limit: 60 }), [db, user]);
  const { openActivityItem } = useV6ActivityNavigationHandlers(openTab, openScreen);

  const handleOpenItem = (item: (typeof activityCenter.items)[number]) => {
    if (item.sourceKind === "notification") {
      dispatch({ type: "mark_notification_read", userId: user.id, notificationId: item.sourceId });
    }
    openActivityItem(item);
  };

  return (
    <ActivityCenterPanel
      viewModel={activityCenter}
      onOpenItem={handleOpenItem}
      onMarkAllRead={() => {
        dispatch({ type: "mark_all_read", userId: user.id });
        show("הכול סומן כנקרא");
      }}
    />
  );
}


function Shop({ user, show, openScreen }: { user: V6User; show: (message: string) => void; openScreen: (screen: V6Screen) => void }) {
  const { db, dispatch } = useV6();
  const [category, setCategory] = useState("הכול");
  const [activeSheet, setActiveSheet] = useState<V6ActiveSheet | null>(null);
  const [productId, setProductId] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productCategory, setProductCategory] = useState("אביזרים");
  const [productType, setProductType] = useState<NonNullable<V6Product["type"]>>("accessory");
  const [productPrice, setProductPrice] = useState("");
  const [productPriceMode, setProductPriceMode] = useState<NonNullable<V6Product["priceMode"]>>("paid");
  const [productActive, setProductActive] = useState(true);
  const [productInventoryStatus, setProductInventoryStatus] = useState<NonNullable<V6Product["inventoryStatus"]>>("in_stock");
  const [productVisibility, setProductVisibility] = useState<NonNullable<V6Product["visibility"]>>("public");
  const [productSizes, setProductSizes] = useState("");
  const [productColors, setProductColors] = useState("");
  const [productNotes, setProductNotes] = useState("");
  const [productPickupNote, setProductPickupNote] = useState("");
  const [productMemberOnly, setProductMemberOnly] = useState(false);
  const [productImageId, setProductImageId] = useState("");
  const [pendingProductImageFile, setPendingProductImageFile] = useState<File | null>(null);
  const [productImagePreviewUrl, setProductImagePreviewUrl] = useState("");
  const [productSaving, setProductSaving] = useState(false);
  const productImageInput = useRef<HTMLInputElement>(null);
  const categories = uniqueBy(["הכול", "אביזרים", "כרטיסים", "פרטיים", "ביגוד"], (item) => item);
  const productCategories = uniqueBy(v6ProductCategories, (item) => item.trim());
  const filtered = category === "פרטיים" ? selectV6ShopProductsForActor(db, user, "שיעורים") : selectV6ShopProductsForActor(db, user, category);
  const lanes = selectV6FeaturedShopLanes(db);
  const shopImages = db.media.filter((item) => item.mediaType === "image" && (item.visibility === "shop" || item.linkedProductId || item.localPreviewUrl));
  const products = filtered;
  function openProductEditor(product?: V6Product) {
    const nextId = product?.id ?? nextV6ClientId("prod");
    setProductId(nextId);
    setProductTitle(product?.title ?? "");
    setProductDescription(product?.description ?? "");
    setProductCategory(product?.category ?? "אביזרים");
    setProductType(product?.type ?? "accessory");
    setProductPrice(product ? String(product.price) : "");
    setProductPriceMode(product?.priceMode ?? "paid");
    setProductActive(product?.active ?? true);
    setProductInventoryStatus(product?.inventoryStatus ?? (product?.active === false ? "draft" : "in_stock"));
    setProductVisibility(product?.visibility ?? "public");
    setProductSizes(product?.sizes?.join(", ") ?? "");
    setProductColors(product?.colors?.join(", ") ?? "");
    setProductNotes(product?.notes ?? "");
    setProductPickupNote(product?.pickupDeliveryNote ?? "");
    setProductMemberOnly(product?.memberOnly ?? (product?.visibility === "members"));
    setProductImageId(product?.featuredImageMediaId ?? product?.imageMediaIds[0] ?? "");
    setPendingProductImageFile(null);
    setProductImagePreviewUrl("");
    setActiveSheet(product ? { type: "edit-product", entityId: product.id, mode: "edit" } : { type: "add-product", entityId: nextId, mode: "add" });
  }
  function uploadProductImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      show("אפשר לבחור תמונת מוצר בלבד");
      return;
    }
    if (productImagePreviewUrl) URL.revokeObjectURL(productImagePreviewUrl);
    setPendingProductImageFile(file);
    setProductImagePreviewUrl(URL.createObjectURL(file));
    show("התמונה תעלה ל־R2 בשמירת המוצר");
  }
  async function saveProduct() {
    const academyId = academyIdFor(user);
    let product: V6Product = {
      id: productId || nextV6ClientId("prod"),
      studioId: user.studioId,
      academyId,
      title: productTitle,
      description: productDescription,
      category: productCategory,
      type: productType,
      price: productPriceMode === "free" || (productPriceMode === "request" && !productPrice.trim()) ? 0 : Number(productPrice),
      priceMode: productPriceMode,
      active: productActive && productInventoryStatus !== "draft",
      inventoryStatus: productInventoryStatus,
      visibility: productMemberOnly ? "members" : productVisibility,
      sizes: productSizes.split(","),
      colors: productColors.split(","),
      notes: productNotes,
      pickupDeliveryNote: productPickupNote,
      memberOnly: productMemberOnly,
      imageMediaIds: productImageId ? [productImageId] : [],
      featuredImageMediaId: productImageId || undefined
    };
    const operation = buildV6SaveProductOperation(db, user, product);
    if (!operation.allowed) {
      show(operation.reason ?? "לא ניתן לשמור מוצר");
      return;
    }
    setProductSaving(true);
    try {
      await persistProduct(product, academyId);
      if (pendingProductImageFile) {
        const uploaded = await uploadMediaToR2({
          file: pendingProductImageFile,
          user,
          academyId,
          title: product.title || "תמונת מוצר",
          visibility: "shop_public",
          productId: product.id,
          tags: ["shop", product.category]
        });
        dispatch({ type: "save_media", actor: user, media: uploaded.media });
        product = {
          ...product,
          imageMediaIds: [uploaded.media.id],
          featuredImageMediaId: uploaded.media.id
        };
        if (uploaded.persisted) {
          await persistProduct(product, academyId);
        }
        show(uploaded.persisted ? "המוצר והתמונה נשמרו ב־R2" : "המוצר נשמר מקומית; התמונה היא תצוגת דמו בלבד");
      } else {
        show("המוצר נשמר ומופיע בחנות");
      }
      dispatch({ type: "save_product", actor: user, product });
      setCategory(product.category.includes("שיעורים") ? "פרטיים" : product.category.includes("כרטיסים") ? "כרטיסים" : product.category);
      setPendingProductImageFile(null);
      setProductImagePreviewUrl("");
      setActiveSheet(null);
    } catch (error) {
      show(error instanceof Error ? error.message : "שמירת המוצר נכשלה");
    } finally {
      setProductSaving(false);
    }
  }
  const productEditor = (
    <div className="flex flex-col gap-3">
      <div className={v6Cx(v6Lovable.card, "rounded-2xl p-4 text-start")}>
        <SafeMeta as="p" className={v6Lovable.eyebrow}>ניהול מוצר</SafeMeta>
        <SafeTitle as="h3" className="mt-1.5 truncate text-base font-semibold tracking-tight text-white/92">{productTitle || "מוצר חדש"}</SafeTitle>
        <SafeMeta as="p" className={v6Cx("mt-1.5", v6LovableForm.helper)}>שמירה מעדכנת את הנתונים, יומן הפעולות והחנות באותו רגע.</SafeMeta>
      </div>
      <div className={v6LovableForm.group}>
        <FormField label="שם מוצר" value={productTitle} onChange={setProductTitle} />
        <FormField label="תיאור" value={productDescription} onChange={setProductDescription} />
      </div>
      <div className={v6Cx(v6LovableForm.groupGrid, "sm:grid-cols-2")}>
        <SelectField label="קטגוריה" value={productCategory} onChange={setProductCategory}>{productCategories.map((item) => <option key={item} value={item} className="bg-zinc-950">{item}</option>)}</SelectField>
        <SelectField label="סוג מוצר" value={productType} onChange={(next) => setProductType(next as NonNullable<V6Product["type"]>)}>{v6ProductTypes.map((item) => <option key={item} value={item} className="bg-zinc-950">{productTypeLabel[item]}</option>)}</SelectField>
      </div>
      <div className={v6Cx(v6LovableForm.groupGrid, "sm:grid-cols-2")}>
        <SelectField label="תמחור" value={productPriceMode} onChange={(next) => setProductPriceMode(next as NonNullable<V6Product["priceMode"]>)}>{Object.entries(productPriceModeLabel).map(([id, label]) => <option key={id} value={id} className="bg-zinc-950">{label}</option>)}</SelectField>
        <FormField label="מחיר ₪" value={productPrice} onChange={setProductPrice} type="number" />
      </div>
      <div className={v6Cx(v6LovableForm.groupGrid, "sm:grid-cols-2")}>
        <SelectField label="סטטוס מלאי" value={productInventoryStatus} onChange={(next) => { const value = next as NonNullable<V6Product["inventoryStatus"]>; setProductInventoryStatus(value); setProductActive(value !== "draft"); }}>{v6InventoryStatuses.map((item) => <option key={item} value={item} className="bg-zinc-950">{inventoryStatusLabel[item]}</option>)}</SelectField>
        <SelectField label="נראות" value={productVisibility} onChange={(next) => setProductVisibility(next as NonNullable<V6Product["visibility"]>)}><option value="public" className="bg-zinc-950">גלוי בחנות</option><option value="members" className="bg-zinc-950">לחברים בלבד</option><option value="hidden" className="bg-zinc-950">מוסתר</option></SelectField>
      </div>
      <div className={v6Cx(v6LovableForm.groupGrid, "sm:grid-cols-2")}>
        <FormField label="מידות (מופרד בפסיקים)" value={productSizes} onChange={setProductSizes} />
        <FormField label="צבעים (מופרד בפסיקים)" value={productColors} onChange={setProductColors} />
      </div>
      <div className={v6LovableForm.group}>
        <FormField label="הערות מוצר" value={productNotes} onChange={setProductNotes} />
        <FormField label="הערת איסוף / משלוח" value={productPickupNote} onChange={setProductPickupNote} />
      </div>
      <button type="button" onClick={() => setProductMemberOnly((value) => !value)} className={productMemberOnly ? v6LovableForm.toggleRowActive : v6LovableForm.toggleRow}>
        <span className="min-w-0 truncate">דרופ מוגבל לחברי סטודיו בלבד</span>
        <span className={v6Cx("text-[11px] font-medium", productMemberOnly ? "text-zinc-950/72" : "text-white/40")}>{productMemberOnly ? "פעיל" : "כבוי"}</span>
      </button>
      <input ref={productImageInput} type="file" accept="image/*" className="hidden" onChange={(event) => uploadProductImage(event.target.files?.[0])} />
      <div className={v6Cx(v6Lovable.card, "flex flex-col gap-3 rounded-2xl p-4")}>
        <div className="flex gap-2 [&>button]:flex-1"><V6Button variant="ghost" onClick={() => productImageInput.current?.click()}><Upload size={16} /> העלאת תמונה</V6Button></div>
        {pendingProductImageFile ? <SafeMeta as="p" className={v6Cx(v6LovableForm.helper, "text-emerald-100/72")}>נבחרה תמונה להעלאה בשמירה: {pendingProductImageFile.name}</SafeMeta> : null}
        {productImagePreviewUrl ? <div className="h-28 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${productImagePreviewUrl})` }} role="img" aria-label="תצוגה מקדימה של תמונת מוצר" /> : null}
        {shopImages.length ? <SelectField label="בחירת תמונה קיימת" value={productImageId} onChange={setProductImageId}><option value="" className="bg-zinc-950">ללא תמונה</option>{shopImages.map((item) => <option key={item.id} value={item.id} className="bg-zinc-950">{item.title}</option>)}</SelectField> : <SafeMeta as="p" className={v6LovableForm.helper}>אין עדיין תמונות מוצר שמורות.</SafeMeta>}
      </div>
      <SheetActions>
        <V6Button disabled={productSaving} onClick={() => void saveProduct()}>{productSaving ? "שומר…" : "שמירת מוצר"}</V6Button>
        <V6Button variant="ghost" onClick={() => setActiveSheet(null)}>ביטול</V6Button>
      </SheetActions>
    </div>
  );
  return (
    <MobileScreen className="gap-5">
      <section dir="rtl" className={v6Cx(v6Lovable.cardStrong, "flex flex-col gap-4 p-5 text-start")}>
        <div className="grid grid-cols-[1fr_auto] items-start gap-2">
          <div className="min-w-0">
            <SafeMeta as="p" className={v6Lovable.eyebrow}>חנות</SafeMeta>
            <SafeTitle as="h1" className={v6Lovable.sectionTitle}>חנות הסטודיו</SafeTitle>
            <SafeMeta as="p" className="mt-1 text-sm leading-relaxed text-white/48">מוצרים, כרטיסים ושיעורים פרטיים.</SafeMeta>
          </div>
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[10px] bg-[#f4d58d]/10 text-yellow-50"><ShoppingBag size={12} strokeWidth={1.9} /></span>
        </div>
        <div className="mt-1.5 overflow-x-auto pb-0.5 no-scrollbar [&_button]:min-h-6 [&_button]:rounded-[10px] [&_button]:px-2.5 [&_button]:py-1 [&_button]:text-[9.5px]"><SegmentedControl value={category} options={categories} onChange={setCategory} /></div>
        <div className="mt-1 grid grid-cols-2 gap-1">
          <button onClick={() => openScreen("private_lessons")} className="min-w-0 rounded-[11px] border border-[#f4d58d]/6 bg-white/[0.014] px-2 py-1 text-start transition active:scale-[0.99]">
            <SafeMeta as="p" className={v6Type.kicker}>שיעורים פרטיים</SafeMeta>
            <SafeTitle as="p" className="mt-px truncate text-[10.8px] font-semibold text-white/78">{lanes.privateLessons.length} {lanes.privateLessons.length === 1 ? "אפשרות" : "אפשרויות"}</SafeTitle>
          </button>
          <button onClick={() => setCategory("כרטיסים")} className="min-w-0 rounded-[11px] border border-[#f4d58d]/6 bg-white/[0.014] px-2 py-1 text-start transition active:scale-[0.99]">
            <SafeMeta as="p" className={v6Type.kicker}>כרטיסים</SafeMeta>
            <SafeTitle as="p" className="mt-px truncate text-[10.8px] font-semibold text-white/78">{lanes.tickets.length} במלאי</SafeTitle>
          </button>
        </div>
        {(user.permissions.manageShop || user.role === "super_admin") ? (
          <button onClick={() => openProductEditor()} className="mt-1 grid w-full grid-cols-[auto_1fr] items-center gap-1.5 rounded-[11px] border border-[#f4d58d]/7 bg-[#f4d58d]/[0.028] px-2 py-1 text-start transition active:scale-[0.99]">
            <Plus size={11.5} className="text-[#f4d58d]/70" />
            <span className="min-w-0">
              <SafeTitle as="span" className="block text-[10.8px] font-semibold text-white/80">הוספת מוצר</SafeTitle>
              <SafeMeta as="span" className="mt-px block truncate text-[8.8px] text-white/32">ניהול מוצר ותמונות</SafeMeta>
            </span>
          </button>
        ) : null}
      </section>
      <V6SheetController activeSheet={activeSheet} title={productTitle || "מוצר חדש"} onClose={() => setActiveSheet(null)}>{productEditor}</V6SheetController>
      <V6ShopProductGrid>
        {products.map((product) => {
          const privateLesson = product.category.includes("שיעורים");
          const canEdit = user.permissions.manageShop || user.role === "super_admin";
          return (
            <V6ShopProductCard
              key={product.id}
              product={product}
              imageUrl={resolveV6ProductImageUrl(db, product)}
              priceLabel={selectV6ProductPriceLabel(product)}
              actionLabel={privateLesson ? "זמינות" : "הזמנה"}
              actionDisabled={!product.active}
              onPress={
                privateLesson
                  ? () => openScreen("private_lessons")
                  : () => {
                      dispatch({ type: "shop_order", actor: user, productId: product.id });
                      show("ההזמנה נשלחה לסטודיו");
                    }
              }
              onEdit={canEdit ? () => openProductEditor(product) : undefined}
            />
          );
        })}
      </V6ShopProductGrid>
    </MobileScreen>
  );
}

function More({ user, openScreen, openTab }: { user: V6User; openScreen: (screen: V6Screen) => void; openTab: (tab: V6Tab) => void }) {
  const seenMoreTargets = new Set<string>();
  const sections = [
    { title: "ניהול", items: user.role === "super_admin" ? [{ title: "מסד נתונים", subtitle: "ייצוא, ייבוא וגיבוי", icon: Database, tone: "admin" as Tone, screen: "database" as V6Screen }, { title: "טקסטים", subtitle: "תוכן שאפשר לערוך", icon: Sparkles, tone: "repertoire" as Tone, screen: "texts" as V6Screen }, { title: "אפשרויות", subtitle: "הפעלה וכיבוי", icon: Flag, tone: "admin" as Tone, screen: "flags" as V6Screen }, { title: "יומן פעולות", subtitle: "מה השתנה ומתי", icon: ClipboardList, tone: "management" as Tone, screen: "audit" as V6Screen }, { title: "פתיחה וסנכרון", subtitle: "בדיקות בסיסיות", icon: HeartPulse, tone: "studio" as Tone, screen: "system" as V6Screen }, { title: "חיבורים", subtitle: "Supabase, R2 ותשלומים", icon: Shield, tone: "admin" as Tone, screen: "integrations" as V6Screen }, { title: "מיתוג", subtitle: "שם, שפה ונראות סטודיו", icon: Settings, tone: "admin" as Tone, screen: "branding" as V6Screen }] : [] },
    { title: "הסטודיו", items: [{ title: "לוח שנה ותחרויות", subtitle: "אירועים, חזרות והכנות", icon: CalendarDays, tone: "management" as Tone, screen: "calendar" as V6Screen }, { title: "שיעורים פרטיים", subtitle: "בקשות, מועדים ותשלום", icon: Receipt, tone: "shop" as Tone, screen: "private_lessons" as V6Screen }, { title: "גלריה", subtitle: "תמונות, וידאו וחומרים", icon: ImagePlus, tone: "modern" as Tone, screen: "media" as V6Screen }, { title: "זיכרונות והישגים", subtitle: "רגעים יפים מהסטודיו", icon: Trophy, tone: "repertoire" as Tone, screen: "legacy" as V6Screen }] },
    { title: "חנות ותשלומים", items: [{ title: "חנות הסטודיו", subtitle: "מוצרים, כרטיסים ואמצעי תשלום", icon: ShoppingBag, tone: "shop" as Tone, tab: "shop" as V6Tab }] },
    { title: "כלים למורה", items: user.role === "teacher" || user.role === "management" || user.role === "super_admin" ? [{ title: "שיעורים ונוכחות", subtitle: "לו״ז וסימון נוכחות", icon: School, tone: "studio" as Tone, tab: "lessons" as V6Tab }] : [] },
    { title: "צוות וניהול", items: user.permissions.manageUsers || user.role === "super_admin" ? [{ title: "ניהול משתמשים", subtitle: "תלמידים, הורים וצוות", icon: Users, tone: "management" as Tone, screen: "users" as V6Screen }] : [] }
  ].map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      const key = "tab" in item ? `tab:${item.tab}` : `screen:${item.screen}`;
      if (seenMoreTargets.has(key)) return false;
      seenMoreTargets.add(key);
      return true;
    })
  })).filter((s) => s.items.length);
  return (
    <MobileScreen className="gap-7">
      <LovableEditorialPanel
        kicker={user.role === "super_admin" ? "ניהול" : "כלים שימושיים"}
        title="הגדרות וכלים"
        description="ניהול, סטודיו וחנות במקום אחד."
        trailing={
          <span className={v6Cx("grid h-10 w-10 shrink-0 place-items-center rounded-2xl", user.role === "super_admin" ? v6Tone.admin.soft : v6Tone.management.soft, user.role === "super_admin" ? v6Tone.admin.text : v6Tone.management.text)}>
            <Users size={17} strokeWidth={1.8} aria-hidden="true" />
          </span>
        }
      />
      {sections.map((section) => (
        <section key={section.title} dir="rtl" className="flex flex-col gap-3 text-start">
          <SafeMeta as="p" className={v6Cx(v6Lovable.eyebrow, "px-1")}>{section.title}</SafeMeta>
          <div className="flex flex-col gap-2">
            {section.items.map((item) => (
              <LovableActionRow
                key={item.title}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                tone={item.tone}
                onClick={() => ("tab" in item ? openTab(item.tab) : openScreen(item.screen))}
              />
            ))}
          </div>
        </section>
      ))}
    </MobileScreen>
  );
}

function BackHeader({ title, back, action }: { title: string; back: () => void; action?: ReactNode }) {
  return <PageHeader title={title} action={<div className="lk-safe-action-zone">{action}<V6Button variant="ghost" onClick={back}>חזרה</V6Button></div>} />;
}

function UsersScreen({ actor, show, back }: { actor: V6User; show: (message: string) => void; back: () => void }) {
  const { db, dispatch } = useV6();
  const [selectedId, setSelectedId] = useState(db.users[0]?.id ?? "");
  const selected = db.users.find((u) => u.id === selectedId);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<V6Role | "all">("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeSheet, setActiveSheet] = useState<V6ActiveSheet | null>(null);
  const [name, setName] = useState(selected?.name ?? "");
  const [phone, setPhone] = useState(selected?.phone ?? "");
  const [role, setRole] = useState<V6Role>(selected?.role ?? "student");
  const [permissions, setPermissions] = useState<V6Permissions>(selected?.permissions ?? permissionsFor("student"));
  const [active, setActive] = useState(selected?.active ?? true);
  const [groupIds, setGroupIds] = useState<string[]>(selected?.groupIds ?? []);
  const [linkedStudentIds, setLinkedStudentIds] = useState<string[]>(selected?.linkedStudentIds ?? []);
  const [ageGroup, setAgeGroup] = useState(selected?.ageGroup ?? "");
  const [danceStyleIds, setDanceStyleIds] = useState<string[]>(selected?.danceStyleIds ?? []);
  const [notes, setNotes] = useState(selected?.notes ?? "");
  const [communicationPrefs, setCommunicationPrefs] = useState(selected?.communicationPrefs ?? "");
  const [primaryContact, setPrimaryContact] = useState(selected?.primaryContact ?? false);
  const [privateLessonEnabled, setPrivateLessonEnabled] = useState(selected?.privateLessonEnabled ?? false);
  const [responsibility, setResponsibility] = useState(selected?.responsibility ?? "");
  const [password, setPassword] = useState("new2026");
  const queryValue = query.trim();
  const ageGroups = [...new Set(db.users.map((user) => user.ageGroup).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "he"));
  const danceStyles = [...new Set(db.groups.map((group) => group.danceStyle ?? group.style).filter(Boolean))].sort((a, b) => a.localeCompare(b, "he"));
  const filteredUsers = selectV6UsersByRole(db, actor, filter).filter((user) => {
    const userGroups = db.groups.filter((group) => user.groupIds.includes(group.id));
    const userStyles = [...(user.danceStyleIds ?? []), ...userGroups.map((group) => group.danceStyle ?? group.style)];
    return (!queryValue || `${user.name} ${user.phone} ${roleLabel[user.role]}`.includes(queryValue))
      && (groupFilter === "all" || user.groupIds.includes(groupFilter))
      && (ageFilter === "all" || user.ageGroup === ageFilter || userGroups.some((group) => group.ageGroup === ageFilter))
      && (styleFilter === "all" || userStyles.includes(styleFilter))
      && (statusFilter === "all" || (statusFilter === "active" ? user.active : !user.active));
  });
  const groupedUsers = groupUsersByRole(filteredUsers);
  const availableStudents = sortByHebrewName(db.users.filter((user) => user.role === "student" && user.id !== selectedId));
  const filterOptions: Array<{ id: V6Role | "all"; label: string }> = [
    { id: "all", label: "כולם" },
    { id: "student", label: "תלמידים" },
    { id: "parent", label: "הורים" },
    { id: "teacher", label: "מורים" },
    { id: "management", label: "הנהלה" }
  ];
  function openUserSheet(user: V6User, mode: V6SheetMode = "view") {
    setSelectedId(user.id);
    setName(user.name);
    setPhone(user.phone);
    setRole(user.role);
    setPermissions(user.permissions);
    setActive(user.active);
    setGroupIds(user.groupIds);
    setLinkedStudentIds(user.linkedStudentIds);
    setAgeGroup(user.ageGroup ?? "");
    setDanceStyleIds(user.danceStyleIds ?? []);
    setNotes(user.notes ?? "");
    setCommunicationPrefs(user.communicationPrefs ?? "");
    setPrimaryContact(user.primaryContact ?? false);
    setPrivateLessonEnabled(user.privateLessonEnabled ?? false);
    setResponsibility(user.responsibility ?? "");
    setPassword("");
    setActiveSheet({ type: mode === "view" ? "view-user" : "edit-user", entityId: user.id, mode });
  }
  function openNewUser(roleValue: V6Role = "student") {
    const nextPermissions = permissionsFor(roleValue);
    setSelectedId("");
    setName("");
    setPhone("");
    setRole(roleValue);
    setPermissions(nextPermissions);
    setActive(true);
    setGroupIds([]);
    setLinkedStudentIds([]);
    setAgeGroup("");
    setDanceStyleIds([]);
    setNotes("");
    setCommunicationPrefs("");
    setPrimaryContact(false);
    setPrivateLessonEnabled(false);
    setResponsibility("");
    setPassword("new2026");
    setActiveSheet({ type: "add-user", mode: "add", payload: { role: roleValue } });
  }
  function setRoleAndPermissions(nextRole: V6Role) {
    setRole(nextRole);
    setPermissions(permissionsFor(nextRole));
    if (nextRole !== "parent") setLinkedStudentIds([]);
  }
  function toggleGroup(groupId: string) {
    setGroupIds((items) => items.includes(groupId) ? items.filter((id) => id !== groupId) : [...items, groupId]);
  }
  function toggleLinkedStudent(studentId: string) {
    setLinkedStudentIds((items) => items.includes(studentId) ? items.filter((id) => id !== studentId) : [...items, studentId]);
  }
  function toggleDanceStyle(style: string) {
    setDanceStyleIds((items) => items.includes(style) ? items.filter((id) => id !== style) : [...items, style]);
  }
  function togglePermission(key: keyof V6Permissions) {
    if (!actor.permissions.editPermissions && actor.role !== "super_admin") {
      show("אין הרשאה לעריכת הרשאות");
      return;
    }
    setPermissions((items) => ({ ...items, [key]: !items[key] }));
  }
  function save() {
    const idValue = selectedId || nextV6ClientId("user");
    const existingUser = activeSheet?.type === "add-user" ? undefined : selected;
    const user: V6User = { ...(existingUser ?? { id: idValue, studioId: actor.studioId, name: "", phone: "", role, permissions, active: true, groupIds: [], linkedStudentIds: [] }), id: idValue, studioId: actor.studioId, name, phone, role, permissions, active, status: active ? "active" : "inactive", groupIds: role === "parent" ? [] : groupIds, linkedStudentIds: role === "parent" ? linkedStudentIds : [], ageGroup: role === "student" ? ageGroup : undefined, danceStyleIds: role === "student" || role === "teacher" ? danceStyleIds : undefined, notes, communicationPrefs: role === "parent" ? communicationPrefs : undefined, primaryContact: role === "parent" ? primaryContact : undefined, privateLessonEnabled: role === "teacher" ? privateLessonEnabled : undefined, responsibility: role === "management" || role === "super_admin" ? responsibility : undefined };
    const credential = existingUser ? undefined : { userId: idValue, phone, password };
    const operation = buildV6UpsertUserOperation(db, actor, user, credential);
    if (!operation.allowed) {
      show(operation.reason ?? "לא ניתן לשמור משתמש");
      return false;
    }
    dispatch({ type: "upsert_user", actor, user, credential });
    setSelectedId(idValue);
    setPassword("");
    show("המשתמש נשמר");
    return true;
  }
  function resetPassword() {
    if (!selected) {
      show("איפוס זמין אחרי שמירת משתמש חדש");
      return;
    }
    const operation = buildV6ResetPasswordOperation(actor, selected, password);
    if (!operation.allowed) {
      show(operation.reason ?? "לא ניתן לאפס סיסמה");
      return;
    }
    dispatch({ type: "reset_password", actor, userId: selected.id, password });
    setPassword("");
    show("סיסמה עודכנה");
  }
  const editor = (
    <div className="flex flex-col gap-3">
      <div className={v6Cx(v6Lovable.card, "rounded-2xl p-4 text-start")}>
        <SafeMeta as="p" className={v6Lovable.eyebrow}>זהות והרשאות</SafeMeta>
        <SafeTitle as="h3" className="mt-1.5 text-base font-semibold tracking-tight text-white/92">{selected?.name ?? (name || "משתמש חדש")}</SafeTitle>
        <SafeMeta as="p" className={v6Cx("mt-1.5", v6LovableForm.helper)}>שינוי תפקיד מעדכן את הרשאות המשתמש דרך אותו מסלול נתונים.</SafeMeta>
      </div>
      <div className={v6Cx(v6Lovable.card, "grid grid-cols-2 gap-2 rounded-2xl p-2 [&>button]:w-full")}>
        <V6Button onClick={() => { if (save()) setActiveSheet(null); }}>שמירה</V6Button>
        <V6Button variant="ghost" onClick={resetPassword}>איפוס סיסמה</V6Button>
      </div>
      <div className={v6LovableForm.group}>
        <FormField label="שם" value={name} onChange={setName} />
        <FormField label="טלפון" value={phone} onChange={setPhone} />
      </div>
      <div className={v6Cx(v6LovableForm.groupGrid, "sm:grid-cols-2")}>
        <SelectField label="תפקיד" value={role} onChange={(next) => setRoleAndPermissions(next as V6Role)}>{Object.entries(roleLabel).map(([id, label]) => <option key={id} value={id} className="bg-zinc-950">{label}</option>)}</SelectField>
        <SelectField label="סטטוס" value={active ? "active" : "inactive"} onChange={(next) => setActive(next === "active")}><option value="active" className="bg-zinc-950">פעיל</option><option value="inactive" className="bg-zinc-950">מושבת</option></SelectField>
      </div>
      {(role === "teacher" || role === "student") ? (
        <div className={v6Cx(v6Lovable.card, "rounded-2xl p-4 text-start")}>
          <SafeMeta as="p" className={v6Lovable.eyebrow}>{role === "teacher" ? "שיוך מורה לקבוצות" : "שיוך תלמיד/ה לקבוצות"}</SafeMeta>
          <div className="mt-3 flex flex-wrap gap-1.5">{db.groups.map((group) => <button type="button" key={group.id} onClick={() => toggleGroup(group.id)} className={groupIds.includes(group.id) ? v6LovableForm.chipActive : v6LovableForm.chip}>{group.name}</button>)}</div>
        </div>
      ) : null}
      {role === "student" ? <div className={v6LovableForm.group}><FormField label="קבוצת גיל" value={ageGroup} onChange={setAgeGroup} placeholder="למשל נוער / בוגרות" /></div> : null}
      {(role === "teacher" || role === "student") ? (
        <div className={v6Cx(v6Lovable.card, "rounded-2xl p-4 text-start")}>
          <SafeMeta as="p" className={v6Lovable.eyebrow}>סגנונות ריקוד</SafeMeta>
          <div className="mt-3 flex flex-wrap gap-1.5">{danceStyles.map((style) => <button type="button" key={style} onClick={() => toggleDanceStyle(style)} className={danceStyleIds.includes(style) ? v6LovableForm.chipActive : v6LovableForm.chip}>{style}</button>)}</div>
        </div>
      ) : null}
      {role === "parent" ? (
        <div className={v6Cx(v6Lovable.card, "rounded-2xl p-4 text-start")}>
          <SafeMeta as="p" className={v6Lovable.eyebrow}>קישור הורה לתלמיד/ה</SafeMeta>
          <div className="mt-3 flex flex-wrap gap-1.5">{availableStudents.map((student) => <button type="button" key={student.id} onClick={() => toggleLinkedStudent(student.id)} className={linkedStudentIds.includes(student.id) ? v6LovableForm.chipActive : v6LovableForm.chip}>{student.name}</button>)}</div>
        </div>
      ) : null}
      {role === "parent" ? (
        <div className={v6Cx(v6LovableForm.groupGrid, "sm:grid-cols-2")}>
          <FormField label="העדפות תקשורת" value={communicationPrefs} onChange={setCommunicationPrefs} />
          <button type="button" onClick={() => setPrimaryContact((value) => !value)} className={primaryContact ? v6LovableForm.toggleRowActive : v6LovableForm.toggleRow}>
            <span className="min-w-0 truncate">איש קשר ראשי</span>
            <span className={v6Cx("text-[11px] font-medium", primaryContact ? "text-zinc-950/72" : "text-white/40")}>{primaryContact ? "פעיל" : "כבוי"}</span>
          </button>
        </div>
      ) : null}
      {role === "teacher" ? (
        <button type="button" onClick={() => setPrivateLessonEnabled((value) => !value)} className={privateLessonEnabled ? v6LovableForm.toggleRowActive : v6LovableForm.toggleRow}>
          <span className="min-w-0 truncate">זמין/ה לשיעורים פרטיים</span>
          <span className={v6Cx("text-[11px] font-medium", privateLessonEnabled ? "text-zinc-950/72" : "text-white/40")}>{privateLessonEnabled ? "פעיל" : "כבוי"}</span>
        </button>
      ) : null}
      {(role === "management" || role === "super_admin") ? <div className={v6LovableForm.group}><FormField label="אחריות / תפקיד ניהולי" value={responsibility} onChange={setResponsibility} /></div> : null}
      <div className={v6LovableForm.group}><FormField label="הערות" value={notes} onChange={setNotes} /></div>
      <div className={v6Cx(v6Lovable.card, "rounded-2xl p-4 text-start")}>
        <SafeMeta as="p" className={v6Lovable.eyebrow}>הרשאות</SafeMeta>
        <div className="mt-3 flex flex-wrap gap-1.5">{permissionLabels.map(([key, label]) => <button type="button" key={key} onClick={() => togglePermission(key)} className={permissions[key] ? v6LovableForm.chipActive : v6LovableForm.chip}>{label}</button>)}</div>
      </div>
      <div className={v6LovableForm.group}><FormField label={selected ? "סיסמה חדשה לאיפוס" : "סיסמה ראשונית"} value={password} onChange={setPassword} /></div>
      <SheetActions>
        <V6Button onClick={() => { if (save()) setActiveSheet(null); }}>שמירה</V6Button>
        <V6Button variant="ghost" onClick={resetPassword}>איפוס</V6Button>
        <V6Button variant="ghost" onClick={() => setActiveSheet(null)}>ביטול</V6Button>
      </SheetActions>
    </div>
  );
  return (
    <div className="space-y-4">
      <BackHeader title="ניהול משתמשים" back={back} action={<V6Button onClick={() => openNewUser("student")}>חדש</V6Button>} />
      <HeroSurface tone="management" className="min-h-[176px] p-5">
        <V6StatusBadge tone="management">זהויות</V6StatusBadge>
        <SafeTitle as="h2" className="mt-4 max-w-[19rem] text-xl font-semibold leading-[1.15] tracking-tight">להחזיק את הלהקה נכון</SafeTitle>
        <SafeMeta as="p" className="mt-3 max-w-[20rem] text-sm leading-relaxed text-white/56">אנשים, תפקידים והרשאות. זהות ברורה לפני כלי ניהול.</SafeMeta>
      </HeroSurface>
      <section dir="rtl" className={v6Cx(v6Lovable.card, "rounded-2xl p-4 text-start")}>
      <div className="mb-3 px-1 text-start"><SafeMeta as="p" className={v6Lovable.eyebrow}>חיפוש וסינון</SafeMeta></div>
      <div className="space-y-2.5">
        <FormField label="חיפוש" value={query} onChange={setQuery} placeholder="חיפוש לפי שם או טלפון" />
        <div className="overflow-x-auto pb-1 no-scrollbar">
          <SegmentedControl value={filterOptions.find((item) => item.id === filter)?.label ?? "כולם"} options={filterOptions.map((item) => item.label)} onChange={(value) => setFilter(filterOptions.find((item) => item.label === value)?.id ?? "all")} />
        </div>
        <div className="grid gap-2 sm:grid-cols-4">
          <SelectField label="קבוצה" value={groupFilter} onChange={setGroupFilter}><option value="all" className="bg-zinc-950">כל הקבוצות</option>{db.groups.map((group) => <option key={group.id} value={group.id} className="bg-zinc-950">{group.name}</option>)}</SelectField>
          <SelectField label="גיל" value={ageFilter} onChange={setAgeFilter}><option value="all" className="bg-zinc-950">כל הגילים</option>{ageGroups.map((age) => <option key={age} value={age} className="bg-zinc-950">{age}</option>)}</SelectField>
          <SelectField label="סגנון" value={styleFilter} onChange={setStyleFilter}><option value="all" className="bg-zinc-950">כל הסגנונות</option>{danceStyles.map((style) => <option key={style} value={style} className="bg-zinc-950">{style}</option>)}</SelectField>
          <SelectField label="פעילות" value={statusFilter} onChange={setStatusFilter}><option value="all" className="bg-zinc-950">כולם</option><option value="active" className="bg-zinc-950">פעילים</option><option value="inactive" className="bg-zinc-950">לא פעילים</option></SelectField>
        </div>
      </div>
      </section>
      <V6SheetController activeSheet={activeSheet} title={selected?.name ?? "משתמש חדש"} onClose={() => setActiveSheet(null)}>{editor}</V6SheetController>
      <div className="grid gap-3">
        <LovableEditorialPanel
          kicker={<><BidiNumber>{filteredUsers.length}</BidiNumber> מוצגים</>}
          title="אנשי הסטודיו"
        >
          <div className="space-y-4">{groupedUsers.map((group) => <div key={group.role} className="space-y-2.5"><SafeMeta as="p" className={v6Cx(v6Lovable.eyebrow, "px-1") }>{roleLabel[group.role]}</SafeMeta>{group.users.map((user) => <button key={user.id} onClick={() => openUserSheet(user)} className="w-full"><UserCard user={user} db={db} active={selected?.id === user.id} /></button>)}</div>)}</div>
        </LovableEditorialPanel>
      </div>
    </div>
  );
}

function UserCard({ user, db, active }: { user: V6User; db: ReturnType<typeof useV6>["db"]; active?: boolean }) {
  const tone = toneForRole(user.role);
  const groups = db.groups.filter((group) => user.groupIds.includes(group.id));
  const linkedChildren = user.role === "parent" ? db.users.filter((student) => user.linkedStudentIds.includes(student.id)).map((student) => student.name).join(", ") : "";
  const linkedParents = user.role === "student" ? db.users.filter((parent) => parent.role === "parent" && (parent.linkedStudentIds.includes(user.id) || user.linkedParentIds?.includes(parent.id))).map((parent) => parent.name).join(", ") : "";
  const styles = [...new Set([...(user.danceStyleIds ?? []), ...groups.map((group) => group.danceStyle ?? group.style)])].join(", ");
  const meta = user.role === "parent"
    ? `ילדים: ${linkedChildren || "לא שויך"}`
    : user.role === "teacher"
      ? `${styles || "ללא סגנון"} · ${groups.map((group) => group.name).join(", ") || "ללא קבוצות"}`
      : user.role === "student"
        ? `${groups.map((group) => group.name).join(", ") || "ללא קבוצה"} · ${user.ageGroup ?? "גיל לא צוין"} · הורים: ${linkedParents || "לא שויך"}`
        : user.responsibility || "הרשאות וניהול";
  return (
    <div dir="rtl" className={v6Cx("lk-safe-row flex items-start gap-3 rounded-[30px] border px-3 py-3 text-start shadow-[inset_0_1px_0_rgba(255,247,223,0.030)] transition active:scale-[0.99]", active ? "border-[#f4d58d]/18 bg-[#f4d58d]/10 text-[#fff7df]" : "border-[#f4d58d]/[0.045] bg-white/[0.014] text-white hover:bg-white/[0.024]")}>
      <span className={v6Cx("grid h-11 w-11 shrink-0 place-items-center rounded-[20px] border border-white/[0.035] font-semibold shadow-[inset_0_1px_0_rgba(255,247,223,0.045)]", active ? "bg-[#f4d58d]/14 text-[#fff7df]" : v6Cx(v6Tone[tone].soft, v6Tone[tone].text))}>{user.name.slice(0, 1)}</span>
      <span className="min-w-0 flex-1">
        <SafeTitle as="span" className="block text-[15px] font-semibold tracking-[-0.024em]">{user.name}</SafeTitle>
        <span className={v6Cx("lk-safe-meta mt-1 block text-[12px] font-medium", active ? "text-white/68" : "text-white/46")}>טלפון: <BidiNumber>{user.phone}</BidiNumber></span>
        <SafeMeta as="span" className={v6Cx("mt-1 block text-[11px] font-medium", active ? "text-white/62" : "text-white/42")}>{meta}</SafeMeta>
      </span>
      <span className={v6Cx("max-w-[5.5rem] shrink-0 rounded-full border border-white/[0.045] px-2 py-1 text-center text-[10px] font-semibold leading-tight", active ? "bg-[#f4d58d]/10 text-white/72" : "bg-white/[0.022] text-white/48")}>{user.active ? roleLabel[user.role] : "לא פעיל"}</span>
      <DirectionalChevron className="opacity-35" />
    </div>
  );
}

function PrivateLessons({ user, show, back }: { user: V6User; show: (message: string) => void; back: () => void }) {
  const { db, dispatch } = useV6();
  const teachers = db.users.filter((u) => u.role === "teacher");
  const students = user.role === "student" ? [user] : db.users.filter((u) => u.role === "student");
  const [teacherId, setTeacherId] = useState(teachers[0]?.id ?? "");
  const [studentId, setStudentId] = useState(students[0]?.id ?? user.id);
  const privateLessons = selectV6PrivateLessonsForActor(db, user);
  const coordination = computeV6PrivateLessonCoordination(db);
  const canRequest = Boolean(studentId && teacherId);
  function request(duration: 30 | 45) {
    if (!canRequest) {
      show("צריך לבחור תלמיד/ה ומורה לפני שליחת בקשה");
      return;
    }
    dispatch({ type: "request_private_lesson", actor: user, studentId, teacherId, duration });
    show("בקשה נשלחה");
  }
  return (
    <div className="space-y-4">
      <BackHeader title="שיעורים פרטיים" back={back} />
      <HeroSurface tone="shop" className="min-h-[214px] p-5">
        <V6StatusBadge tone={coordination.needsAttention ? "urgent" : "shop"}>{coordination.needsAttention ? "דורש תיאום" : "זמין לתיאום"}</V6StatusBadge>
        <SafeTitle as="h2" className="mt-4 max-w-[18rem] text-xl font-semibold leading-[1.15] tracking-tight">תיאום פרטי, נקי</SafeTitle>
        <SafeMeta as="p" className="mt-4 max-w-[20rem] text-sm leading-relaxed text-white/58">בקשה קצרה, מורה נכון, מועד מוצע. בלי טופס שמרגיש כבד.</SafeMeta>
      </HeroSurface>
      <LovableEditorialPanel kicker="קונסיירז׳ סטודיו" title="בקשת שיעור">
        <div className="flex flex-col gap-3">
          <div className={v6Cx(v6LovableForm.groupGrid, "sm:grid-cols-2")}>
            <SelectField label="תלמיד/ה" value={studentId} onChange={setStudentId}>{students.map((s) => <option key={s.id} value={s.id} className="bg-zinc-950">{s.name}</option>)}</SelectField>
            <SelectField label="מורה" value={teacherId} onChange={setTeacherId}>{teachers.map((t) => <option key={t.id} value={t.id} className="bg-zinc-950">{t.name}</option>)}</SelectField>
          </div>
          <div className="grid grid-cols-2 gap-2 [&>button]:w-full">
            <V6Button disabled={!canRequest} onClick={() => request(30)}><BidiNumber>30</BidiNumber> דקות</V6Button>
            <V6Button disabled={!canRequest} onClick={() => request(45)}><BidiNumber>45</BidiNumber> דקות</V6Button>
          </div>
          {!canRequest ? <SafeMeta as="p" className={v6Cx(v6LovableForm.helper, "text-amber-100/70")}>אין מספיק נתונים לשליחת בקשה. צריך תלמיד/ה ומורה פעילים.</SafeMeta> : null}
        </div>
      </LovableEditorialPanel>
      <LovableEditorialPanel kicker="תיאום ותשלום" title="בקשות פעילות">
        <div className="flex flex-col gap-2">
          {privateLessons.length ? privateLessons.map((item) => (
            <article key={item.id} className={v6Cx(v6Lovable.card, "rounded-2xl p-4 text-start")}>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <SafeTitle as="h2" className="text-base font-semibold tracking-tight text-white/92">{db.users.find((u) => u.id === item.studentId)?.name} · {item.duration} דקות</SafeTitle>
                  <SafeMeta as="p" className="mt-1 text-[12px] leading-relaxed text-white/52"><BidiNumber>₪ {item.price}</BidiNumber> · {item.selectedSlot ?? item.suggestedSlots[0] ?? "מועד טרם נקבע"}</SafeMeta>
                </div>
                <V6StatusBadge tone={item.status === "paid" ? "success" : item.status === "requested" ? "urgent" : "shop"}>{item.status === "paid" ? "שולם" : item.status === "requested" ? "מבוקש" : "בתיאום"}</V6StatusBadge>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3 [&>button]:w-full">
                <V6Button variant="ghost" onClick={() => { dispatch({ type: "suggest_private_lesson", actor: user, requestId: item.id, slot: "יום שני 17:00" }); show("מועד הוצע"); }}>הצע מועד</V6Button>
                <V6Button variant="ghost" onClick={() => { dispatch({ type: "select_private_lesson", actor: user, requestId: item.id, slot: "יום שני 17:00" }); show("מועד נבחר"); }}>בחר מועד</V6Button>
                <V6Button onClick={() => { dispatch({ type: "mark_private_lesson_paid", actor: user, requestId: item.id }); show("שולם"); }}>שולם</V6Button>
              </div>
            </article>
          )) : <div className={v6Cx(v6Lovable.card, "rounded-2xl p-4 text-center")}><SafeMeta as="p" className={v6LovableForm.helper}>אין בקשות שיעור פרטי פתוחות כרגע.</SafeMeta></div>}
        </div>
      </LovableEditorialPanel>
    </div>
  );
}

function MediaScreen({ user, show, back }: { user: V6User; show: (message: string) => void; back: () => void }) {
  const { db, dispatch } = useV6();
  const input = useRef<HTMLInputElement>(null);
  const [activeSheet, setActiveSheet] = useState<V6ActiveSheet | null>(null);
  const [title, setTitle] = useState("חומר חדש");
  const [groupId, setGroupId] = useState(user.groupIds[0] ?? db.groups[0]?.id ?? "");
  const [mediaTarget, setMediaTarget] = useState<"group" | "event">("group");
  const [eventId, setEventId] = useState(db.events[0]?.id ?? "");
  const [uploading, setUploading] = useState(false);
  const [groupFilter, setGroupFilter] = useState("all");
  const [uploaderFilter, setUploaderFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const groups = user.role === "teacher" ? db.groups.filter((g) => user.groupIds.includes(g.id)) : db.groups;
  const academyId = academyIdFor(user);
  const actorRef = useRef(user);
  const today = new Date().toISOString().slice(0, 10);
  const media = selectV6MediaForActor(db, user).filter((item) => {
    if (groupFilter !== "all" && (item.linkedGroupId ?? item.groupId) !== groupFilter) return false;
    if (uploaderFilter !== "all" && item.uploadedByUserId !== uploaderFilter) return false;
    if (dateFilter && item.lessonDate !== dateFilter) return false;
    if (eventFilter !== "all" && (item.linkedEventId ?? item.eventId) !== eventFilter) return false;
    return true;
  });
  const uploaderOptions = uniqueBy(media.map((item) => ({ id: item.uploadedByUserId, name: item.uploaderName ?? db.users.find((dbUser) => dbUser.id === item.uploadedByUserId)?.name ?? item.uploadedByUserId })), (item) => item.id);

  useEffect(() => {
    actorRef.current = user;
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    async function loadMedia() {
      try {
        const response = await fetch(`/api/media/list?academyId=${encodeURIComponent(academyId)}`, { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { ok: true; mediaItems: MediaApiItem[] } | { ok: false };
        if (!payload.ok || cancelled) return;
        payload.mediaItems.forEach((item) => {
          dispatch({ type: "save_media", actor: actorRef.current, media: mapApiMediaToV6(item) });
        });
      } catch {
        // The local/demo gallery remains usable when production media listing is unavailable.
      }
    }
    void loadMedia();
    return () => {
      cancelled = true;
    };
  }, [academyId, dispatch]);

  async function save(file?: File) {
    if (mediaTarget === "event" && !eventId) {
      show("צריך לבחור אירוע לפני העלאת מדיה");
      return;
    }
    if (!file) {
      const media: V6MediaItem = { id: nextV6ClientId("media"), studioId: user.studioId, academyId, uploadedByUserId: user.id, uploaderName: user.name, title, fileName: "metadata-only", mediaType: "image", linkedGroupId: mediaTarget === "group" ? groupId : undefined, linkedEventId: mediaTarget === "event" ? eventId : undefined, visibility: mediaTarget === "event" ? "event" : "group", createdAt: new Date().toISOString() };
      dispatch({ type: "save_media", actor: user, media });
      setActiveSheet(null);
      show("נשמרה מטאדאטה מקומית בלבד");
      return;
    }
    setUploading(true);
    try {
      const lesson = db.lessons.find((item) => item.groupId === groupId);
      const uploaded = await uploadMediaToR2({
        file,
        user,
        academyId,
        title,
        visibility: mediaTarget === "event" ? "event_public" : "group",
        groupId: mediaTarget === "group" ? groupId : undefined,
        classId: mediaTarget === "group" ? (lesson?.id ?? groupId) : undefined,
        lessonDate: mediaTarget === "group" ? today : undefined,
        eventId: mediaTarget === "event" ? eventId : undefined,
        tags: ["gallery", mediaTarget]
      });
      dispatch({ type: "save_media", actor: user, media: uploaded.media });
      setActiveSheet(null);
      show(uploaded.persisted ? "המדיה עלתה ל־R2 ונשמרה בגלריה" : "תצוגה מקומית בלבד; R2 לא מוגדר");
    } catch (error) {
      show(error instanceof Error ? error.message : "העלאת המדיה נכשלה");
    } finally {
      setUploading(false);
    }
  }
  const mediaEditor = (
    <div className="flex flex-col gap-3">
      <div className={v6Cx(v6Lovable.card, "rounded-2xl p-4 text-start")}>
        <SafeMeta as="p" className={v6Lovable.eyebrow}>העלאת מדיה</SafeMeta>
        <SafeTitle as="h3" className="mt-1.5 text-base font-semibold tracking-tight text-white/92">{title || "חומר חדש"}</SafeTitle>
        <SafeMeta as="p" className={v6Cx("mt-1.5", v6LovableForm.helper)}>במצב אמיתי הקובץ עולה ל־R2 והמטאדאטה נשמרת ב־Supabase. בלי R2 מוצגת תצוגת דמו בלבד.</SafeMeta>
      </div>
      <div className={v6LovableForm.group}>
        <FormField label="כותרת" value={title} onChange={setTitle} />
        <SelectField label="יעד" value={mediaTarget} onChange={(next) => setMediaTarget(next as "group" | "event")}><option value="group" className="bg-zinc-950">מדיית שיעור / קבוצה</option><option value="event" className="bg-zinc-950">מדיית אירוע</option></SelectField>
        {mediaTarget === "group" ? <SelectField label="קבוצה" value={groupId} onChange={setGroupId}>{groups.map((g) => <option key={g.id} value={g.id} className="bg-zinc-950">{g.name}</option>)}</SelectField> : null}
        {mediaTarget === "event" ? <SelectField label="אירוע" value={eventId} onChange={setEventId}>{db.events.map((event) => <option key={event.id} value={event.id} className="bg-zinc-950">{event.title}</option>)}</SelectField> : null}
      </div>
      <input ref={input} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => void save(e.target.files?.[0])} />
      <div className="grid grid-cols-2 gap-2 [&>button]:w-full">
        <V6Button disabled={uploading} onClick={() => input.current?.click()}><Upload size={16} /> {uploading ? "מעלה…" : "בחירת קובץ"}</V6Button>
        <V6Button disabled={uploading} variant="ghost" onClick={() => void save()}>שמירת מטאדאטה</V6Button>
      </div>
      <SafeMeta as="p" className={v6LovableForm.helper}>תצוגת דמו אינה נחשבת שמירה קבועה. שמירה אמיתית דורשת סשן אקדמיה מאומת ו־R2 מוגדרים בשרת.</SafeMeta>
      <SheetActions>
        <V6Button disabled={uploading} onClick={() => void save()}>שמירת מטאדאטה</V6Button>
        <V6Button variant="ghost" onClick={() => setActiveSheet(null)}>ביטול</V6Button>
      </SheetActions>
    </div>
  );
  return (
    <div className="space-y-4">
      <BackHeader title="מדיה וגלריה" back={back} action={<V6Button onClick={() => setActiveSheet({ type: "upload-media", mode: "add" })}>העלאה</V6Button>} />
      <HeroSurface tone="modern" className="min-h-[220px] p-5">
        <div className="pointer-events-none absolute left-5 top-5 h-24 w-20 rotate-3 rounded-[30px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(34,211,238,0.06),rgba(61,16,39,0.14))]" />
        <div className="pointer-events-none absolute left-11 bottom-8 h-14 w-24 rounded-full bg-cyan-100/8 blur-2xl" />
        <V6StatusBadge tone="modern">גלריה</V6StatusBadge>
        <SafeTitle as="h2" className="mt-4 max-w-[18rem] text-xl font-semibold leading-[1.15] tracking-tight">רגעי חזרה, במה וקהילה</SafeTitle>
        <SafeMeta as="p" className="mt-4 max-w-[20rem] text-sm leading-relaxed text-white/64">תצוגת מדיה מטופלת כמו אלבום סטודיו, עם הרשאות וקבוצות מאחורי הקלעים.</SafeMeta>
      </HeroSurface>
      <V6SheetController activeSheet={activeSheet} title="העלאת מדיה" onClose={() => setActiveSheet(null)}>{mediaEditor}</V6SheetController>
      <LovableActionRow icon={ImagePlus} title="העלאת מדיה" subtitle="תמונה, וידאו או מטאדאטה" tone="modern" onClick={() => setActiveSheet({ type: "upload-media", mode: "add" })} />
      <div className={v6Cx(v6LovableForm.groupGrid, "sm:grid-cols-4")}>
        <SelectField label="קבוצה" value={groupFilter} onChange={setGroupFilter}><option value="all" className="bg-zinc-950">כל הקבוצות</option>{db.groups.map((group) => <option key={group.id} value={group.id} className="bg-zinc-950">{group.name}</option>)}</SelectField>
        <SelectField label="אירוע" value={eventFilter} onChange={setEventFilter}><option value="all" className="bg-zinc-950">כל האירועים</option>{db.events.map((event) => <option key={event.id} value={event.id} className="bg-zinc-950">{event.title}</option>)}</SelectField>
        <SelectField label="מעלה" value={uploaderFilter} onChange={setUploaderFilter}><option value="all" className="bg-zinc-950">כולם</option>{uploaderOptions.map((item) => <option key={item.id} value={item.id} className="bg-zinc-950">{item.name}</option>)}</SelectField>
        <FormField label="תאריך שיעור" value={dateFilter} onChange={setDateFilter} type="date" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {selectV6GalleryCollectionsForActor(db, user).map((collection) => {
          const groupNames = db.groups.filter((group) => collection.groupIds.includes(group.id)).map((group) => group.name).join(", ");
          const event = collection.eventId ? db.events.find((item) => item.id === collection.eventId) : undefined;
          return (
            <Surface key={collection.id} tone={collection.kind === "annual_show" ? "repertoire" : collection.kind === "competition" ? "urgent" : "modern"} className="p-4">
              <div className="flex items-start gap-3 text-start">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-100/10 text-cyan-50"><Images size={17} strokeWidth={1.8} /></span>
                <div className="min-w-0 flex-1">
                  <SafeTitle as="h2" className="text-base font-semibold tracking-tight text-white/92">{collection.title}</SafeTitle>
                  <SafeMeta as="p" className="mt-1 text-xs text-white/48">{event ? `${eventTypeLabel[event.type]} · ${event.date}` : groupNames || collection.schoolYear}</SafeMeta>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <V6StatusBadge tone="modern"><BidiNumber>{collection.itemIds.length}</BidiNumber> פריטים</V6StatusBadge>
                    <V6StatusBadge tone={collection.visibility === "management" ? "admin" : "studio"}>{collection.visibility === "parents" ? "הורים" : collection.visibility === "students" ? "תלמידים" : collection.visibility === "staff" ? "צוות" : "ניהול"}</V6StatusBadge>
                  </div>
                </div>
              </div>
            </Surface>
          );
        })}
      </div>
      {media.map((item) => (
        <Surface key={item.id} tone="modern" className="overflow-hidden p-0">
          {item.localPreviewUrl ? (
            item.mediaType === "video" ? <video src={item.localPreviewUrl} controls className="max-h-72 w-full bg-black object-contain" /> : <div role="img" aria-label={item.title} className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${item.localPreviewUrl})` }} />
          ) : null}
          <SurfaceContent className="p-4 text-start">
            <SafeTitle as="h2" className="font-bold">{item.title}</SafeTitle>
            <SafeMeta as="p" className="mt-1 text-sm text-white/55">{item.fileName} · {item.r2Key ? "R2" : "local/demo"}</SafeMeta>
          </SurfaceContent>
        </Surface>
      ))}
    </div>
  );
}

function CalendarScreen({ user, back }: { user: V6User; back: () => void }) {
  const { db } = useV6();
  const [typeFilter, setTypeFilter] = useState<V6CalendarEvent["type"] | "all">("all");
  const events = selectV6SchoolYearEvents(db, "2025-2026", user).filter((event) => typeFilter === "all" || event.type === typeFilter);
  const nextEvent = events.find((event) => event.date >= new Date().toISOString().slice(0, 10)) ?? events[0];
  const eventTypes = uniqueBy(["all", ...db.events.map((event) => event.type)], (item) => item);
  return (
    <div className="space-y-4">
      <BackHeader title="לוח שנה ותחרויות" back={back} />
      <HeroSurface tone="management" className="min-h-[230px] p-5">
        <V6StatusBadge tone="management">שנת סטודיו Sep-Jul</V6StatusBadge>
        <SafeTitle as="h2" className="mt-4 max-w-[20rem] text-xl font-semibold leading-[1.15] tracking-tight">לוח שנתי שמחזיק במה, חזרות ומשפחה</SafeTitle>
        <SafeMeta as="p" className="mt-4 max-w-[22rem] text-sm leading-relaxed text-white/62">{nextEvent ? `${nextEvent.title} · ${nextEvent.date}${nextEvent.startTime ? ` · ${nextEvent.startTime}` : ""}` : "אין אירועים להצגה."}</SafeMeta>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <InlineMetric tone="management" label="אירועים" value={<BidiNumber>{events.length}</BidiNumber>} meta="מסוננים" />
          <InlineMetric tone="urgent" label="לתשומת לב" value={<BidiNumber>{events.filter((event) => event.status === "needs_attention").length}</BidiNumber>} meta="מוכנות" />
          <InlineMetric tone="repertoire" label="מופעים" value={<BidiNumber>{events.filter((event) => event.type === "annual_show" || event.type === "competition").length}</BidiNumber>} meta="במה" />
        </div>
      </HeroSurface>
      <section dir="rtl" className={v6Cx(v6Lovable.card, "rounded-2xl p-4 text-start")}>
        <SafeMeta as="p" className={v6Cx(v6Lovable.eyebrow, "px-1") }>סינון לפי סוג אירוע</SafeMeta>
        <div className="mt-3"><SegmentedControl value={typeFilter === "all" ? "הכול" : eventTypeLabel[typeFilter]} options={eventTypes.map((type) => type === "all" ? "הכול" : eventTypeLabel[type as V6CalendarEvent["type"]])} onChange={(label) => setTypeFilter(label === "הכול" ? "all" : (Object.entries(eventTypeLabel).find(([, value]) => value === label)?.[0] as V6CalendarEvent["type"]) ?? "all")} /></div>
      </section>
      <div className="space-y-3">
        {events.map((event) => {
          const summary = selectV6EventOperatingSummary(db, event.id);
          const groupNames = db.groups.filter((group) => event.groupIds.includes(group.id)).map((group) => group.name).join(", ");
          const teacherNames = db.users.filter((teacher) => event.teacherIds.includes(teacher.id)).map((teacher) => teacher.name).join(", ");
          return (
            <Surface key={event.id} tone={event.type === "annual_show" ? "repertoire" : event.type === "competition" ? "urgent" : "management"} className="p-4">
              <div className="flex flex-col gap-3 text-start sm:flex-row sm:items-start">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[22px] bg-[#f4d58d]/10 text-[#fff7df]"><CalendarDays size={18} /></span>
                <div className="min-w-0 flex-1">
                  <div className="lk-safe-badge-group">
                    <V6StatusBadge tone={eventStatusTone[event.status]}>{event.status === "needs_attention" ? "דורש טיפול" : event.status === "ready" ? "מוכן" : event.status === "completed" ? "הושלם" : "מתוכנן"}</V6StatusBadge>
                    <V6StatusBadge tone="management">{eventTypeLabel[event.type]}</V6StatusBadge>
                  </div>
                  <SafeTitle as="h2" className="mt-2 text-lg font-semibold leading-[1.2] tracking-tight">{event.title}</SafeTitle>
                  <SafeMeta as="p" className="mt-2 text-sm leading-relaxed text-white/56">{event.date}{event.startTime ? ` · ${event.startTime}` : ""} · {event.location ?? "מיקום יעודכן"} · {groupNames || "ללא קבוצות"}</SafeMeta>
                  <SafeMeta as="p" className="mt-1 text-xs text-white/42">צוות: {teacherNames || "טרם שויך"} · להביא: {event.whatToBring.join(", ") || "יעודכן בהמשך"}</SafeMeta>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <InlineMetric tone="repertoire" label="מוכנות" value={summary.averageReadiness ? <><BidiNumber>{summary.averageReadiness}</BidiNumber>%</> : "—"} meta={summary.nextAction} />
                    <InlineMetric tone="urgent" label="אישורים" value={<BidiNumber>{summary.missingApprovals}</BidiNumber>} meta="חסרים" />
                    <InlineMetric tone="management" label="משימות" value={<BidiNumber>{summary.openChecklist}</BidiNumber>} meta="פתוחות" />
                  </div>
                </div>
              </div>
            </Surface>
          );
        })}
      </div>
    </div>
  );
}

function LegacyScreen({ user, back }: { user: V6User; back: () => void }) {
  const { db } = useV6();
  const canSeeManagement = user.role === "management" || user.role === "super_admin";
  const achievements = db.achievements.filter((item) => canSeeManagement || item.visibility !== "management");
  const legacy = db.legacyEntries.filter((item) => canSeeManagement || item.visibility !== "management");
  const collections = selectV6GalleryCollectionsForActor(db, user).filter((collection) => collection.kind === "achievement_archive" || collection.kind === "annual_show" || collection.kind === "competition");
  return (
    <div className="space-y-4">
      <BackHeader title="מורשת והישגים" back={back} />
      <HeroSurface tone="repertoire" className="min-h-[225px] p-5">
        <V6StatusBadge tone="repertoire">ארכיון מנוהל</V6StatusBadge>
        <SafeTitle as="h2" className="mt-4 max-w-[19rem] text-xl font-semibold leading-[1.15] tracking-tight">זיכרון סטודיו בלי המצאות</SafeTitle>
        <SafeMeta as="p" className="mt-4 max-w-[22rem] text-sm leading-relaxed text-white/62">הישגים, מופעים ותחרויות נשמרים כרשומות שההנהלה מזינה ומאשרת ידנית.</SafeMeta>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <InlineMetric tone="repertoire" label="הישגים" value={<BidiNumber>{achievements.length}</BidiNumber>} meta="מובנים" />
          <InlineMetric tone="modern" label="אלבומים" value={<BidiNumber>{collections.length}</BidiNumber>} meta="ארכיון" />
          <InlineMetric tone="management" label="רשומות" value={<BidiNumber>{legacy.length}</BidiNumber>} meta="מורשת" />
        </div>
      </HeroSurface>
      <LovableEditorialPanel kicker="ניהול ידני" title="הישגים ומורשת">
        <div className="space-y-3">
          {[...achievements, ...legacy].map((item) => {
            const groupNames = db.groups.filter((group) => item.groupIds.includes(group.id)).map((group) => group.name).join(", ");
            const date = "date" in item ? item.date : item.schoolYear;
            const description = "description" in item ? item.description : item.summary;
            return (
              <article key={item.id} className={v6Cx(v6Lovable.card, "rounded-2xl p-4 text-start")}>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-100/10 text-amber-50"><Trophy size={17} strokeWidth={1.8} /></span>
                  <div className="min-w-0 flex-1">
                    <SafeTitle as="h3" className="text-base font-semibold tracking-tight text-white/92">{item.title}</SafeTitle>
                    <SafeMeta as="p" className="mt-1 text-sm leading-relaxed text-white/52">{description}</SafeMeta>
                    <SafeMeta as="p" className="mt-2 text-[12px] text-white/40">{date || "תאריך יוזן"} · {groupNames || "ללא שיוך קבוצה"} · {item.visibility === "management" ? "ניהול בלבד" : "גלוי לפי הרשאות"}</SafeMeta>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </LovableEditorialPanel>
    </div>
  );
}

function DatabaseScreen({ show, back }: { show: (message: string) => void; back: () => void }) {
  const { db, exportDatabase, importDatabase } = useV6();
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-4">
      <BackHeader title="מסד נתונים" back={back} />
      <HeroSurface tone="admin" className="min-h-[220px] p-5">
        <div className="pointer-events-none absolute left-5 top-5 h-28 w-24 rounded-[38px] border border-violet-100/10 bg-[linear-gradient(145deg,rgba(216,210,255,0.10),rgba(255,255,255,0.04),rgba(0,0,0,0.20))]" />
        <V6StatusBadge tone="admin">ניהול</V6StatusBadge>
        <SafeTitle as="h2" className="mt-4 max-w-[19rem] text-xl font-semibold leading-[1.15] tracking-tight">מסד הנתונים</SafeTitle>
        <SafeMeta as="p" className="mt-4 max-w-[21rem] text-sm leading-relaxed text-white/62">ייצוא, ייבוא וגיבוי של הנתונים במקום אחד וברור.</SafeMeta>
      </HeroSurface>
      <div className="grid gap-2 sm:grid-cols-3"><MiniSummary icon={Users} tone="management" label="משתמשים" title={`${db.users.length}`} meta="במאגר" /><MiniSummary icon={Bell} tone="modern" label="התראות" title={`${db.notifications.length}`} meta="פעילות" /><MiniSummary icon={Database} tone="admin" label="יומן" title={`${db.auditLog.length}`} meta="פעולות" /></div>
      <Surface tone="admin" className="space-y-3 p-4"><p className="text-right text-sm leading-relaxed text-white/58">אפשר לייצא גיבוי או לייבא קובץ נתונים מעודכן.</p><input ref={ref} type="file" accept="application/json" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const result = await importDatabase(file); show(result.ok === true ? "המסד יובא" : result.reason); }} /><div className="flex flex-wrap gap-2 [&>button]:flex-1"><V6Button onClick={exportDatabase}><Download size={16} /> ייצוא</V6Button><V6Button variant="ghost" onClick={() => ref.current?.click()}><Upload size={16} /> ייבוא</V6Button></div></Surface>
    </div>
  );
}

function TextsScreen({ actor, show, back }: { actor: V6User; show: (message: string) => void; back: () => void }) {
  const { db, dispatch } = useV6();
  const [title, setTitle] = useState(db.editableTexts.loginTitle ?? "");
  const [prompt] = useState(db.aiPrompts.super_admin ?? "");
  return (
    <div className="space-y-4">
      <BackHeader title="טקסטים והצעות" back={back} />
      <HeroSurface tone="admin" className="min-h-[205px] p-5">
        <V6StatusBadge tone="admin">שפה ברורה</V6StatusBadge>
        <SafeTitle as="h2" className="mt-4 max-w-[18rem] text-xl font-semibold leading-[1.15] tracking-tight">הקול של הסטודיו נשמר כאן</SafeTitle>
        <SafeMeta as="p" className="mt-3 max-w-[20rem] text-sm leading-relaxed text-white/60">כאן עורכים טקסטים חשובים שמופיעים באפליקציה.</SafeMeta>
      </HeroSurface>
      <LovableEditorialPanel kicker="תוכן ניתן לעריכה" title="טקסט כניסה">
        <div className="flex flex-col gap-3">
          <FormField label="כותרת כניסה" value={title} onChange={setTitle} />
          <V6Button onClick={() => { dispatch({ type: "update_text", actor, key: "loginTitle", value: title }); show("הטקסט נשמר"); }}>שמירה</V6Button>
        </div>
      </LovableEditorialPanel>
      <LovableEditorialPanel kicker="אישור אנושי" title="תבנית הצעה">
        <label className="block text-right">
          <span className={v6LovableForm.label}>תבנית למנהל האפליקציה</span>
          <textarea value={prompt} readOnly className={v6Cx("mt-1.5 min-h-32 resize-none", v6LovableForm.field, "text-right text-[15px] leading-relaxed text-white/82")} />
        </label>
        <SafeMeta as="p" className={v6Cx("mt-3", v6LovableForm.helper)}>תבניות הצעה מוצגות לצפייה בלבד בשלב זה. פרסום תוכן דורש אישור אנושי.</SafeMeta>
        <div className="mt-3"><V6Button variant="ghost" onClick={() => show("עריכת תבניות הצעה לא מופעלת ב־V6 הנוכחי")}>למה לא נשמר?</V6Button></div>
      </LovableEditorialPanel>
    </div>
  );
}

function FlagsScreen({ actor, show, back }: { actor: V6User; show: (message: string) => void; back: () => void }) {
  const { db, dispatch } = useV6();
  return (
    <div className="space-y-4">
      <BackHeader title="אפשרויות" back={back} />
      <HeroSurface tone="admin" className="min-h-[205px] p-5">
        <V6StatusBadge tone="admin">הפעלה וכיבוי</V6StatusBadge>
        <SafeTitle as="h2" className="mt-4 max-w-[18rem] text-xl font-semibold leading-[1.15] tracking-tight">אפשרויות שנפתחות בזהירות</SafeTitle>
        <SafeMeta as="p" className="mt-3 max-w-[20rem] text-sm leading-relaxed text-white/60">כל שינוי נשמר, כדי שיהיה ברור מה הופעל ומתי.</SafeMeta>
      </HeroSurface>
      <LovableEditorialPanel kicker="כל שינוי נרשם" title="אפשרויות פעילות">
        <div className="flex flex-col gap-2">
          {Object.entries(db.featureFlags).map(([key, value]) => (
            <div key={key} className={v6Cx(v6Lovable.card, "lk-safe-row flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-right")}>
              <button
                type="button"
                onClick={() => { dispatch({ type: "update_flags", actor, flags: { [key]: !value } }); show("האפשרות עודכנה"); }}
                className={value ? v6LovableForm.chipActive : v6LovableForm.chip}
              >
                {value ? "פעיל" : "כבוי"}
              </button>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-white/90">{key}</span>
            </div>
          ))}
        </div>
      </LovableEditorialPanel>
    </div>
  );
}

function BrandingScreen({ show, back }: { show: (message: string) => void; back: () => void }) {
  return <div className="space-y-4"><BackHeader title="מיתוג" back={back} /><HeroSurface tone="admin" className="min-h-[190px] p-5"><V6StatusBadge tone="admin">זהות סטודיו</V6StatusBadge><SafeTitle as="h2" className="mt-4 max-w-[18rem] text-xl font-semibold leading-[1.15] tracking-tight">השם והמראה של הסטודיו</SafeTitle><SafeMeta as="p" className="mt-3 max-w-[20rem] text-sm leading-relaxed text-white/60">שם, צבעים ושפה נשמרים במקום אחד.</SafeMeta></HeroSurface><Surface tone="admin"><SafeMeta as="p" className="text-sm text-white/58">כאן יופיעו פרטי המיתוג של הסטודיו.</SafeMeta><div className="mt-3"><V6Button onClick={() => show("מיתוג מוכן לעריכה")}>בדיקת מיתוג</V6Button></div></Surface></div>;
}

function AuditScreen({ back }: { back: () => void }) {
  const { db } = useV6();
  const summary = summarizeV6Audit(db.auditLog);
  return <div className="space-y-4"><BackHeader title="יומן פעולות" back={back} /><HeroSurface tone="admin" className="min-h-[205px] p-5"><V6StatusBadge tone={summary.sensitive ? "urgent" : "admin"}>{summary.sensitive ? "פעולות חשובות" : "יומן רגוע"}</V6StatusBadge><SafeTitle as="h2" className="mt-4 max-w-[18rem] text-xl font-semibold leading-[1.15] tracking-tight">מה השתנה ומתי</SafeTitle><SafeMeta as="p" className="mt-3 max-w-[20rem] text-sm leading-relaxed text-white/60">רשימה קצרה וברורה של פעולות חשובות באפליקציה.</SafeMeta></HeroSurface><div className="grid grid-cols-2 gap-2"><MiniSummary icon={ClipboardList} tone="management" label="פעולות" title={`${summary.total}`} meta="נרשמו" /><MiniSummary icon={Shield} tone="urgent" label="חשובות" title={`${summary.sensitive}`} meta="למעקב" /></div><LovableEditorialPanel kicker="מעקב שינויים" title="יומן פעולות"><div className="flex flex-col gap-1.5">{db.auditLog.map((item) => <V6FeedRow key={item.id} icon={Shield} title={item.action} body={`${item.actorName} · ${item.target}`} meta={new Date(item.createdAt).toLocaleDateString("he-IL")} tone="management" />)}</div></LovableEditorialPanel></div>;
}

function SystemScreen({ back }: { back: () => void }) {
  const { db, sync } = useV6();
  const issues = selectV6SystemIssues(db);
  const health = computeV6ManagementHealth(db);
  return <div className="space-y-4"><BackHeader title="פתיחה וסנכרון" back={back} /><HeroSurface tone={issues.length ? "urgent" : "studio"} className="p-5"><V6StatusBadge tone={issues.length ? "urgent" : "success"}>{issues.length ? "דורש בדיקה" : "תקין"}</V6StatusBadge><SafeTitle as="h2" className="mt-4 text-xl font-semibold leading-[1.15] tracking-tight">{health.summary}</SafeTitle><SafeMeta as="p" className="mt-4 text-sm leading-relaxed text-white/64">פתיחה, נתונים וסנכרון מוצגים כאן בצורה פשוטה.</SafeMeta></HeroSurface><div className="grid gap-2 sm:grid-cols-3"><MiniSummary icon={Check} tone="studio" label="פתיחה" title="מיידית" meta={sync} /><MiniSummary icon={Database} tone="admin" label="גרסה" title={`V${db.version}`} meta="נתונים" /><MiniSummary icon={HeartPulse} tone={issues.length ? "urgent" : "modern"} label="בדיקות" title={issues.length ? `${issues.length} לבדיקה` : "תקין"} meta={issues.length ? "צריך לבדוק" : "ללא חסימות"} /></div><LovableEditorialPanel kicker="מעקב יומי" title="בדיקות"><div className="flex flex-col gap-1.5">{issues.length ? issues.map((issue) => <V6FeedRow key={issue.id} icon={HeartPulse} title={issue.title} body={issue.body} meta={issue.severity === "critical" ? "חשוב" : "בדיקה"} tone={issue.severity === "critical" ? "urgent" : "management"} />) : <V6FeedRow icon={CheckCircle2} title="אין חסימות פעילות" body="האפליקציה מוכנה לפתיחה ושימוש יומי." meta="תקין" tone="studio" />}</div></LovableEditorialPanel></div>;
}

function integrationTone(status: IntegrationHealthItem["statusHe"]): V6Tone {
  if (status === "מחובר") return "success";
  if (status === "בדיקה נכשלה") return "urgent";
  if (status === "מצב בדיקה") return "shop";
  if (status === "במעקב") return "management";
  return "admin";
}

function IntegrationHealthScreen({ user, back }: { user: V6User; back: () => void }) {
  const [report, setReport] = useState<IntegrationHealthReport | null>(null);
  const [error, setError] = useState("");
  const pushSupported = typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/integrations/health", {
      headers: {
        "x-lk-actor-role": user.role,
        "x-lk-dev-health": process.env.NODE_ENV !== "production" ? "1" : "0"
      }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("health_failed");
        return res.json() as Promise<{ report: IntegrationHealthReport }>;
      })
      .then((data) => {
        if (!cancelled) setReport(data.report);
      })
      .catch(() => {
        if (!cancelled) setError("בדיקה נכשלה");
      });
    return () => {
      cancelled = true;
    };
  }, [user.role]);

  if (user.role !== "super_admin") {
    return <div className="space-y-4"><BackHeader title="חיבורים" back={back} /><Surface tone="admin"><SafeMeta as="p" className="text-sm text-white/58">המסך זמין למנהל האפליקציה בלבד.</SafeMeta></Surface></div>;
  }

  const items = report?.items ?? [];

  return (
    <div className="space-y-4">
      <BackHeader title="חיבורים" back={back} />
      <HeroSurface tone="admin" className="min-h-[210px] p-5">
        <V6StatusBadge tone={error ? "urgent" : "admin"}>{error || "בדיקה שקטה"}</V6StatusBadge>
        <SafeTitle as="h2" className="mt-4 max-w-[19rem] text-xl font-semibold leading-[1.15] tracking-tight">מצב החיבורים</SafeTitle>
        <SafeMeta as="p" className="mt-4 max-w-[21rem] text-sm leading-relaxed text-white/62">תצוגה למנהל האפליקציה בלבד. אין כאן סודות, רק מצב חיבור פשוט.</SafeMeta>
      </HeroSurface>
      <div className="flex flex-col gap-2">
        {items.length ? items.map((item) => (
          <article key={item.id} className={v6Cx(v6Lovable.card, "flex items-start justify-between gap-3 rounded-2xl p-4 text-start")}>
            <div className="min-w-0 flex-1">
              <SafeTitle as="h3" className="text-sm font-semibold tracking-tight text-white/90">{item.labelHe}</SafeTitle>
              <SafeMeta as="p" className="mt-1 text-[12px] leading-relaxed text-white/48">{item.detailHe}</SafeMeta>
            </div>
            <V6StatusBadge tone={integrationTone(item.statusHe)}>{item.statusHe}</V6StatusBadge>
          </article>
        )) : <V6FeedRow icon={HeartPulse} title={error || "בודק חיבורים"} body="הסטטוסים יופיעו כאן בעוד רגע." meta="בדיקה" tone={error ? "urgent" : "admin"} />}
      </div>
      <LovableEditorialPanel
        kicker="Push בדפדפן הזה"
        title={pushSupported ? "מחובר" : "חסר"}
        description="בקשת הרשאה תופעל רק מפעולה יזומה, לא בפתיחת האפליקציה."
        trailing={<V6StatusBadge tone={pushSupported ? "success" : "admin"}>{pushSupported ? "מחובר" : "חסר"}</V6StatusBadge>}
      />
      {report?.latestErrors.length ? <LovableEditorialPanel kicker="חיבורים" title="שגיאות אחרונות"><div className="flex flex-col gap-1.5">{report.latestErrors.map((item) => <V6FeedRow key={item} icon={Shield} title="בדיקה נכשלה" body={item} meta="בדיקה" tone="urgent" />)}</div></LovableEditorialPanel> : null}
    </div>
  );
}

export function LKStudentSpaceV6() {
  return <V6AppProvider><Shell /></V6AppProvider>;
}
