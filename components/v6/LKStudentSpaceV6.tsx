"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  CreditCard,
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
  AISuggestionStack,
  AppShellFrame,
  BidiNumber,
  BottomNavDock,
  BottomSheet,
  Button as V6Button,
  DirectionalChevron,
  EditorialSection,
  FeedRow as V6FeedRow,
  FormField,
  HeroSurface,
  InlineMetric,
  OpenCluster,
  RtlText,
  SafeMeta,
  SafeTitle,
  SheetActions,
  SurfaceContent,
  SegmentedControl,
  StageImage,
  StatusBadge as V6StatusBadge,
  Surface,
  Toast as V6Toast,
  Widget,
  v6Control,
  v6Cx,
  v6Surface,
  v6Tone,
  v6Type,
  v6Visual,
  type V6Tone
} from "@/components/v6/design-system";
import { HomeScreen } from "@/components/v6/screens/HomeScreen";
import { selectV6LessonsForActor, selectV6StudentsForAttendanceGroup } from "@/lib/domains/attendance/selectors";
import { buildV6SaveAttendanceOperation } from "@/lib/domains/attendance/operations";
import { selectV6MessagesForActor, selectV6NotificationsForActor } from "@/lib/domains/messages/selectors";
import { selectV6PrivateLessonsForActor } from "@/lib/domains/private-lessons/selectors";
import { buildV6SaveProductOperation, v6InventoryStatuses, v6ProductCategories, v6ProductTypes } from "@/lib/domains/shop/operations";
import { selectV6ShopProductsForActor, selectV6FeaturedShopLanes } from "@/lib/domains/shop/selectors";
import { selectV6MediaForActor } from "@/lib/domains/media/selectors";
import { selectV6GalleryCollectionsForActor } from "@/lib/domains/media/selectors";
import { selectV6EventOperatingSummary, selectV6SchoolYearEvents } from "@/lib/domains/events/selectors";
import { buildV6ResetPasswordOperation, buildV6UpsertUserOperation } from "@/lib/domains/users/v6-operations";
import { groupUsersByRole, selectV6UsersByRole, sortByHebrewName } from "@/lib/domains/users/selectors";
import { selectV6SystemIssues } from "@/lib/domains/system/selectors";
import { selectV6AIInsightsForActor } from "@/lib/domains/ai/selectors";
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
    <header dir="rtl" className={v6Cx("lk-safe-surface relative isolate mx-auto w-full max-w-full overflow-hidden rounded-[36px] border p-4 text-start", v6Surface.base)}>
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-l from-transparent via-[#f4d58d]/18 to-transparent" />
      <SurfaceContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <p className={v6Type.kicker}>LK Stage OS</p>
          <SafeTitle as="h1" className={v6Cx("mt-2 max-w-full", v6Type.screenTitle)}>{title}</SafeTitle>
          {subtitle ? <SafeMeta as="p" className={v6Cx("mt-3 max-w-[22rem]", v6Type.subtitle)}>{subtitle}</SafeMeta> : null}
        </div>
        {action ? <div className="lk-safe-action-zone shrink-0 sm:max-w-[45%]">{action}</div> : null}
      </SurfaceContent>
    </header>
  );
}

function ActionCard({ icon: Icon, title, subtitle, tone, onClick }: { icon: React.ElementType; title: string; subtitle: string; tone: Tone; onClick: () => void }) {
  const t = tones[tone];
  return (
    <button dir="rtl" onClick={onClick} className={v6Cx("lk-safe-surface group relative mx-auto flex min-h-[80px] w-full min-w-0 items-start gap-3 rounded-[30px] border px-3.5 py-3 text-start transition active:scale-[0.985]", v6Surface.whisper)}>
      <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-full", t.soft, t.text)}><Icon size={15} strokeWidth={1.9} /></span>
      <span className="min-w-0 flex-1">
        <SafeTitle as="span" className="block text-[15px] font-semibold tracking-[-0.025em] text-white/86">{title}</SafeTitle>
        <SafeMeta as="span" className="mt-1 block text-[12px] text-white/42">{subtitle}</SafeMeta>
      </span>
      <DirectionalChevron className="shrink-0 text-white/20 transition group-hover:text-white/36" />
    </button>
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
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,247,223,0.058)_40%,transparent_56%),repeating-linear-gradient(90deg,rgba(255,255,255,0.014)_0,rgba(255,255,255,0.014)_1px,transparent_1px,transparent_9px)] opacity-56 mix-blend-screen" />
      <div className="pointer-events-none fixed bottom-0 left-1/2 h-[42vh] w-[min(86vw,430px)] -translate-x-1/2 rounded-t-full bg-[radial-gradient(ellipse_at_center,rgba(215,181,109,0.11),rgba(100,28,63,0.09)_42%,transparent_72%)] blur-sm" />
      <div className="relative mx-auto w-full max-w-[430px]">
        <div className="mb-8 text-center">
          <div className="relative mx-auto grid h-[116px] w-[116px] place-items-center rounded-[44px] border border-[rgba(215,181,109,0.14)] bg-[radial-gradient(circle_at_50%_20%,rgba(255,247,223,0.20),rgba(215,181,109,0.08)_38%,rgba(61,16,39,0.28))] shadow-[0_34px_90px_rgba(61,16,39,0.38),0_18px_70px_rgba(215,181,109,0.12),inset_0_1px_0_rgba(255,255,255,0.14)]">
            <div className="pointer-events-none absolute inset-4 rounded-[34px] border border-[rgba(255,255,255,0.07)]" />
            <MoonStar className="text-[#fff7df]" size={36} />
          </div>
          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.36em] text-[#f4d58d]/62">Backstage Access</p>
          <h1 suppressHydrationWarning className="lk-safe-title mx-auto mt-2 max-w-[22rem] text-center text-[clamp(2.35rem,11vw,3.35rem)] font-semibold leading-[1.02] tracking-[-0.070em]">{db.editableTexts.loginTitle ?? studio?.branding.name}</h1>
          <p className="mx-auto mt-5 max-w-xs text-[15px] leading-relaxed text-white/66">{db.editableTexts.loginSubtitle ?? studio?.branding.tagline}</p>
        </div>
        <form
          className={v6Cx("lk-safe-surface relative isolate mx-auto w-full max-w-full space-y-5 overflow-hidden rounded-[38px] border border-[rgba(255,255,255,0.09)] bg-[linear-gradient(150deg,rgba(255,255,255,0.13),rgba(255,255,255,0.044)_48%,rgba(61,16,39,0.28)_100%)] p-5 shadow-[0_36px_104px_rgba(0,0,0,0.66),0_18px_58px_rgba(215,181,109,0.08),inset_0_1px_0_rgba(255,255,255,0.11)] backdrop-blur-2xl sm:p-6", v6Visual.texture)}
          onSubmit={(e) => {
            e.preventDefault();
            const result = login(phone, password);
            if (result.ok === false) show(result.reason);
          }}
        >
          <div className="relative flex min-h-12 items-center gap-3 rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-black/24 px-4 py-3 text-start text-[13px] font-bold text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.065)]"><Lock className="shrink-0 text-[#f4d58d]/80" size={16} /><span className="min-w-0 flex-1 leading-snug">כניסה מאובטחת לפי המסד</span></div>
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
  if (!user) return <Login />;
  const studio = db.studios.find((s) => s.id === user.studioId);
  const notifications = db.notifications.filter((n) => n.userIds.includes(user.id));
  const unread = notifications.filter((n) => !n.readBy.includes(user.id)).length;
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
    "home";
  return (
    <>
      <V6Toast message={message} />
      <AppShellFrame user={user} studioName={studio?.name} onLogout={logout} atmosphere={atmosphere}>
        <div key={`${tab}-${screen}`}>
          {home && tab === "dashboard" ? <HomeScreen user={user} openScreen={openScreen} openTab={(next) => { setScreen("home"); setTab(next); window.scrollTo({ top: 0 }); }} /> : null}
          {home && tab === "lessons" ? <Lessons user={user} show={show} /> : null}
          {home && tab === "messages" ? <Messages user={user} show={show} /> : null}
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
    <div dir="rtl" className="lk-safe-row flex items-center gap-3 rounded-[28px] px-3 py-3 text-start">
      <span className={v6Cx("grid h-9 w-9 shrink-0 place-items-center rounded-full", t.soft, t.text)}><Icon size={14} strokeWidth={1.9} /></span>
      <span className="min-w-0 flex-1 text-start">
        <SafeMeta as="span" className="block text-[11px] font-medium text-white/42">{label}</SafeMeta>
        <span className="mt-1 block break-words text-[17px] font-semibold leading-tight tracking-[-0.035em] text-white/88">{numericTitle ? <BidiNumber>{title}</BidiNumber> : <RtlText>{title}</RtlText>}</span>
        <SafeMeta as="span" className="mt-1 block text-[11px] font-medium text-white/38">{meta}</SafeMeta>
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
    <div className="space-y-4">
      <Surface tone="studio" className="p-4">
        <p className={v6Cx(v6Type.kicker, "text-emerald-100/52")}>נוכחות שיעור</p>
        <SafeTitle as="h3" className="mt-2 text-[19px] font-semibold tracking-[-0.040em]">{attendanceGroup.name} · {attendanceLesson.time}</SafeTitle>
        <p className="lk-safe-meta mt-2 text-xs leading-relaxed text-white/48">
          {attendanceGroup.danceStyle ?? attendanceGroup.style} · {db.users.filter((teacher) => attendanceGroup.teacherIds.includes(teacher.id)).map((teacher) => teacher.name).join(", ") || "מורה לא שויך"} · {attendanceStudents.length} תלמידים
        </p>
        <p className="lk-safe-meta mt-1 text-xs leading-relaxed text-white/48">
          סומנו {attendanceMarkedCount}/{attendanceStudents.length} · {attendanceLastSaved ? `נשמר לאחרונה ${new Date(attendanceLastSaved).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}` : "טרם נשמר היום"}
        </p>
      </Surface>
      <div className="grid grid-cols-2 gap-2 [&>button]:w-full">
        <V6Button onClick={saveAttendance}>שמירת נוכחות</V6Button>
        <V6Button variant="ghost" onClick={() => setActiveSheet(null)}>ביטול</V6Button>
      </div>
      <FormField label="תאריך שיעור" value={classDate} onChange={setClassDate} type="date" />
      <V6Button variant="ghost" onClick={markAllPresent}>סמן כולם נוכחים</V6Button>
      <div className="space-y-3">
        {attendanceStudents.map((student) => {
          const draft = attendanceDraft[student.id] ?? { status: "present" as V6AttendanceStatus, note: "" };
          const recentAbsences = db.attendance.filter((record) => record.studentId === student.id && (record.status === "absent" || record.status === "missing")).length;
          const parent = db.users.find((item) => item.role === "parent" && (item.linkedStudentIds.includes(student.id) || student.linkedParentIds?.includes(item.id)));
          const openTasks = db.tasks.filter((task) => student.groupIds.includes(task.groupId) && !task.doneByUserIds.includes(student.id)).length;
          return (
            <div key={student.id} className={v6Cx("lk-safe-surface rounded-[29px] border p-3.5 text-start", v6Surface.quiet)}>
              <div className="lk-safe-row flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <SafeTitle as="p" className="text-[15px] font-semibold tracking-[-0.020em]">{student.name}</SafeTitle>
                  <SafeMeta as="p" className={v6Cx("mt-1 text-[11px] font-semibold", draft.status === "absent" || draft.status === "missing" ? "text-rose-100" : draft.status === "late" ? "text-yellow-100" : "text-emerald-100")}>{attendanceStatusLabel[draft.status]}</SafeMeta>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-start text-[11px] leading-relaxed text-white/42">
                {recentAbsences ? <span>היעדרויות אחרונות: <BidiNumber>{recentAbsences}</BidiNumber></span> : <span>נוכחות יציבה</span>}
                {openTasks ? <span>משימות פתוחות: <BidiNumber>{openTasks}</BidiNumber></span> : null}
                {parent && (user.role === "management" || user.role === "super_admin" || user.permissions.manageAttendance) ? <span>טלפון הורה: <BidiNumber>{parent.phone}</BidiNumber></span> : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">{(["present", "absent", "late", "excused"] as V6AttendanceStatus[]).map((status) => <button key={status} onClick={() => setAttendanceStatus(student.id, status)} className={v6Cx("rounded-full px-3 py-2 text-xs font-semibold transition active:scale-95", draft.status === status ? "bg-emerald-100 text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]" : v6Control.chip)}>{attendanceStatusLabel[status]}</button>)}</div>
              <div className="mt-3"><FormField label="הערה" value={draft.note} onChange={(value) => setAttendanceNote(student.id, value)} placeholder="למשל סיבת היעדרות או איחור" /></div>
            </div>
          );
        })}
      </div>
      <SheetActions>
        <V6Button onClick={saveAttendance}>שמירת נוכחות</V6Button>
        <V6Button variant="ghost" onClick={() => setActiveSheet(null)}>ביטול</V6Button>
      </SheetActions>
    </div>
  ) : null;
  return (
    <div className="space-y-4">
      <HeroSurface tone="studio" className="min-h-[220px] p-5">
        <div className="flex items-center gap-3 text-start">
          <span className="grid h-10 w-10 place-items-center rounded-[17px] bg-emerald-100/10 text-emerald-50"><CalendarDays size={20} /></span>
          <V6StatusBadge tone="studio">השיעור הקרוב</V6StatusBadge>
        </div>
        <SafeTitle as="h1" className="mt-5 max-w-[20rem] text-[clamp(2.05rem,9vw,2.85rem)] font-semibold leading-[1.04] tracking-[-0.058em]">{nextLesson?.title ?? "אין שיעור קרוב"}</SafeTitle>
        <SafeMeta as="p" className="mt-3 max-w-[20rem] text-sm leading-relaxed text-white/64">{nextLesson ? `${nextLesson.weekday} · ${nextLesson.time} · ${nextLesson.room}` : "אפשר לתאם שיעור פרטי מהמסך הבא."}</SafeMeta>
      </HeroSurface>
      <EditorialSection title="קצב השבוע" kicker="חזרות ושיעורים" tone="studio">
      <div className="space-y-2.5">
      {lessons.map((lesson) => {
        const group = db.groups.find((g) => g.id === lesson.groupId);
        const tone = toneForStyle(group?.style);
        const todayRecords = db.attendance.filter((record) => record.lessonId === lesson.id && record.classDate === classDate);
        const absentCount = todayRecords.filter((record) => record.status === "absent" || record.status === "missing").length;
        const lateCount = todayRecords.filter((record) => record.status === "late").length;
        return (
          <div key={lesson.id} className={v6Cx("lk-safe-surface rounded-[30px] border p-3.5", v6Surface.quiet)}>
            <div className="flex flex-col gap-3 text-start sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className={v6Cx("grid h-11 w-11 shrink-0 place-items-center rounded-[21px] border border-white/[0.030]", v6Tone[tone].soft, v6Tone[tone].text)}><CalendarDays size={16} strokeWidth={1.9} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col items-start gap-1.5">
                  <SafeTitle as="p" className="min-w-0 flex-1 text-[16px] font-semibold tracking-[-0.026em] text-white/88">{lesson.title}</SafeTitle>
                  {group?.style ? <SafeMeta as="span" className={v6Cx("text-[11px] font-semibold", v6Tone[tone].text)}>{group.style}</SafeMeta> : null}
                </div>
                <SafeMeta as="p" className="mt-1.5 text-sm font-medium text-white/56">{lesson.weekday} · {lesson.time} · {lesson.room} · {todayRecords.length ? `${todayRecords.length} סומנו, ${absentCount} חסרים, ${lateCount} איחורים` : "טרם סומן היום"}</SafeMeta>
              </div>
              </div>
              {(user.permissions.manageAttendance || user.role === "super_admin") ? <div className="sm:shrink-0 [&>button]:w-full"><V6Button variant="ghost" onClick={() => openAttendance(lesson.id)}>נוכחות</V6Button></div> : null}
            </div>
          </div>
        );
      })}
      </div>
      </EditorialSection>
      <V6SheetController activeSheet={attendanceEditor ? activeSheet : null} title="סימון נוכחות" onClose={() => setActiveSheet(null)}>{attendanceEditor}</V6SheetController>
    </div>
  );
}

function Messages({ user, show }: { user: V6User; show: (message: string) => void }) {
  const { db, dispatch } = useV6();
  const notifications = selectV6NotificationsForActor(db, user);
  const messages = selectV6MessagesForActor(db, user);
  return (
    <div className="space-y-4">
      <HeroSurface tone={notifications.some((item) => !item.readBy.includes(user.id)) ? "urgent" : "modern"} className="min-h-[210px] p-5">
        <V6StatusBadge tone="modern">קהילה ועדכונים</V6StatusBadge>
        <SafeTitle as="h1" className="mt-4 max-w-[18rem] text-[clamp(2.0rem,8.8vw,2.75rem)] font-semibold leading-[1.04] tracking-[-0.058em]">רק מה שצריך להישמע</SafeTitle>
        <SafeMeta as="p" className="mt-4 max-w-[20rem] text-sm leading-relaxed text-white/58">חדש עולה קדימה. השאר נשאר שקט.</SafeMeta>
        <div className="mt-4"><V6Button variant="ghost" onClick={() => { dispatch({ type: "mark_all_read", userId: user.id }); show("הכול סומן כנקרא"); }}>סמן הכול כנקרא</V6Button></div>
      </HeroSurface>
      <EditorialSection title="התראות חשובות" kicker="מה דורש קריאה" tone="modern">
      <div className="space-y-2.5">
        {notifications.length ? notifications.map((item) => (
        <button key={item.id} onClick={() => { dispatch({ type: "mark_notification_read", userId: user.id, notificationId: item.id }); show("ההודעה סומנה כנקראה"); }} className="w-full">
          <V6FeedRow icon={Bell} title={item.title} body={item.body} meta={item.readBy.includes(user.id) ? "נקרא" : "חדש"} tone={item.readBy.includes(user.id) ? "studio" : "urgent"} />
        </button>
      )) : <p className="py-4 text-center text-sm text-white/45">אין התראות כרגע.</p>}
      </div>
      </EditorialSection>
      <Widget title="עדכוני סטודיו" kicker="קבוצה וקהילה" icon={MessageCircle} tone="modern">
        <div className="space-y-2">{messages.map((item) => <V6FeedRow key={item.id} icon={MessageCircle} title={item.title} body={item.body} meta="סטודיו" tone="modern" />)}</div>
      </Widget>
    </div>
  );
}

function ProductCard({ product, user, show, onPrivateLesson, onEdit, variant = "standard" }: { product: V6Product; user: V6User; show: (message: string) => void; onPrivateLesson: () => void; onEdit?: () => void; variant?: "feature" | "standard" }) {
  const { db, dispatch } = useV6();
  const privateLesson = product.category.includes("שיעורים");
  const ticket = product.category.includes("כרטיסים");
  const tone: V6Tone = privateLesson ? "studio" : ticket ? "repertoire" : "shop";
  const collection = product.category || (privateLesson ? "Private Studio" : ticket ? "Stage Access" : "Studio Boutique");
  const image = product.featuredImageMediaId ? db.media.find((item) => item.id === product.featuredImageMediaId) : undefined;
  const priceLabel = product.priceMode === "request" ? "לפי בקשה" : product.priceMode === "free" ? "חינם" : `₪ ${product.price}`;
  const inventoryLabel = inventoryStatusLabel[product.inventoryStatus ?? (product.active ? "in_stock" : "draft")];
  const action = privateLesson
    ? () => onPrivateLesson()
    : () => {
        dispatch({ type: "shop_order", actor: user, productId: product.id });
        show("הפעולה נשמרה ונשלחה התראה");
      };
  const feature = variant === "feature";
  return (
    <Surface tone={tone} className={v6Cx("p-0", feature && "md:grid md:grid-cols-[1.12fr_0.88fr]")}>
      {image?.localPreviewUrl ? <div role="img" aria-label={product.title} className={v6Cx("w-full bg-cover bg-center", feature ? "h-64 rounded-t-[34px] md:h-full md:min-h-[260px] md:rounded-l-none md:rounded-r-[34px]" : "h-36 rounded-t-[34px]")} style={{ backgroundImage: `url(${image.localPreviewUrl})` }} /> : <StageImage tone={tone} label={collection} icon={privateLesson ? Receipt : ticket ? Sparkles : ShoppingBag} className={v6Cx(feature ? "h-64 md:h-full md:min-h-[260px] md:rounded-l-none" : "h-36", "rounded-b-none border-x-0 border-t-0")} />}
      <SurfaceContent className={v6Cx("text-start", feature ? "p-5 sm:p-6 md:flex md:flex-col md:justify-between" : "p-4")}>
        <div className="space-y-2">
          <div className="min-w-0">
            <p className={v6Cx(v6Type.kicker, "mb-2 text-white/30")}>{collection}</p>
            <SafeTitle as="h2" className={v6Cx(feature ? "text-[clamp(1.9rem,8vw,2.75rem)] leading-[1.04] tracking-[-0.060em]" : "text-[18px] leading-snug tracking-[-0.035em]", "font-semibold text-white/90")}>{product.title}</SafeTitle>
            <SafeMeta as="p" className="mt-1.5 text-sm leading-relaxed text-white/58">{product.description}</SafeMeta>
          </div>
          <p className={v6Cx(feature ? "text-[1.4rem]" : "text-[15px]", "break-words font-semibold leading-tight tracking-[-0.035em] text-[#fff7df]/84")}><BidiNumber>{priceLabel}</BidiNumber></p>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <V6StatusBadge tone={product.active ? "shop" : "urgent"}>{inventoryLabel}</V6StatusBadge>
          {product.memberOnly || product.visibility === "members" ? <V6StatusBadge tone="management">לחברים בלבד</V6StatusBadge> : null}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 pt-2 [&>button]:w-full">
          <V6Button disabled={!product.active} onClick={action}>{privateLesson ? "זמינות" : "רכישה"}</V6Button>
          {onEdit ? <V6Button variant="ghost" onClick={onEdit}>עריכה</V6Button> : null}
          <SafeMeta as="span" className="col-span-2 text-xs font-medium text-white/38">{product.active ? "זמין" : "לא פעיל"}</SafeMeta>
        </div>
      </SurfaceContent>
    </Surface>
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
  const featuredProduct = filtered[0];
  const supportingProducts = filtered.slice(1);
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
    <div className="space-y-4">
      <Surface tone="shop" className="p-4">
        <p className={v6Cx(v6Type.kicker, "text-yellow-100/54")}>ניהול מוצר</p>
        <SafeTitle as="h3" className="mt-2 text-[19px] font-semibold tracking-[-0.040em]">{productTitle || "מוצר חדש"}</SafeTitle>
        <SafeMeta as="p" className="mt-2 text-xs leading-relaxed text-white/48">שמירה מעדכנת את הנתונים, יומן הפעולות והחנות באותו רגע.</SafeMeta>
      </Surface>
      <div className="grid grid-cols-2 gap-2 [&>button]:w-full">
        <V6Button disabled={productSaving} onClick={() => void saveProduct()}>{productSaving ? "שומר…" : "שמירת מוצר"}</V6Button>
        <V6Button variant="ghost" onClick={() => setActiveSheet(null)}>ביטול</V6Button>
      </div>
      <FormField label="שם מוצר" value={productTitle} onChange={setProductTitle} />
      <FormField label="תיאור" value={productDescription} onChange={setProductDescription} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-start"><span className={v6Control.label}>קטגוריה</span><select value={productCategory} onChange={(e) => setProductCategory(e.target.value)} className={v6Cx("mt-2", v6Control.field)}>{productCategories.map((item) => <option key={item} value={item} className="bg-zinc-950">{item}</option>)}</select></label>
        <label className="block text-start"><span className={v6Control.label}>סוג מוצר</span><select value={productType} onChange={(e) => setProductType(e.target.value as NonNullable<V6Product["type"]>)} className={v6Cx("mt-2", v6Control.field)}>{v6ProductTypes.map((item) => <option key={item} value={item} className="bg-zinc-950">{productTypeLabel[item]}</option>)}</select></label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-start"><span className={v6Control.label}>תמחור</span><select value={productPriceMode} onChange={(e) => setProductPriceMode(e.target.value as NonNullable<V6Product["priceMode"]>)} className={v6Cx("mt-2", v6Control.field)}>{Object.entries(productPriceModeLabel).map(([id, label]) => <option key={id} value={id} className="bg-zinc-950">{label}</option>)}</select></label>
        <FormField label="מחיר ₪" value={productPrice} onChange={setProductPrice} type="number" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-start"><span className={v6Control.label}>סטטוס מלאי</span><select value={productInventoryStatus} onChange={(e) => { const next = e.target.value as NonNullable<V6Product["inventoryStatus"]>; setProductInventoryStatus(next); setProductActive(next !== "draft"); }} className={v6Cx("mt-2", v6Control.field)}>{v6InventoryStatuses.map((item) => <option key={item} value={item} className="bg-zinc-950">{inventoryStatusLabel[item]}</option>)}</select></label>
        <label className="block text-start"><span className={v6Control.label}>נראות</span><select value={productVisibility} onChange={(e) => setProductVisibility(e.target.value as NonNullable<V6Product["visibility"]>)} className={v6Cx("mt-2", v6Control.field)}><option value="public" className="bg-zinc-950">גלוי בחנות</option><option value="members" className="bg-zinc-950">לחברים בלבד</option><option value="hidden" className="bg-zinc-950">מוסתר</option></select></label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="מידות (מופרד בפסיקים)" value={productSizes} onChange={setProductSizes} />
        <FormField label="צבעים (מופרד בפסיקים)" value={productColors} onChange={setProductColors} />
      </div>
      <FormField label="הערות מוצר" value={productNotes} onChange={setProductNotes} />
      <FormField label="הערת איסוף / משלוח" value={productPickupNote} onChange={setProductPickupNote} />
      <button onClick={() => setProductMemberOnly((value) => !value)} className={v6Cx("w-full rounded-[24px] px-4 py-3 text-start text-sm font-semibold", productMemberOnly ? "bg-emerald-100 text-zinc-950" : v6Control.chip)}>דרופ מוגבל לחברי סטודיו בלבד</button>
      <input ref={productImageInput} type="file" accept="image/*" className="hidden" onChange={(event) => uploadProductImage(event.target.files?.[0])} />
      <div className={v6Cx("space-y-2 rounded-[28px] border p-3", v6Surface.quiet)}>
        <div className="flex gap-2 [&>button]:flex-1"><V6Button variant="ghost" onClick={() => productImageInput.current?.click()}><Upload size={16} /> העלאת תמונה</V6Button></div>
        {pendingProductImageFile ? <p className="text-start text-xs text-emerald-100/70">נבחרה תמונה להעלאה בשמירה: {pendingProductImageFile.name}</p> : null}
        {productImagePreviewUrl ? <div className="h-28 rounded-[22px] bg-cover bg-center" style={{ backgroundImage: `url(${productImagePreviewUrl})` }} /> : null}
        {shopImages.length ? <label className="block text-start"><span className="text-[12px] font-bold text-white/50">בחירת תמונה קיימת</span><select value={productImageId} onChange={(e) => setProductImageId(e.target.value)} className="mt-2 min-h-[48px] w-full rounded-[18px] border border-transparent bg-black/24 px-3 text-white outline-none"><option value="" className="bg-zinc-950">ללא תמונה</option>{shopImages.map((item) => <option key={item.id} value={item.id} className="bg-zinc-950">{item.title}</option>)}</select></label> : <p className="text-start text-xs text-white/44">אין עדיין תמונות מוצר שמורות.</p>}
      </div>
      <SheetActions>
        <V6Button disabled={productSaving} onClick={() => void saveProduct()}>{productSaving ? "שומר…" : "שמירת מוצר"}</V6Button>
        <V6Button variant="ghost" onClick={() => setActiveSheet(null)}>ביטול</V6Button>
      </SheetActions>
    </div>
  );
  return (
    <div className="space-y-5">
      <HeroSurface tone="shop" className="min-h-[320px] p-5">
        <V6StatusBadge tone="shop">בוטיק</V6StatusBadge>
        <SafeTitle as="h1" className={v6Cx("mt-5 max-w-[20rem]", v6Type.editorialTitle)}>בוטיק לפני במה</SafeTitle>
        <SafeMeta as="p" className="mt-4 max-w-[19rem] text-[14px] leading-relaxed text-white/62">כרטיסים, שיעורים פרטיים ופריטי סטודיו. מעט, ברור, מוכן לרכישה.</SafeMeta>
        <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <InlineMetric tone="shop" label="פריטים" value={<BidiNumber>{filtered.length}</BidiNumber>} meta={category} />
          <InlineMetric tone="studio" label="פרטיים" value={<BidiNumber>{lanes.privateLessons.length}</BidiNumber>} meta="זמינים" />
          <InlineMetric tone="repertoire" label="כרטיסים" value={<BidiNumber>{lanes.tickets.length}</BidiNumber>} meta="במה" />
        </div>
      </HeroSurface>
      <OpenCluster tone="shop" className="space-y-4 px-4 py-4">
        <SegmentedControl value={category} options={categories} onChange={setCategory} />
        <div className="flex gap-2 overflow-x-auto no-scrollbar [&>button]:min-w-[12.5rem]">
          <ActionCard icon={Receipt} title="שיעורים פרטיים" subtitle={`${lanes.privateLessons.length} ${lanes.privateLessons.length === 1 ? "אפשרות" : "אפשרויות"}`} tone="shop" onClick={() => openScreen("private_lessons")} />
          <ActionCard icon={Sparkles} title="כרטיסים" subtitle={`${lanes.tickets.length} במלאי`} tone="repertoire" onClick={() => setCategory("כרטיסים")} />
        </div>
      </OpenCluster>
      <V6SheetController activeSheet={activeSheet} title={productTitle || "מוצר חדש"} onClose={() => setActiveSheet(null)}>{productEditor}</V6SheetController>
      {(user.permissions.manageShop || user.role === "super_admin") ? <ActionCard icon={Plus} title="הוספת מוצר" subtitle="ניהול מוצר ותמונות" tone="shop" onClick={() => openProductEditor()} /> : null}
      <div className="space-y-3">
        {featuredProduct ? <ProductCard product={featuredProduct} user={user} show={show} onPrivateLesson={() => openScreen("private_lessons")} onEdit={(user.permissions.manageShop || user.role === "super_admin") ? () => openProductEditor(featuredProduct) : undefined} variant="feature" /> : null}
        {supportingProducts.length ? (
          <div className="space-y-3">
            {supportingProducts.map((product) => <ProductCard key={product.id} product={product} user={user} show={show} onPrivateLesson={() => openScreen("private_lessons")} onEdit={(user.permissions.manageShop || user.role === "super_admin") ? () => openProductEditor(product) : undefined} />)}
          </div>
        ) : null}
      </div>
      <Surface tone="shop" className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-start"><CreditCard className="shrink-0 text-yellow-100/70" size={17} /><span className="min-w-0 flex-1 text-xs font-medium text-white/38">תשלום מאובטח יופעל בצד שרת</span></div>
        <div className="grid grid-cols-1 gap-1.5 rounded-[20px] bg-black/18 p-1.5 text-center text-xs font-semibold text-white/56 shadow-[inset_0_1px_0_rgba(255,255,255,0.040)] sm:grid-cols-3">
          {["Apple Pay", "Bit", "אשראי"].map((method) => <button key={method} onClick={() => show(`${method} נבחר כאמצעי תשלום מועדף`)} className="lk-safe-control min-h-11 rounded-[17px] px-3 py-2 transition hover:bg-white/[0.06] active:scale-95">{method}</button>)}
        </div>
      </Surface>
    </div>
  );
}

function More({ user, openScreen, openTab }: { user: V6User; openScreen: (screen: V6Screen) => void; openTab: (tab: V6Tab) => void }) {
  const { db } = useV6();
  const aiInsights = useMemo(() => selectV6AIInsightsForActor(db, user).slice(0, 1), [db, user]);
  const seenMoreTargets = new Set<string>();
  const sections = [
    { title: "ניהול", items: user.role === "super_admin" ? [{ title: "מסד נתונים", subtitle: "ייצוא, ייבוא וגיבוי", icon: Database, tone: "admin" as Tone, screen: "database" as V6Screen }, { title: "טקסטים", subtitle: "תוכן שאפשר לערוך", icon: Sparkles, tone: "repertoire" as Tone, screen: "texts" as V6Screen }, { title: "אפשרויות", subtitle: "הפעלה וכיבוי", icon: Flag, tone: "admin" as Tone, screen: "flags" as V6Screen }, { title: "יומן פעולות", subtitle: "מה השתנה ומתי", icon: ClipboardList, tone: "management" as Tone, screen: "audit" as V6Screen }, { title: "מצב האפליקציה", subtitle: "פתיחה וסנכרון", icon: HeartPulse, tone: "studio" as Tone, screen: "system" as V6Screen }, { title: "חיבורים", subtitle: "Supabase, R2 ותשלומים", icon: Shield, tone: "admin" as Tone, screen: "integrations" as V6Screen }, { title: "מיתוג", subtitle: "שם, שפה ונראות סטודיו", icon: Settings, tone: "admin" as Tone, screen: "branding" as V6Screen }] : [] },
    { title: "הסטודיו", items: [{ title: "לוח שנה ותחרויות", subtitle: "אירועים, חזרות והכנות", icon: CalendarDays, tone: "management" as Tone, screen: "calendar" as V6Screen }, { title: "שיעורים פרטיים", subtitle: "בקשות, מועדים ותשלום", icon: Receipt, tone: "shop" as Tone, screen: "private_lessons" as V6Screen }, { title: "גלריה", subtitle: "תמונות, וידאו וחומרים", icon: ImagePlus, tone: "modern" as Tone, screen: "media" as V6Screen }, { title: "זיכרונות והישגים", subtitle: "רגעים יפים מהסטודיו", icon: Trophy, tone: "repertoire" as Tone, screen: "legacy" as V6Screen }] },
    { title: "חנות ותשלומים", items: [{ title: "בוטיק ותשלומים", subtitle: "מוצרים, כרטיסים ואמצעי תשלום", icon: ShoppingBag, tone: "shop" as Tone, tab: "shop" as V6Tab }] },
    { title: "כלים למורה", items: user.role === "teacher" || user.role === "management" || user.role === "super_admin" ? [{ title: "נוכחות וקבוצות", subtitle: "פעולות מהירות למורה", icon: School, tone: "studio" as Tone, screen: "system" as V6Screen }] : [] },
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
    <div className="space-y-5">
      <HeroSurface tone={user.role === "super_admin" ? "admin" : user.role === "management" ? "management" : "modern"} className="min-h-[250px] p-5">
        <V6StatusBadge tone={user.role === "super_admin" ? "admin" : "management"}>{user.role === "super_admin" ? "ניהול" : "כלים שימושיים"}</V6StatusBadge>
        <SafeTitle as="h1" className={v6Cx("mt-5 max-w-[18rem]", v6Type.editorialTitle)}>כל מה שצריך, במקום אחד</SafeTitle>
        <SafeMeta as="p" className="mt-4 max-w-[20rem] text-sm leading-relaxed text-white/58">קיצורים נוחים לכלים החשובים, בצורה רגועה וברורה.</SafeMeta>
        <div className="mt-7 grid grid-cols-2 gap-2">
          <InlineMetric tone="management" label="אזורים" value={<BidiNumber>{sections.length}</BidiNumber>} meta="זמינים" />
          <InlineMetric tone="admin" label="תפקיד" value={roleLabel[user.role]} meta="הרשאות" />
        </div>
      </HeroSurface>
      {sections.map((section) => (
        <OpenCluster key={section.title} tone={section.title === "ניהול" ? "admin" : section.title === "צוות וניהול" ? "management" : "studio"} className="space-y-3 px-4 py-4">
          <div className="px-1 text-start">
            <p className={v6Type.kicker}>{section.title}</p>
          </div>
          <div className="space-y-1">
            {section.items.map((item) => <ActionCard key={item.title} icon={item.icon} title={item.title} subtitle={item.subtitle} tone={item.tone} onClick={() => "tab" in item ? openTab(item.tab) : openScreen(item.screen)} />)}
          </div>
        </OpenCluster>
      ))}
      {aiInsights.length ? <AISuggestionStack insights={aiInsights} /> : null}
    </div>
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
    <div className="space-y-4">
      <Surface tone="management" className="p-4">
        <p className={v6Cx(v6Type.kicker, "text-sky-100/54")}>זהות והרשאות</p>
        <SafeTitle as="h3" className="mt-2 text-[19px] font-semibold tracking-[-0.040em]">{selected?.name ?? (name || "משתמש חדש")}</SafeTitle>
        <SafeMeta as="p" className="mt-2 text-xs leading-relaxed text-white/48">שינוי תפקיד מעדכן את הרשאות המשתמש דרך אותו מסלול נתונים.</SafeMeta>
      </Surface>
      <div className="grid grid-cols-2 gap-2 [&>button]:w-full">
        <V6Button onClick={() => { if (save()) setActiveSheet(null); }}>שמירה</V6Button>
        <V6Button variant="ghost" onClick={resetPassword}>איפוס סיסמה</V6Button>
      </div>
      <FormField label="שם" value={name} onChange={setName} />
      <FormField label="טלפון" value={phone} onChange={setPhone} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-start"><span className={v6Control.label}>תפקיד</span><select value={role} onChange={(e) => setRoleAndPermissions(e.target.value as V6Role)} className={v6Cx("mt-2", v6Control.field)}>{Object.entries(roleLabel).map(([id, label]) => <option key={id} value={id} className="bg-zinc-950">{label}</option>)}</select></label>
        <label className="block text-start"><span className={v6Control.label}>סטטוס</span><select value={active ? "active" : "inactive"} onChange={(e) => setActive(e.target.value === "active")} className={v6Cx("mt-2", v6Control.field)}><option value="active" className="bg-zinc-950">פעיל</option><option value="inactive" className="bg-zinc-950">מושבת</option></select></label>
      </div>
      {(role === "teacher" || role === "student") ? <div className={v6Cx("rounded-[28px] border p-3 text-start", v6Surface.quiet)}><p className="mb-2 text-[12px] font-semibold text-white/48">{role === "teacher" ? "שיוך מורה לקבוצות" : "שיוך תלמיד/ה לקבוצות"}</p><div className="flex flex-wrap gap-2">{db.groups.map((group) => <button key={group.id} onClick={() => toggleGroup(group.id)} className={v6Cx("rounded-full px-3 py-2 text-xs font-semibold", groupIds.includes(group.id) ? "bg-emerald-100 text-zinc-950" : v6Control.chip)}>{group.name}</button>)}</div></div> : null}
      {role === "student" ? <FormField label="קבוצת גיל" value={ageGroup} onChange={setAgeGroup} placeholder="למשל נוער / בוגרות" /> : null}
      {(role === "teacher" || role === "student") ? <div className={v6Cx("rounded-[28px] border p-3 text-start", v6Surface.quiet)}><p className="mb-2 text-[12px] font-semibold text-white/48">סגנונות ריקוד</p><div className="flex flex-wrap gap-2">{danceStyles.map((style) => <button key={style} onClick={() => toggleDanceStyle(style)} className={v6Cx("rounded-full px-3 py-2 text-xs font-semibold", danceStyleIds.includes(style) ? "bg-cyan-100 text-zinc-950" : v6Control.chip)}>{style}</button>)}</div></div> : null}
      {role === "parent" ? <div className={v6Cx("rounded-[28px] border p-3 text-start", v6Surface.quiet)}><p className="mb-2 text-[12px] font-semibold text-white/48">קישור הורה לתלמיד/ה</p><div className="flex flex-wrap gap-2">{availableStudents.map((student) => <button key={student.id} onClick={() => toggleLinkedStudent(student.id)} className={v6Cx("rounded-full px-3 py-2 text-xs font-semibold", linkedStudentIds.includes(student.id) ? "bg-sky-100 text-zinc-950" : v6Control.chip)}>{student.name}</button>)}</div></div> : null}
      {role === "parent" ? <div className="grid gap-3 sm:grid-cols-2"><FormField label="העדפות תקשורת" value={communicationPrefs} onChange={setCommunicationPrefs} /><button onClick={() => setPrimaryContact((value) => !value)} className={v6Cx("min-h-[56px] rounded-[24px] px-4 text-start text-sm font-semibold", primaryContact ? "bg-sky-100 text-zinc-950" : v6Control.chip)}>איש קשר ראשי</button></div> : null}
      {role === "teacher" ? <button onClick={() => setPrivateLessonEnabled((value) => !value)} className={v6Cx("w-full rounded-[24px] px-4 py-3 text-start text-sm font-semibold", privateLessonEnabled ? "bg-yellow-100 text-zinc-950" : v6Control.chip)}>זמין/ה לשיעורים פרטיים</button> : null}
      {(role === "management" || role === "super_admin") ? <FormField label="אחריות / תפקיד ניהולי" value={responsibility} onChange={setResponsibility} /> : null}
      <FormField label="הערות" value={notes} onChange={setNotes} />
      <div className={v6Cx("rounded-[28px] border p-3 text-start", v6Surface.quiet)}>
        <p className="mb-2 text-[12px] font-semibold text-white/48">הרשאות</p>
        <div className="flex flex-wrap gap-2">{permissionLabels.map(([key, label]) => <button key={key} onClick={() => togglePermission(key)} className={v6Cx("rounded-full px-3 py-2 text-xs font-semibold", permissions[key] ? "bg-violet-100 text-zinc-950" : v6Control.chip)}>{label}</button>)}</div>
      </div>
      <FormField label={selected ? "סיסמה חדשה לאיפוס" : "סיסמה ראשונית"} value={password} onChange={setPassword} />
      <SheetActions>
        <V6Button onClick={() => { if (save()) setActiveSheet(null); }}>שמירה</V6Button>
        <V6Button variant="ghost" onClick={resetPassword}>איפוס</V6Button>
        <V6Button variant="ghost" onClick={() => setActiveSheet(null)}>ביטול</V6Button>
      </SheetActions>
    </div>
  );
  return (
    <div className="space-y-5">
      <BackHeader title="ניהול משתמשים" back={back} action={<V6Button onClick={() => openNewUser("student")}>חדש</V6Button>} />
      <HeroSurface tone="management" className="min-h-[190px] p-5">
        <V6StatusBadge tone="management">זהויות</V6StatusBadge>
        <SafeTitle as="h2" className="mt-4 max-w-[18rem] text-[clamp(1.9rem,8.4vw,2.65rem)] font-semibold leading-[1.04] tracking-[-0.054em]">להחזיק את הלהקה נכון</SafeTitle>
        <SafeMeta as="p" className="mt-3 max-w-[20rem] text-sm leading-relaxed text-white/56">אנשים, תפקידים והרשאות. זהות ברורה לפני כלי ניהול.</SafeMeta>
      </HeroSurface>
      <OpenCluster tone="management" className="px-4 py-4">
      <div className="mb-4 px-1 text-start"><p className={v6Type.kicker}>חיפוש וסינון</p></div>
      <div className="space-y-3">
        <FormField label="חיפוש" value={query} onChange={setQuery} placeholder="חיפוש לפי שם או טלפון" />
        <SegmentedControl value={filterOptions.find((item) => item.id === filter)?.label ?? "כולם"} options={filterOptions.map((item) => item.label)} onChange={(value) => setFilter(filterOptions.find((item) => item.label === value)?.id ?? "all")} />
        <div className="grid gap-2 sm:grid-cols-4">
          <label className="block text-start"><span className={v6Control.label}>קבוצה</span><select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className={v6Cx("mt-2", v6Control.field)}><option value="all" className="bg-zinc-950">כל הקבוצות</option>{db.groups.map((group) => <option key={group.id} value={group.id} className="bg-zinc-950">{group.name}</option>)}</select></label>
          <label className="block text-start"><span className={v6Control.label}>גיל</span><select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} className={v6Cx("mt-2", v6Control.field)}><option value="all" className="bg-zinc-950">כל הגילים</option>{ageGroups.map((age) => <option key={age} value={age} className="bg-zinc-950">{age}</option>)}</select></label>
          <label className="block text-start"><span className={v6Control.label}>סגנון</span><select value={styleFilter} onChange={(e) => setStyleFilter(e.target.value)} className={v6Cx("mt-2", v6Control.field)}><option value="all" className="bg-zinc-950">כל הסגנונות</option>{danceStyles.map((style) => <option key={style} value={style} className="bg-zinc-950">{style}</option>)}</select></label>
          <label className="block text-start"><span className={v6Control.label}>פעילות</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={v6Cx("mt-2", v6Control.field)}><option value="all" className="bg-zinc-950">כולם</option><option value="active" className="bg-zinc-950">פעילים</option><option value="inactive" className="bg-zinc-950">לא פעילים</option></select></label>
        </div>
      </div>
      </OpenCluster>
      <V6SheetController activeSheet={activeSheet} title={selected?.name ?? "משתמש חדש"} onClose={() => setActiveSheet(null)}>{editor}</V6SheetController>
      <div className="grid gap-3">
        <OpenCluster tone="management" className="lg:p-3">
          <div className="mb-4 px-1 text-start"><p className={v6Type.kicker}><BidiNumber>{filteredUsers.length}</BidiNumber> מוצגים</p><RtlText as="h2" className={v6Type.sectionTitle}>אנשי הסטודיו</RtlText></div>
          <div className="space-y-4">{groupedUsers.map((group) => <div key={group.role} className="space-y-2"><p className="text-start text-[11px] font-black text-white/40">{roleLabel[group.role]}</p>{group.users.map((user) => <button key={user.id} onClick={() => openUserSheet(user)} className="w-full"><UserCard user={user} db={db} active={selected?.id === user.id} /></button>)}</div>)}</div>
        </OpenCluster>
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
    <div dir="rtl" className={v6Cx("lk-safe-row flex items-start gap-3 rounded-[30px] px-3 py-3 text-start transition", active ? "bg-[#f4d58d]/10 text-[#fff7df]" : "text-white hover:bg-white/[0.018]")}>
      <span className={v6Cx("grid h-10 w-10 shrink-0 place-items-center rounded-full font-semibold", active ? "bg-[#f4d58d]/14 text-[#fff7df]" : v6Cx(v6Tone[tone].soft, v6Tone[tone].text))}>{user.name.slice(0, 1)}</span>
      <span className="min-w-0 flex-1">
        <SafeTitle as="span" className="block text-[15px] font-semibold tracking-[-0.024em]">{user.name}</SafeTitle>
        <span className={v6Cx("lk-safe-meta mt-1 block text-[12px] font-medium", active ? "text-white/68" : "text-white/46")}>טלפון: <BidiNumber>{user.phone}</BidiNumber></span>
        <SafeMeta as="span" className={v6Cx("mt-1 block text-[11px] font-medium", active ? "text-white/62" : "text-white/42")}>{meta}</SafeMeta>
      </span>
      <span className={v6Cx("max-w-[5.5rem] shrink-0 text-[10px] font-semibold leading-tight", active ? "text-white/68" : "text-white/48")}>{user.active ? roleLabel[user.role] : "לא פעיל"}</span>
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
        <SafeTitle as="h2" className="mt-4 max-w-[18rem] text-[clamp(1.95rem,8.8vw,2.75rem)] font-semibold leading-[1.04] tracking-[-0.056em]">תיאום פרטי, נקי</SafeTitle>
        <SafeMeta as="p" className="mt-4 max-w-[20rem] text-sm leading-relaxed text-white/58">בקשה קצרה, מורה נכון, מועד מוצע. בלי טופס שמרגיש כבד.</SafeMeta>
      </HeroSurface>
      <EditorialSection title="בקשת שיעור" kicker="קונסיירז׳ סטודיו" tone="shop">
      <div className="space-y-3">
        <label className="block text-start"><span className={v6Control.label}>תלמיד/ה</span><select value={studentId} onChange={(e) => setStudentId(e.target.value)} className={v6Cx("mt-2", v6Control.field)}>{students.map((s) => <option key={s.id} value={s.id} className="bg-zinc-950">{s.name}</option>)}</select></label>
        <label className="block text-start"><span className={v6Control.label}>מורה</span><select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className={v6Cx("mt-2", v6Control.field)}>{teachers.map((t) => <option key={t.id} value={t.id} className="bg-zinc-950">{t.name}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-2 [&>button]:w-full">
          <V6Button disabled={!canRequest} onClick={() => request(30)}><BidiNumber>30</BidiNumber> דקות</V6Button>
          <V6Button disabled={!canRequest} onClick={() => request(45)}><BidiNumber>45</BidiNumber> דקות</V6Button>
        </div>
        {!canRequest ? <p className="text-start text-xs text-amber-100/70">אין מספיק נתונים לשליחת בקשה. צריך תלמיד/ה ומורה פעילים.</p> : null}
      </div>
      </EditorialSection>
      <EditorialSection title="בקשות פעילות" kicker="תיאום ותשלום" tone="shop">
      <div className="space-y-3">
        {privateLessons.length ? privateLessons.map((item) => (
          <div key={item.id} className={v6Cx("lk-safe-surface rounded-[32px] border p-4", v6Surface.quiet)}>
            <div className="flex items-start gap-3 text-start">
              <div className="min-w-0 flex-1">
                <SafeTitle as="h2" className="font-semibold tracking-[-0.020em]">{db.users.find((u) => u.id === item.studentId)?.name} · {item.duration} דקות</SafeTitle>
                <SafeMeta as="p" className="mt-1 text-sm text-white/55"><BidiNumber>₪ {item.price}</BidiNumber> · {item.selectedSlot ?? item.suggestedSlots[0] ?? "מועד טרם נקבע"}</SafeMeta>
              </div>
              <V6StatusBadge tone={item.status === "paid" ? "success" : item.status === "requested" ? "urgent" : "shop"}>{item.status === "paid" ? "שולם" : item.status === "requested" ? "מבוקש" : "בתיאום"}</V6StatusBadge>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3 [&>button]:w-full">
              <V6Button variant="ghost" onClick={() => { dispatch({ type: "suggest_private_lesson", actor: user, requestId: item.id, slot: "יום שני 17:00" }); show("מועד הוצע"); }}>הצע מועד</V6Button>
              <V6Button variant="ghost" onClick={() => { dispatch({ type: "select_private_lesson", actor: user, requestId: item.id, slot: "יום שני 17:00" }); show("מועד נבחר"); }}>בחר מועד</V6Button>
              <V6Button onClick={() => { dispatch({ type: "mark_private_lesson_paid", actor: user, requestId: item.id }); show("שולם"); }}>שולם</V6Button>
            </div>
          </div>
        )) : <Surface tone="shop"><p className="text-center text-sm text-white/50">אין בקשות שיעור פרטי פתוחות כרגע.</p></Surface>}
      </div>
      </EditorialSection>
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
    <div className="space-y-4">
      <Surface tone="modern" className="p-4">
        <p className={v6Cx(v6Type.kicker, "text-cyan-100/54")}>העלאת מדיה</p>
        <SafeTitle as="h3" className="mt-2 text-[19px] font-semibold tracking-[-0.040em]">{title || "חומר חדש"}</SafeTitle>
        <SafeMeta as="p" className="mt-2 text-xs leading-relaxed text-white/48">במצב אמיתי הקובץ עולה ל־R2 והמטאדאטה נשמרת ב־Supabase. בלי R2 מוצגת תצוגת דמו בלבד.</SafeMeta>
      </Surface>
      <FormField label="כותרת" value={title} onChange={setTitle} />
      <label className="block text-start"><span className={v6Control.label}>יעד</span><select value={mediaTarget} onChange={(event) => setMediaTarget(event.target.value as "group" | "event")} className={v6Cx("mt-2", v6Control.field)}><option value="group" className="bg-zinc-950">מדיית שיעור / קבוצה</option><option value="event" className="bg-zinc-950">מדיית אירוע</option></select></label>
      {mediaTarget === "group" ? <label className="block text-start"><span className={v6Control.label}>קבוצה</span><select value={groupId} onChange={(e) => setGroupId(e.target.value)} className={v6Cx("mt-2", v6Control.field)}>{groups.map((g) => <option key={g.id} value={g.id} className="bg-zinc-950">{g.name}</option>)}</select></label> : null}
      {mediaTarget === "event" ? <label className="block text-start"><span className={v6Control.label}>אירוע</span><select value={eventId} onChange={(event) => setEventId(event.target.value)} className={v6Cx("mt-2", v6Control.field)}>{db.events.map((event) => <option key={event.id} value={event.id} className="bg-zinc-950">{event.title}</option>)}</select></label> : null}
      <input ref={input} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => void save(e.target.files?.[0])} />
      <div className="grid grid-cols-2 gap-2 [&>button]:w-full">
        <V6Button disabled={uploading} onClick={() => input.current?.click()}><Upload size={16} /> {uploading ? "מעלה…" : "בחירת קובץ"}</V6Button>
        <V6Button disabled={uploading} variant="ghost" onClick={() => void save()}>שמירת מטאדאטה</V6Button>
      </div>
      <RtlText as="p" className="text-xs leading-relaxed text-white/44">תצוגת דמו אינה נחשבת שמירה קבועה. שמירה אמיתית דורשת סשן אקדמיה מאומת ו־R2 מוגדרים בשרת.</RtlText>
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
        <SafeTitle as="h2" className="mt-4 max-w-[18rem] text-[clamp(1.95rem,9vw,2.8rem)] font-semibold leading-[1.04] tracking-[-0.060em]">רגעי חזרה, במה וקהילה</SafeTitle>
        <SafeMeta as="p" className="mt-4 max-w-[20rem] text-sm leading-relaxed text-white/64">תצוגת מדיה מטופלת כמו אלבום סטודיו, עם הרשאות וקבוצות מאחורי הקלעים.</SafeMeta>
      </HeroSurface>
      <V6SheetController activeSheet={activeSheet} title="העלאת מדיה" onClose={() => setActiveSheet(null)}>{mediaEditor}</V6SheetController>
      <ActionCard icon={ImagePlus} title="העלאת מדיה" subtitle="תמונה, וידאו או מטאדאטה" tone="modern" onClick={() => setActiveSheet({ type: "upload-media", mode: "add" })} />
      <OpenCluster tone="modern" className="grid gap-3 p-3 sm:grid-cols-4">
        <label className="block text-start"><span className={v6Control.label}>קבוצה</span><select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)} className={v6Cx("mt-2", v6Control.field)}><option value="all" className="bg-zinc-950">כל הקבוצות</option>{db.groups.map((group) => <option key={group.id} value={group.id} className="bg-zinc-950">{group.name}</option>)}</select></label>
        <label className="block text-start"><span className={v6Control.label}>אירוע</span><select value={eventFilter} onChange={(event) => setEventFilter(event.target.value)} className={v6Cx("mt-2", v6Control.field)}><option value="all" className="bg-zinc-950">כל האירועים</option>{db.events.map((event) => <option key={event.id} value={event.id} className="bg-zinc-950">{event.title}</option>)}</select></label>
        <label className="block text-start"><span className={v6Control.label}>מעלה</span><select value={uploaderFilter} onChange={(event) => setUploaderFilter(event.target.value)} className={v6Cx("mt-2", v6Control.field)}><option value="all" className="bg-zinc-950">כולם</option>{uploaderOptions.map((item) => <option key={item.id} value={item.id} className="bg-zinc-950">{item.name}</option>)}</select></label>
        <FormField label="תאריך שיעור" value={dateFilter} onChange={setDateFilter} type="date" />
      </OpenCluster>
      <OpenCluster tone="modern" className="grid gap-3 p-3 sm:grid-cols-2">
        {selectV6GalleryCollectionsForActor(db, user).map((collection) => {
          const groupNames = db.groups.filter((group) => collection.groupIds.includes(group.id)).map((group) => group.name).join(", ");
          const event = collection.eventId ? db.events.find((item) => item.id === collection.eventId) : undefined;
          return (
            <Surface key={collection.id} tone={collection.kind === "annual_show" ? "repertoire" : collection.kind === "competition" ? "urgent" : "modern"} className="p-4">
              <div className="flex items-start gap-3 text-start">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[21px] bg-cyan-100/10 text-cyan-50"><Images size={17} /></span>
                <div className="min-w-0 flex-1">
                  <SafeTitle as="h2" className="text-[17px] font-semibold tracking-[-0.030em]">{collection.title}</SafeTitle>
                  <SafeMeta as="p" className="mt-1 text-xs text-white/46">{event ? `${eventTypeLabel[event.type]} · ${event.date}` : groupNames || collection.schoolYear}</SafeMeta>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <V6StatusBadge tone="modern"><BidiNumber>{collection.itemIds.length}</BidiNumber> פריטים</V6StatusBadge>
                    <V6StatusBadge tone={collection.visibility === "management" ? "admin" : "studio"}>{collection.visibility === "parents" ? "הורים" : collection.visibility === "students" ? "תלמידים" : collection.visibility === "staff" ? "צוות" : "ניהול"}</V6StatusBadge>
                  </div>
                </div>
              </div>
            </Surface>
          );
        })}
      </OpenCluster>
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
        <SafeTitle as="h2" className="mt-4 max-w-[20rem] text-[clamp(1.95rem,8.8vw,2.75rem)] font-semibold leading-[1.04] tracking-[-0.056em]">לוח שנתי שמחזיק במה, חזרות ומשפחה</SafeTitle>
        <SafeMeta as="p" className="mt-4 max-w-[22rem] text-sm leading-relaxed text-white/62">{nextEvent ? `${nextEvent.title} · ${nextEvent.date}${nextEvent.startTime ? ` · ${nextEvent.startTime}` : ""}` : "אין אירועים להצגה."}</SafeMeta>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <InlineMetric tone="management" label="אירועים" value={<BidiNumber>{events.length}</BidiNumber>} meta="מסוננים" />
          <InlineMetric tone="urgent" label="לתשומת לב" value={<BidiNumber>{events.filter((event) => event.status === "needs_attention").length}</BidiNumber>} meta="מוכנות" />
          <InlineMetric tone="repertoire" label="מופעים" value={<BidiNumber>{events.filter((event) => event.type === "annual_show" || event.type === "competition").length}</BidiNumber>} meta="במה" />
        </div>
      </HeroSurface>
      <OpenCluster tone="management" className="space-y-3 px-4 py-4">
        <div className="px-1 text-start"><p className={v6Type.kicker}>סינון לפי סוג אירוע</p></div>
        <SegmentedControl value={typeFilter === "all" ? "הכול" : eventTypeLabel[typeFilter]} options={eventTypes.map((type) => type === "all" ? "הכול" : eventTypeLabel[type as V6CalendarEvent["type"]])} onChange={(label) => setTypeFilter(label === "הכול" ? "all" : (Object.entries(eventTypeLabel).find(([, value]) => value === label)?.[0] as V6CalendarEvent["type"]) ?? "all")} />
      </OpenCluster>
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
                  <SafeTitle as="h2" className="mt-2 text-[20px] font-semibold tracking-[-0.040em]">{event.title}</SafeTitle>
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
        <SafeTitle as="h2" className="mt-4 max-w-[19rem] text-[clamp(1.95rem,8.8vw,2.75rem)] font-semibold leading-[1.04] tracking-[-0.056em]">זיכרון סטודיו בלי המצאות</SafeTitle>
        <SafeMeta as="p" className="mt-4 max-w-[22rem] text-sm leading-relaxed text-white/62">הישגים, מופעים ותחרויות נשמרים כרשומות שההנהלה מזינה ומאשרת ידנית.</SafeMeta>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <InlineMetric tone="repertoire" label="הישגים" value={<BidiNumber>{achievements.length}</BidiNumber>} meta="מובנים" />
          <InlineMetric tone="modern" label="אלבומים" value={<BidiNumber>{collections.length}</BidiNumber>} meta="ארכיון" />
          <InlineMetric tone="management" label="רשומות" value={<BidiNumber>{legacy.length}</BidiNumber>} meta="מורשת" />
        </div>
      </HeroSurface>
      <EditorialSection title="הישגים ומורשת" kicker="ניהול ידני" tone="repertoire">
        <div className="space-y-3">
          {[...achievements, ...legacy].map((item) => {
            const groupNames = db.groups.filter((group) => item.groupIds.includes(group.id)).map((group) => group.name).join(", ");
            const date = "date" in item ? item.date : item.schoolYear;
            const description = "description" in item ? item.description : item.summary;
            return (
              <div key={item.id} className={v6Cx("lk-safe-surface rounded-[30px] border p-4 text-start", v6Surface.quiet)}>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-100/10 text-amber-50"><Trophy size={15} /></span>
                  <div className="min-w-0 flex-1">
                    <SafeTitle as="h3" className="text-[16px] font-semibold tracking-[-0.030em]">{item.title}</SafeTitle>
                    <SafeMeta as="p" className="mt-1 text-sm leading-relaxed text-white/52">{description}</SafeMeta>
                    <SafeMeta as="p" className="mt-2 text-xs text-white/38">{date || "תאריך יוזן"} · {groupNames || "ללא שיוך קבוצה"} · {item.visibility === "management" ? "ניהול בלבד" : "גלוי לפי הרשאות"}</SafeMeta>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </EditorialSection>
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
        <SafeTitle as="h2" className="mt-4 max-w-[19rem] text-[clamp(1.95rem,8.8vw,2.75rem)] font-semibold leading-[1.04] tracking-[-0.056em]">מסד הנתונים</SafeTitle>
        <SafeMeta as="p" className="mt-4 max-w-[21rem] text-sm leading-relaxed text-white/62">ייצוא, ייבוא וגיבוי של הנתונים במקום אחד וברור.</SafeMeta>
      </HeroSurface>
      <OpenCluster tone="admin" className="grid gap-1 sm:grid-cols-3"><MiniSummary icon={Users} tone="management" label="משתמשים" title={`${db.users.length}`} meta="במאגר" /><MiniSummary icon={Bell} tone="modern" label="התראות" title={`${db.notifications.length}`} meta="פעילות" /><MiniSummary icon={Database} tone="admin" label="יומן" title={`${db.auditLog.length}`} meta="פעולות" /></OpenCluster>
      <Surface tone="admin" className="space-y-3 p-4"><p className="text-right text-sm leading-relaxed text-white/58">אפשר לייצא גיבוי או לייבא קובץ נתונים מעודכן.</p><input ref={ref} type="file" accept="application/json" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const result = await importDatabase(file); show(result.ok === true ? "המסד יובא" : result.reason); }} /><div className="flex flex-wrap gap-2 [&>button]:flex-1"><V6Button onClick={exportDatabase}><Download size={16} /> ייצוא</V6Button><V6Button variant="ghost" onClick={() => ref.current?.click()}><Upload size={16} /> ייבוא</V6Button></div></Surface>
    </div>
  );
}

function TextsScreen({ actor, show, back }: { actor: V6User; show: (message: string) => void; back: () => void }) {
  const { db, dispatch } = useV6();
  const [title, setTitle] = useState(db.editableTexts.loginTitle ?? "");
  const [prompt] = useState(db.aiPrompts.super_admin ?? "");
  return <div className="space-y-4"><BackHeader title="טקסטים והצעות" back={back} /><HeroSurface tone="admin" className="min-h-[205px] p-5"><V6StatusBadge tone="admin">שפה ברורה</V6StatusBadge><SafeTitle as="h2" className="mt-4 max-w-[18rem] text-[clamp(1.95rem,8.8vw,2.75rem)] font-semibold leading-[1.04] tracking-[-0.056em]">הקול של הסטודיו נשמר כאן</SafeTitle><SafeMeta as="p" className="mt-3 max-w-[20rem] text-sm leading-relaxed text-white/60">כאן עורכים טקסטים חשובים שמופיעים באפליקציה.</SafeMeta></HeroSurface><EditorialSection title="טקסט כניסה" kicker="תוכן ניתן לעריכה" tone="repertoire"><div className="space-y-3"><FormField label="כותרת כניסה" value={title} onChange={setTitle} /><V6Button onClick={() => { dispatch({ type: "update_text", actor, key: "loginTitle", value: title }); show("הטקסט נשמר"); }}>שמירה</V6Button></div></EditorialSection><EditorialSection title="תבנית הצעה" kicker="אישור אנושי" tone="admin"><label className="block text-right"><span className="text-[11px] font-black text-white/50">תבנית למנהל האפליקציה</span><textarea value={prompt} readOnly className="mt-2 min-h-32 w-full rounded-[24px] border border-transparent bg-black/20 p-3 text-right text-[15px] leading-relaxed text-white/68 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]" /></label><SafeMeta as="p" className="mt-3 text-xs text-white/48">תבניות הצעה מוצגות לצפייה בלבד בשלב זה. פרסום תוכן דורש אישור אנושי.</SafeMeta><div className="mt-3"><V6Button variant="ghost" onClick={() => show("עריכת תבניות הצעה לא מופעלת ב־V6 הנוכחי")}>למה לא נשמר?</V6Button></div></EditorialSection></div>;
}

function FlagsScreen({ actor, show, back }: { actor: V6User; show: (message: string) => void; back: () => void }) {
  const { db, dispatch } = useV6();
  return <div className="space-y-4"><BackHeader title="אפשרויות" back={back} /><HeroSurface tone="admin" className="min-h-[205px] p-5"><V6StatusBadge tone="admin">הפעלה וכיבוי</V6StatusBadge><SafeTitle as="h2" className="mt-4 max-w-[18rem] text-[clamp(1.95rem,8.8vw,2.75rem)] font-semibold leading-[1.04] tracking-[-0.056em]">אפשרויות שנפתחות בזהירות</SafeTitle><SafeMeta as="p" className="mt-3 max-w-[20rem] text-sm leading-relaxed text-white/60">כל שינוי נשמר, כדי שיהיה ברור מה הופעל ומתי.</SafeMeta></HeroSurface><EditorialSection title="אפשרויות פעילות" kicker="כל שינוי נרשם" tone="admin"><div className="space-y-2.5">{Object.entries(db.featureFlags).map(([key, value]) => <div key={key} className="lk-safe-row flex items-center justify-between gap-3 rounded-[26px] border border-[rgba(255,255,255,0.046)] bg-white/[0.035] p-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]"><button onClick={() => { dispatch({ type: "update_flags", actor, flags: { [key]: !value } }); show("האפשרות עודכנה"); }} className={v6Cx("shrink-0 rounded-full px-3 py-1.5 text-xs font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]", value ? "bg-emerald-200 text-zinc-950" : "bg-white/10 text-white/58")}>{value ? "פעיל" : "כבוי"}</button><span className="lk-safe-meta text-sm font-black tracking-[-0.02em]">{key}</span></div>)}</div></EditorialSection></div>;
}

function BrandingScreen({ show, back }: { show: (message: string) => void; back: () => void }) {
  return <div className="space-y-4"><BackHeader title="מיתוג" back={back} /><HeroSurface tone="admin" className="min-h-[190px] p-5"><V6StatusBadge tone="admin">זהות סטודיו</V6StatusBadge><SafeTitle as="h2" className="mt-4 max-w-[18rem] text-[clamp(1.95rem,8.8vw,2.7rem)] font-semibold leading-[1.04] tracking-[-0.056em]">השם והמראה של הסטודיו</SafeTitle><SafeMeta as="p" className="mt-3 max-w-[20rem] text-sm leading-relaxed text-white/60">שם, צבעים ושפה נשמרים במקום אחד.</SafeMeta></HeroSurface><Surface tone="admin"><SafeMeta as="p" className="text-sm text-white/58">כאן יופיעו פרטי המיתוג של הסטודיו.</SafeMeta><div className="mt-3"><V6Button onClick={() => show("מיתוג מוכן לעריכה")}>בדיקת מיתוג</V6Button></div></Surface></div>;
}

function AuditScreen({ back }: { back: () => void }) {
  const { db } = useV6();
  const summary = summarizeV6Audit(db.auditLog);
  return <div className="space-y-4"><BackHeader title="יומן פעולות" back={back} /><HeroSurface tone="admin" className="min-h-[205px] p-5"><V6StatusBadge tone={summary.sensitive ? "urgent" : "admin"}>{summary.sensitive ? "פעולות חשובות" : "יומן רגוע"}</V6StatusBadge><SafeTitle as="h2" className="mt-4 max-w-[18rem] text-[clamp(1.95rem,8.8vw,2.75rem)] font-semibold leading-[1.04] tracking-[-0.056em]">מה השתנה ומתי</SafeTitle><SafeMeta as="p" className="mt-3 max-w-[20rem] text-sm leading-relaxed text-white/60">רשימה קצרה וברורה של פעולות חשובות באפליקציה.</SafeMeta></HeroSurface><OpenCluster tone="admin" className="grid grid-cols-2 gap-1"><MiniSummary icon={ClipboardList} tone="management" label="פעולות" title={`${summary.total}`} meta="נרשמו" /><MiniSummary icon={Shield} tone="urgent" label="חשובות" title={`${summary.sensitive}`} meta="למעקב" /></OpenCluster><Widget title="יומן פעולות" kicker="מעקב שינויים" icon={ClipboardList} tone="management"><div className="space-y-2">{db.auditLog.map((item) => <V6FeedRow key={item.id} icon={Shield} title={item.action} body={`${item.actorName} · ${item.target}`} meta={new Date(item.createdAt).toLocaleDateString("he-IL")} tone="management" />)}</div></Widget></div>;
}

function SystemScreen({ back }: { back: () => void }) {
  const { db, sync } = useV6();
  const issues = selectV6SystemIssues(db);
  const health = computeV6ManagementHealth(db);
  return <div className="space-y-4"><BackHeader title="מצב האפליקציה" back={back} /><HeroSurface tone={issues.length ? "urgent" : "studio"} className="p-5"><V6StatusBadge tone={issues.length ? "urgent" : "success"}>{issues.length ? "דורש בדיקה" : "תקין"}</V6StatusBadge><SafeTitle as="h2" className="mt-4 text-[clamp(1.95rem,8.8vw,2.75rem)] font-semibold leading-[1.04] tracking-[-0.056em]">{health.summary}</SafeTitle><SafeMeta as="p" className="mt-4 text-sm leading-relaxed text-white/64">פתיחה, נתונים וסנכרון מוצגים כאן בצורה פשוטה.</SafeMeta></HeroSurface><OpenCluster tone={issues.length ? "urgent" : "studio"} className="grid gap-1 sm:grid-cols-3"><MiniSummary icon={Check} tone="studio" label="פתיחה" title="מיידית" meta={sync} /><MiniSummary icon={Database} tone="admin" label="גרסה" title={`V${db.version}`} meta="נתונים" /><MiniSummary icon={HeartPulse} tone={issues.length ? "urgent" : "modern"} label="מצב" title={issues.length ? `${issues.length} לבדיקה` : "תקין"} meta={issues.length ? "צריך לבדוק" : "ללא חסימות"} /></OpenCluster><Widget title="בדיקות" kicker="מעקב יומי" icon={HeartPulse} tone={issues.length ? "urgent" : "studio"}><div className="space-y-2">{issues.length ? issues.map((issue) => <V6FeedRow key={issue.id} icon={HeartPulse} title={issue.title} body={issue.body} meta={issue.severity === "critical" ? "חשוב" : "בדיקה"} tone={issue.severity === "critical" ? "urgent" : "management"} />) : <V6FeedRow icon={CheckCircle2} title="אין חסימות פעילות" body="האפליקציה מוכנה לפתיחה ושימוש יומי." meta="תקין" tone="studio" />}</div></Widget></div>;
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
        <SafeTitle as="h2" className="mt-4 max-w-[19rem] text-[clamp(1.95rem,8.8vw,2.75rem)] font-semibold leading-[1.04] tracking-[-0.056em]">מצב החיבורים</SafeTitle>
        <SafeMeta as="p" className="mt-4 max-w-[21rem] text-sm leading-relaxed text-white/62">תצוגה למנהל האפליקציה בלבד. אין כאן סודות, רק מצב חיבור פשוט.</SafeMeta>
      </HeroSurface>
      <OpenCluster tone="admin" className="space-y-2">
        {items.length ? items.map((item) => (
          <div key={item.id} className="lk-safe-row flex items-start justify-between gap-3 rounded-[26px] border border-white/[0.045] bg-white/[0.03] p-3 text-start">
            <div className="min-w-0 flex-1">
              <SafeTitle as="h3" className="text-[15px] font-semibold text-white/86">{item.labelHe}</SafeTitle>
              <SafeMeta as="p" className="mt-1 text-xs leading-relaxed text-white/46">{item.detailHe}</SafeMeta>
            </div>
            <V6StatusBadge tone={integrationTone(item.statusHe)}>{item.statusHe}</V6StatusBadge>
          </div>
        )) : <V6FeedRow icon={HeartPulse} title={error || "בודק חיבורים"} body="הסטטוסים יופיעו כאן בעוד רגע." meta="בדיקה" tone={error ? "urgent" : "admin"} />}
      </OpenCluster>
      <Surface tone="admin" className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3 text-start">
          <SafeTitle as="h3" className="text-[15px] font-semibold text-white/86">Push בדפדפן הזה</SafeTitle>
          <V6StatusBadge tone={pushSupported ? "success" : "admin"}>{pushSupported ? "מחובר" : "חסר"}</V6StatusBadge>
        </div>
        <SafeMeta as="p" className="text-xs leading-relaxed text-white/48">בקשת הרשאה תופעל רק מפעולה יזומה, לא בפתיחת האפליקציה.</SafeMeta>
      </Surface>
      {report?.latestErrors.length ? <Widget title="שגיאות אחרונות" kicker="חיבורים" icon={Shield} tone="urgent"><div className="space-y-2">{report.latestErrors.map((item) => <V6FeedRow key={item} icon={Shield} title="בדיקה נכשלה" body={item} meta="בדיקה" tone="urgent" />)}</div></Widget> : null}
    </div>
  );
}

export function LKStudentSpaceV6() {
  return <V6AppProvider><Shell /></V6AppProvider>;
}
