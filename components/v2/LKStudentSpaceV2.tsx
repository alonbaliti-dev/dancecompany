"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ClipboardList,
  Database,
  Download,
  Flag,
  ImagePlus,
  KeyRound,
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
  Upload,
  UserRound,
  Users
} from "lucide-react";
import { getNotificationsForUser } from "@/lib/services/notification-service";
import { MediaLibrary } from "@/components/media/MediaLibrary";
import { MediaPicker } from "@/components/media/MediaPicker";
import { MediaUploader } from "@/components/media/MediaUploader";
import { canAttachMediaToProduct, canManageShopProducts, productFeaturedMedia } from "@/lib/services/media-service";
import { V2AppProvider, useV2App } from "@/lib/v2/AppProvider";
import { can, canAccessManagement, canAccessSuperAdmin, canAccessTeacherDashboard, permissionLabel, roleLabel } from "@/lib/v2/guards";
import {
  classesForUser,
  currentStudio,
  displayUserName,
  groupsForUser,
  privateLessonPrice,
  privateLessonRequestsForUser,
  productsForShop,
  students,
  teachers,
  textValue,
  usersForActor
} from "@/lib/v2/selectors";
import type { MediaItem } from "@/lib/media/media-types";
import type { V2Notification, V2PermissionKey, V2PrivateLessonDuration, V2Product, V2Role, V2Screen, V2ShopCategory, V2StockStatus, V2Tab, V2User } from "@/lib/v2/types";

const permissionKeys = Object.keys(permissionLabel) as V2PermissionKey[];

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function cardClass(extra?: string) {
  return cx(
    "relative mx-auto w-full max-w-full min-w-0 overflow-hidden rounded-[18px] border border-white/[0.095] bg-[linear-gradient(155deg,rgba(255,255,255,0.105),rgba(255,255,255,0.04)_52%,rgba(0,0,0,0.1))] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:rounded-[20px] sm:p-4",
    extra
  );
}

type PremiumTone = "studio" | "flamenco" | "hiphop" | "classic" | "modern" | "pointe" | "repertoire" | "management" | "admin" | "shop";

const toneClass: Record<PremiumTone, { text: string; soft: string; border: string; glow: string; gradient: string }> = {
  studio: {
    text: "text-emerald-100",
    soft: "bg-emerald-300/12",
    border: "border-emerald-200/20",
    glow: "shadow-[0_18px_50px_rgba(52,211,153,0.14)]",
    gradient: "from-emerald-300/18 via-white/[0.045] to-cyan-300/6"
  },
  flamenco: {
    text: "text-amber-100",
    soft: "bg-red-400/12",
    border: "border-amber-200/24",
    glow: "shadow-[0_18px_50px_rgba(185,28,28,0.18)]",
    gradient: "from-red-500/18 via-amber-300/9 to-black/10"
  },
  hiphop: {
    text: "text-fuchsia-100",
    soft: "bg-fuchsia-400/13",
    border: "border-fuchsia-200/22",
    glow: "shadow-[0_18px_50px_rgba(217,70,239,0.14)]",
    gradient: "from-violet-500/18 via-fuchsia-400/10 to-black/10"
  },
  classic: {
    text: "text-pink-100",
    soft: "bg-pink-200/10",
    border: "border-pink-100/22",
    glow: "shadow-[0_18px_50px_rgba(244,114,182,0.12)]",
    gradient: "from-pink-100/14 via-slate-200/7 to-black/10"
  },
  modern: {
    text: "text-cyan-100",
    soft: "bg-cyan-300/10",
    border: "border-cyan-100/22",
    glow: "shadow-[0_18px_50px_rgba(34,211,238,0.11)]",
    gradient: "from-slate-400/16 via-cyan-300/8 to-black/10"
  },
  pointe: {
    text: "text-rose-100",
    soft: "bg-rose-200/11",
    border: "border-rose-100/22",
    glow: "shadow-[0_18px_50px_rgba(251,207,232,0.1)]",
    gradient: "from-rose-200/16 via-stone-100/8 to-black/10"
  },
  repertoire: {
    text: "text-amber-100",
    soft: "bg-amber-300/11",
    border: "border-amber-100/24",
    glow: "shadow-[0_18px_50px_rgba(245,158,11,0.13)]",
    gradient: "from-amber-300/18 via-orange-300/7 to-black/10"
  },
  management: {
    text: "text-blue-100",
    soft: "bg-blue-400/12",
    border: "border-blue-100/22",
    glow: "shadow-[0_18px_50px_rgba(59,130,246,0.13)]",
    gradient: "from-blue-500/18 via-cyan-300/7 to-black/10"
  },
  admin: {
    text: "text-violet-100",
    soft: "bg-violet-300/12",
    border: "border-violet-100/24",
    glow: "shadow-[0_18px_50px_rgba(167,139,250,0.14)]",
    gradient: "from-violet-300/18 via-zinc-100/8 to-black/10"
  },
  shop: {
    text: "text-yellow-100",
    soft: "bg-yellow-300/12",
    border: "border-yellow-100/22",
    glow: "shadow-[0_18px_50px_rgba(250,204,21,0.12)]",
    gradient: "from-yellow-300/17 via-amber-200/8 to-black/10"
  }
};

function toneForStyle(style?: string): PremiumTone {
  if (!style) return "studio";
  if (style.includes("פלמנקו")) return "flamenco";
  if (style.includes("היפ הופ")) return "hiphop";
  if (style.includes("קלאסי")) return "classic";
  if (style.includes("מודרני")) return "modern";
  if (style.includes("פוינט")) return "pointe";
  if (style.includes("רפרטואר")) return "repertoire";
  return "studio";
}

function toneForRole(role: V2Role): PremiumTone {
  if (role === "super_admin") return "admin";
  if (role === "management") return "management";
  if (role === "teacher") return "studio";
  if (role === "parent") return "classic";
  return "hiphop";
}

function Button({
  children,
  onClick,
  tone = "primary",
  type = "button",
  disabled
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "max-w-full min-h-10 whitespace-nowrap rounded-[16px] px-3.5 py-2 text-sm font-semibold tracking-tight transition duration-200 active:scale-[0.985] disabled:opacity-45",
        tone === "primary" && "bg-[linear-gradient(135deg,#f7fff9,#9ff7d2_42%,#2dd4bf)] text-zinc-950 shadow-[0_14px_34px_rgba(45,212,191,0.22)]",
        tone === "ghost" && "border border-white/[0.11] bg-white/[0.045] text-white hover:border-white/20 hover:bg-white/[0.075]",
        tone === "danger" && "border border-rose-300/25 bg-rose-500/12 text-rose-100"
      )}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-right">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/38">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-[18px] border border-white/[0.09] bg-black/28 px-4 py-3 text-right text-[16px] text-white outline-none placeholder:text-white/28 transition focus:border-emerald-200/45 focus:bg-black/38"
      />
    </label>
  );
}

function Header({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <header className="mx-auto flex w-full max-w-full min-w-0 flex-col gap-3 text-right sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100/62">LK Student Space</p>
        <h1 className="lk-text-balance mt-1 text-[1.55rem] font-semibold leading-[1.05] tracking-[-0.035em] text-white sm:text-[2rem]">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-white/62 sm:text-sm">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap justify-end gap-2">{action}</div> : null}
    </header>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="text-right">
      {eyebrow ? <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/34">{eyebrow}</p> : null}
      <h2 className="lk-text-balance mt-1 text-[1.12rem] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-xl">{title}</h2>
      {subtitle ? <p className="mt-1 text-xs leading-relaxed text-white/54">{subtitle}</p> : null}
    </div>
  );
}

function StatusBadge({ children, tone = "studio" }: { children: React.ReactNode; tone?: PremiumTone }) {
  const t = toneClass[tone];
  return (
    <span className={cx("inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold", t.border, t.soft, t.text)}>
      {children}
    </span>
  );
}

function ProgressRing({ value, label, tone = "studio" }: { value: number; label: string; tone?: PremiumTone }) {
  const t = toneClass[tone];
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="grid h-14 w-14 shrink-0 place-items-center rounded-full"
        style={{ background: `conic-gradient(rgba(167,243,208,0.92) ${pct * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
      >
        <div className="grid h-[2.65rem] w-[2.65rem] place-items-center rounded-full bg-zinc-950 text-xs font-semibold text-white">
          {pct}%
        </div>
      </div>
      <div className="text-right">
        <p className={cx("text-sm font-semibold", t.text)}>{label}</p>
        <p className="text-xs text-white/38">מדד שבועי</p>
      </div>
    </div>
  );
}

function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed left-1/2 top-[calc(env(safe-area-inset-top,0px)+0.85rem)] z-[80] -translate-x-1/2 rounded-full border border-white/12 bg-zinc-950/92 px-4 py-2 text-sm font-semibold text-white shadow-2xl backdrop-blur-xl"
    >
      {message}
    </motion.div>
  );
}

function useToastMessage() {
  const [message, setMessage] = useState<string | null>(null);
  function show(messageText: string) {
    setMessage(messageText);
    window.setTimeout(() => setMessage(null), 2200);
  }
  return { message, show };
}

function LoginScreen() {
  const { db, login } = useV2App();
  const { message, show } = useToastMessage();
  const [phone, setPhone] = useState("0501110000");
  const [password, setPassword] = useState("creator2026");
  const title = textValue(db, "login.hero.title", "LK Student Space");
  const subtitle = textValue(db, "login.hero.subtitle", "מרחב פרימיום לתלמידים, הורים, מורים והנהלה");

  function submit(e: FormEvent) {
    e.preventDefault();
    const result = login(phone, password);
    if (result.ok === false) show(result.reason);
  }

  return (
    <main className="min-h-app px-safe relative flex items-center justify-center overflow-hidden px-4 py-8">
      <Toast message={message} />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(167,243,208,0.16),transparent_42%),radial-gradient(circle_at_12%_72%,rgba(217,70,239,0.11),transparent_34%),linear-gradient(180deg,#050506,#08080b_62%,#030304)]" />
        <div className="absolute left-1/2 top-[18%] h-48 w-[min(84vw,30rem)] -translate-x-1/2 rounded-full bg-white/[0.035] blur-3xl" />
      </div>
      <div className="relative w-full max-w-[27rem]">
        <div className="mb-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] border border-emerald-100/24 bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(52,211,153,0.08))] shadow-[0_16px_42px_rgba(52,211,153,0.16)]">
            <MoonStar className="text-emerald-200" size={28} />
          </div>
          <h1 className="mt-4 text-[2.45rem] font-semibold leading-none tracking-[-0.06em] text-white">{title}</h1>
          <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-white/50">{subtitle}</p>
        </div>
        <form onSubmit={submit} className={cardClass("space-y-4 border-white/[0.12] bg-zinc-950/76 p-5 shadow-[0_32px_90px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.1)]")}>
          <div className="flex items-center justify-between rounded-[18px] border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-white/48">
            <span>מאובטח · הרשאות מהמסד</span>
            <Shield size={15} className="text-emerald-200/80" />
          </div>
          <Field label="טלפון" value={phone} onChange={setPhone} placeholder="0500000000" />
          <Field label="סיסמה" value={password} onChange={setPassword} type="password" />
          <Button type="submit">
            <span className="inline-flex items-center gap-2">
              כניסה
              <Lock size={16} />
            </span>
          </Button>
          <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-right text-xs leading-relaxed text-white/40">
            התחברות לפי טלפון וסיסמה. ההרשאות מוגדרות במערכת.
          </div>
        </form>
      </div>
    </main>
  );
}

function Shell() {
  const { db, user, logout, syncStatus, dispatch } = useV2App();
  const [tab, setTab] = useState<V2Tab>("dashboard");
  const [screen, setScreen] = useState<V2Screen>("home");
  const contentRef = useRef<HTMLElement | null>(null);
  const { message, show } = useToastMessage();
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0 });
    window.scrollTo({ top: 0, left: 0 });
  }, [tab, screen]);
  if (!user) return <LoginScreen />;

  const studio = currentStudio(db, user);
  const notifications = getNotificationsForUser(db, user);
  const unreadCount = notifications.filter((n) => !n.readByUserIds.includes(user.id)).length;
  const openScreen = (next: V2Screen) => {
    setScreen(next);
    setTab("more");
  };
  const openNotification = (notification: V2Notification) => {
    dispatch({ type: "mark_notification_read", notificationId: notification.id, userId: user.id });
    if (notification.screen) {
      setScreen(notification.screen);
      setTab("more");
      return;
    }
    if (notification.tab) {
      setScreen("home");
      setTab(notification.tab);
    }
  };
  const showHome = screen === "home";

  return (
    <div className="min-h-dynamic overflow-x-hidden bg-[#050506] text-white">
      <Toast message={message} />
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_44%_at_50%_-12%,rgba(167,243,208,0.13),transparent_55%),radial-gradient(ellipse_44%_36%_at_92%_18%,rgba(168,85,247,0.1),transparent_58%),radial-gradient(ellipse_48%_36%_at_5%_72%,rgba(56,189,248,0.07),transparent_55%)]" />
        <div className="absolute -top-44 right-[-18%] h-[30rem] w-[30rem] rounded-full bg-emerald-300/[0.07] blur-3xl" />
        <div className="absolute bottom-20 left-[-16%] h-96 w-96 rounded-full bg-fuchsia-400/[0.08] blur-3xl" />
      </div>

      <div className="lk-mobile-container relative z-10 flex min-h-dynamic flex-col pt-[calc(0.55rem+env(safe-area-inset-top,0px))]">
        <div className="mb-2.5 flex shrink-0 min-w-0 items-center justify-between gap-2 rounded-[18px] border border-white/[0.07] bg-black/30 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl">
          <button onClick={logout} className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-white/54 transition active:scale-95">
            יציאה
          </button>
          <div className="flex min-w-0 items-center gap-2.5 text-right">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-white">{user.name}</p>
              <p className="truncate text-[11px] text-white/42">
              {roleLabel[user.role]} · {studio?.name} · {syncStatus === "ready" ? "פתיחה מיידית" : "מסד מסונכרן"}
              </p>
            </div>
            <div className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-[15px] border text-sm font-bold", toneClass[toneForRole(user.role)].border, toneClass[toneForRole(user.role)].soft, toneClass[toneForRole(user.role)].text)}>
              {user.name.slice(0, 1)}
            </div>
          </div>
        </div>

        <main ref={contentRef} className="lk-scroll-page relative flex-1">
        <motion.div className="mx-auto w-full max-w-full pb-3 md:max-w-5xl" key={`${tab}-${screen}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
        {showHome && tab === "dashboard" ? <Dashboard user={user} openScreen={openScreen} /> : null}
        {showHome && tab === "lessons" ? <Lessons user={user} openScreen={openScreen} show={show} /> : null}
        {showHome && tab === "messages" ? <Messages user={user} show={show} onOpenNotification={openNotification} /> : null}
        {showHome && tab === "shop" ? <Shop user={user} show={show} openScreen={openScreen} /> : null}
        {showHome && tab === "more" ? <More user={user} openScreen={openScreen} /> : null}

        {!showHome && screen === "teacher" ? <TeacherDashboard user={user} show={show} onBack={() => setScreen("home")} /> : null}
        {!showHome && screen === "management" ? <ManagementDashboard user={user} openScreen={openScreen} onBack={() => setScreen("home")} /> : null}
        {!showHome && screen === "super_admin" ? <SuperAdminHub user={user} openScreen={openScreen} onBack={() => setScreen("home")} /> : null}
        {!showHome && screen === "users" ? <UserManagement actor={user} show={show} onBack={() => setScreen("home")} /> : null}
        {!showHome && screen === "database" ? <DatabaseTools actor={user} show={show} onBack={() => setScreen("home")} /> : null}
        {!showHome && screen === "texts" ? <TextEditor actor={user} show={show} onBack={() => setScreen("home")} /> : null}
        {!showHome && screen === "audit" ? <AuditLog onBack={() => setScreen("home")} /> : null}
        {!showHome && screen === "flags" ? <FeatureFlags actor={user} show={show} onBack={() => setScreen("home")} /> : null}
        {!showHome && screen === "private_lessons" ? <PrivateLessons user={user} show={show} onBack={() => setScreen("home")} /> : null}
        {!showHome && screen === "media_library" ? <MediaLibraryScreen user={user} show={show} onBack={() => setScreen("home")} /> : null}
        {!showHome && screen === "product_management" ? <ProductManagement user={user} show={show} onBack={() => setScreen("home")} /> : null}
        </motion.div>
        </main>

      </div>

      <BottomNav
        tab={tab}
        unreadCount={unreadCount}
        onTab={(next) => {
          setScreen("home");
          setTab(next);
        }}
      />
    </div>
  );
}

function BottomNav({ tab, unreadCount, onTab }: { tab: V2Tab; unreadCount: number; onTab: (tab: V2Tab) => void }) {
  const items: Array<{ id: V2Tab; label: string; icon: React.ElementType }> = [
    { id: "dashboard", label: "בית", icon: Sparkles },
    { id: "lessons", label: "שיעורים", icon: CalendarDays },
    { id: "messages", label: "הודעות", icon: MessageCircle },
    { id: "shop", label: "חנות", icon: ShoppingBag },
    { id: "more", label: "עוד", icon: Users }
  ];
  return (
    <nav className="nav-fixed-layer pointer-events-none px-safe pb-[max(0.45rem,var(--safe-bottom))]">
      <div className="lk-mobile-container">
        <div className="pointer-events-auto grid grid-cols-5 gap-1 rounded-[22px] border border-white/[0.09] bg-zinc-950/88 p-1 shadow-[0_-12px_42px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.id === tab;
            return (
              <button
                key={item.id}
                onClick={() => onTab(item.id)}
                className={cx(
                  "relative flex min-h-[2.55rem] min-w-0 flex-col items-center justify-center gap-0.5 rounded-[17px] text-[9.5px] font-bold leading-none transition duration-200 active:scale-95",
                  active ? "bg-[linear-gradient(135deg,#ffffff,#c7ffe5)] text-zinc-950 shadow-[0_10px_24px_rgba(167,243,208,0.18)]" : "text-white/46 hover:bg-white/[0.05]"
                )}
              >
                <Icon size={15} />
                {item.id === "messages" && unreadCount > 0 ? (
                  <span className="absolute mt-[-2.4rem] mr-7 grid h-4 min-w-4 place-items-center rounded-full bg-rose-300 px-1 text-[9px] font-black text-rose-950">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
                <span className="max-w-full truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function Dashboard({ user, openScreen }: { user: V2User; openScreen: (screen: V2Screen) => void }) {
  const { db } = useV2App();
  const classes = classesForUser(db, user);
  const lessons = privateLessonRequestsForUser(db, user);
  const nextClass = classes[0];
  const tone = toneForRole(user.role);
  const t = toneClass[tone];
  const notifications = getNotificationsForUser(db, user);
  const unread = notifications.filter((item) => !item.readByUserIds.includes(user.id)).length;
  const latestMessage = db.messages.find((m) => m.studioId === user.studioId || user.role === "super_admin");
  const latestMessageTitle = latestMessage?.title.replace("LK Space V2", "LK Student Space") ?? "אין הודעה דחופה";
  const taskCount = db.tasks.filter((task) => user.groupIds.includes(task.groupId) || user.role === "management" || user.role === "super_admin").length;
  const attendanceValue = user.role === "management" || user.role === "super_admin" ? 92 : user.role === "teacher" ? 86 : 74;
  const heroTitle =
    user.role === "super_admin"
      ? "ניהול שקט וברור"
      : user.role === "management"
        ? "תמונת מצב ניהולית"
        : user.role === "teacher"
          ? "הכיתה מוכנה אליך"
          : user.role === "parent"
            ? "הכול ברור לילד/ה"
            : "היום שלך ב־LK";
  return (
    <div className="space-y-3.5">
      <Header
        title="בית"
        subtitle={nextClass ? `הבא: ${nextClass.title} · ${nextClass.weekday} ${nextClass.time}` : "תמונת מצב קצרה וברורה להיום."}
      />
      <section className="grid min-w-0 gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <div className={cardClass(cx("border-white/[0.1] bg-gradient-to-br p-4", t.gradient, t.glow))}>
          <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-white/[0.08] blur-3xl" />
          <div className="relative flex min-w-0 flex-col gap-3">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <StatusBadge tone={tone}>{roleLabel[user.role]}</StatusBadge>
              <span className="rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-semibold text-white/50">{attendanceValue}% נוכחות</span>
            </div>
            <div className="min-w-0 text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/42">{textValue(db, "dashboard.nextAction", "הפעולה הבאה שלך")}</p>
              <h2 className="lk-text-balance mt-1.5 text-[1.45rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-[2rem]">{heroTitle}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-white/55">
                {nextClass ? `${nextClass.title} · ${nextClass.weekday} ${nextClass.time} · ${nextClass.room}` : "אין שיעור קרוב. אפשר להתמקד בהודעות, חנות או שיעור פרטי."}
              </p>
            </div>
          </div>
        </div>
        <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <InsightCard icon={CalendarDays} tone={tone} label="השיעור הבא" title={nextClass ? nextClass.weekday : "אין היום"} meta={nextClass ? `${nextClass.time} · ${nextClass.room}` : "הלוח פנוי"} />
          <InsightCard icon={MessageCircle} tone="modern" label="הודעות" title={unread ? `${unread} חדשות` : "הכול נקרא"} meta={latestMessageTitle} />
          <InsightCard icon={ClipboardList} tone="repertoire" label="משימות" title={`${taskCount} פתוחות`} meta="לפי קבוצות והרשאות" />
          <InsightCard icon={Receipt} tone="shop" label="פרטיים" title={`${lessons.length} בקשות`} meta="זמינות ותשלום" />
        </div>
      </section>
      <section className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {canAccessTeacherDashboard(user) ? <ActionCard title="לוח מורה" subtitle="שיעורים, בקשות ופעולות מהירות" icon={School} tone="studio" onClick={() => openScreen("teacher")} /> : null}
        {canAccessManagement(user) ? <ActionCard title="ניהול סטודיו" subtitle="משתמשים, קבוצות וניהול יומי" icon={Shield} tone="management" onClick={() => openScreen("management")} /> : null}
        {canAccessSuperAdmin(user) ? <ActionCard title="ניהול האפליקציה" subtitle="נתונים, הרשאות ויומן פעולות" icon={Database} tone="admin" onClick={() => openScreen("super_admin")} /> : null}
        <ActionCard title="שיעורים פרטיים" subtitle={`${lessons.length} בקשות פעילות`} icon={Receipt} tone="shop" onClick={() => openScreen("private_lessons")} />
        {canAccessTeacherDashboard(user) ? <ActionCard title="מדיה וקבוצות" subtitle="תמונות, וידאו וגלריה" icon={ImagePlus} tone="modern" onClick={() => openScreen("media_library")} /> : null}
      </section>
      <section className={cardClass("flex flex-col gap-3 border-white/[0.075] sm:flex-row sm:items-center sm:justify-between")}>
        <div className="min-w-0 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/32">עדכון חשוב</p>
          <h2 className="lk-text-balance mt-1 text-base font-semibold sm:text-lg">הבסיס יציב. עכשיו החוויה מרגישה פרימיום.</h2>
          <p className="mt-1 text-sm leading-relaxed text-white/45">משתמשים, חנות, מדיה ושיעורים פרטיים זמינים ממסך אחד.</p>
        </div>
        <Button tone="ghost" onClick={() => openScreen("private_lessons")}>פתיחת שיעור פרטי</Button>
      </section>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  tone,
  label,
  title,
  meta
}: {
  icon: React.ElementType;
  tone: PremiumTone;
  label: string;
  title: string;
  meta: string;
}) {
  const t = toneClass[tone];
  return (
    <div className={cx(cardClass("flex items-center gap-3 p-3"), t.border)}>
      <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-[15px]", t.soft, t.text)}>
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1 text-right">
        <p className="truncate text-[11px] font-semibold text-white/52">{label}</p>
        <p className="mt-0.5 truncate text-base font-semibold leading-tight text-white/95">{title}</p>
        <p className="mt-0.5 truncate text-[11px] text-white/48">{meta}</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, tone = "studio" }: { label: string; value: string | number; icon: React.ElementType; tone?: PremiumTone }) {
  const t = toneClass[tone];
  return (
    <div className={cardClass(cx("p-2.5 text-center sm:p-3", t.border))}>
      <div className={cx("mx-auto grid h-8 w-8 place-items-center rounded-[13px]", t.soft, t.text)}>
        <Icon size={16} />
      </div>
      <p className="mt-2.5 truncate text-[10.5px] font-semibold text-white/42">{label}</p>
      <p className="mt-0.5 truncate text-[1.35rem] font-semibold leading-none tracking-[-0.04em] text-white sm:text-[1.65rem]">{value}</p>
    </div>
  );
}

function ActionCard({ title, subtitle, icon: Icon, onClick, tone = "studio" }: { title: string; subtitle?: string; icon: React.ElementType; onClick: () => void; tone?: PremiumTone }) {
  const t = toneClass[tone];
  return (
    <button onClick={onClick} className={cx(cardClass("group flex min-h-[4.5rem] items-center gap-3 text-right transition duration-200 hover:-translate-y-0.5 hover:border-white/18 active:translate-y-0 active:scale-[0.985]"), t.border)}>
      <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px]", t.soft, t.text)}>
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold tracking-[-0.01em]">{title}</p>
        {subtitle ? <p className="mt-1 truncate text-xs text-white/46">{subtitle}</p> : null}
      </div>
      <ChevronLeft className="shrink-0 text-white/28 transition group-hover:-translate-x-0.5" size={18} />
    </button>
  );
}

function Lessons({ user, openScreen, show }: { user: V2User; openScreen: (screen: V2Screen) => void; show: (message: string) => void }) {
  const { db, appendAudit } = useV2App();
  const classes = classesForUser(db, user);
  const groups = groupsForUser(db, user);
  return (
    <div className="space-y-3.5">
      <Header
        title="שיעורים"
        subtitle="מערכת קצרה וברורה, כמו אפליקציית אימון אישית לסטודיו."
        action={
          <div className="flex flex-wrap gap-2">
            <Button tone="ghost" onClick={() => openScreen("media_library")}>העלאת מדיה</Button>
            <Button onClick={() => openScreen("private_lessons")}>שיעור פרטי</Button>
          </div>
        }
      />
      <div className="grid gap-3 md:grid-cols-2">
        {classes.map((item) => {
          const group = db.groups.find((g) => g.id === item.groupId);
          const tone = toneForStyle(group?.style);
          const t = toneClass[tone];
          return (
            <div key={item.id} className={cardClass(cx("border-white/[0.08] bg-gradient-to-br", t.gradient))}>
              <div className="flex items-start justify-between gap-3">
                <StatusBadge tone={tone}>{group?.style}</StatusBadge>
                <div className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-[16px]", t.soft, t.text)}>
                  <CalendarDays size={18} />
                </div>
              </div>
              <h2 className="lk-text-balance mt-4 text-xl font-semibold leading-tight tracking-[-0.035em]">{item.title}</h2>
              <p className="mt-1.5 text-sm text-white/50">{item.weekday} · {item.time} · {item.room}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="min-w-0 truncate text-xs text-white/35">{group?.name}</p>
                {can(user, "manage_attendance") ? (
                  <Button
                    tone="ghost"
                    onClick={() => {
                      appendAudit(user, "סימון נוכחות נפתח", "class", item.id);
                      show("נוכחות מוכנה לסימון");
                    }}
                  >
                    סימון נוכחות
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <div className={cardClass()}>
        <SectionHeader title="קבוצות פעילות" subtitle="צבעי הסגנון נשמרים בעדינות לאורך המערכת." />
        <div className="mt-3 flex flex-wrap gap-2">
          {groups.map((group) => (
            <span key={group.id} className={cx("rounded-full border px-3 py-1.5 text-xs font-semibold", toneClass[toneForStyle(group.style)].border, toneClass[toneForStyle(group.style)].soft, toneClass[toneForStyle(group.style)].text)}>
              {group.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function groupNotificationDate(createdAt: string): "today" | "week" | "earlier" {
  const created = new Date(createdAt).getTime();
  const nowMs = Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (nowMs - created < day) return "today";
  if (nowMs - created < day * 7) return "week";
  return "earlier";
}

function formatDateTime(value: string): string {
  const [date, time = ""] = value.split("T");
  const shortTime = time.slice(0, 5);
  return shortTime ? `${date} · ${shortTime}` : date;
}

function priorityLabel(priority: V2Notification["priority"]) {
  if (priority === "urgent") return "דחוף";
  if (priority === "important") return "חשוב";
  return "רגיל";
}

function Messages({
  user,
  show,
  onOpenNotification
}: {
  user: V2User;
  show: (message: string) => void;
  onOpenNotification: (notification: V2Notification) => void;
}) {
  const { db, appendAudit, dispatch } = useV2App();
  const messages = db.messages.filter((m) => m.studioId === user.studioId || user.role === "super_admin");
  const notifications = getNotificationsForUser(db, user);
  const unread = notifications.filter((n) => !n.readByUserIds.includes(user.id));
  const groups = [
    { id: "today", title: "היום" },
    { id: "week", title: "השבוע" },
    { id: "earlier", title: "מוקדם יותר" }
  ] as const;
  return (
    <div className="space-y-3.5">
      <Header
        title="התראות והודעות"
        subtitle="כל פעולה חשובה מגיעה לכאן ומובילה למסך הרלוונטי."
        action={
          unread.length ? (
            <Button
              tone="ghost"
              onClick={() => {
                dispatch({ type: "mark_all_notifications_read", userId: user.id });
                show("כל ההתראות סומנו כנקראו");
              }}
            >
              סמן הכול כנקרא
            </Button>
          ) : null
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="חדשות" value={unread.length} icon={Bell} tone="repertoire" />
        <MetricCard label="דחופות" value={notifications.filter((n) => n.priority === "urgent").length} icon={Flag} tone="flamenco" />
        <MetricCard label="סה״כ" value={notifications.length} icon={MessageCircle} tone="modern" />
      </div>
      {groups.map((group) => {
        const items = notifications.filter((n) => groupNotificationDate(n.createdAt) === group.id);
        if (!items.length) return null;
        return (
          <section key={group.id} className="space-y-2">
            <SectionHeader title={group.title} />
            {items.map((notification) => {
              const isRead = notification.readByUserIds.includes(user.id);
              const tone = notification.priority === "urgent" ? "flamenco" : notification.priority === "important" ? "repertoire" : "studio";
              return (
                <button
                  key={notification.id}
                  onClick={() => onOpenNotification(notification)}
                  className={cx(
                    cardClass("block w-full text-right transition active:scale-[0.99]"),
                    isRead ? "opacity-70" : toneClass[tone].border
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <StatusBadge tone={tone}>{priorityLabel(notification.priority)}</StatusBadge>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-end gap-2">
                        {!isRead ? <span className="h-2 w-2 rounded-full bg-emerald-300" /> : null}
                        <p className="font-semibold">{notification.title}</p>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-white/48">{notification.body}</p>
                      <p className="mt-2 text-xs text-white/32">{formatDateTime(notification.createdAt)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </section>
        );
      })}
      {!notifications.length ? (
        <div className={cardClass("text-center")}>
          <Bell className="mx-auto text-white/28" size={28} />
          <p className="mt-3 font-semibold">אין התראות חדשות</p>
          <p className="mt-1 text-sm text-white/42">פעולות חשובות יופיעו כאן.</p>
        </div>
      ) : null}
      <SectionHeader title="עדכוני סטודיו" subtitle="הודעות כלליות מהצוות." />
      {messages.map((message) => (
        <div key={message.id} className={cardClass("border-cyan-100/14 bg-gradient-to-br from-cyan-300/8 via-white/[0.035] to-transparent")}>
          <div className="flex items-start gap-3 text-right">
            <div className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-[18px] bg-cyan-300/10 text-cyan-100">
              <Bell size={19} />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.02em]">{message.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/48">{message.body}</p>
              <p className="mt-3 text-xs text-white/30">{displayUserName(db, message.createdByUserId)}</p>
            </div>
          </div>
        </div>
      ))}
      <Button
        tone="ghost"
        onClick={() => {
          appendAudit(user, "מרכז הודעות נפתח", "messages");
          show("ההודעות זמינות לקריאה");
        }}
      >
        סמן כנקרא
      </Button>
    </div>
  );
}

function Shop({ user, show, openScreen }: { user: V2User; show: (message: string) => void; openScreen: (screen: V2Screen) => void }) {
  const { db, appendAudit, dispatch } = useV2App();
  const products = productsForShop(db);
  return (
    <div className="space-y-3.5">
      <Header title="בוטיק LK" subtitle={textValue(db, "shop.hero", "בוטיק LK, כרטיסים ושיעורים פרטיים במקום אחד")} />
      <div className={cardClass("border-yellow-100/14 bg-gradient-to-br from-yellow-300/13 via-white/[0.035] to-fuchsia-300/7 p-4")}>
        <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-yellow-200/10 blur-3xl" />
        <div className="relative flex min-w-0 flex-col gap-2.5">
          <div className="min-w-0 text-right">
            <StatusBadge tone="shop">בוטיק סטודיו נבחר</StatusBadge>
            <h2 className="lk-text-balance mt-2.5 max-w-full text-[1.42rem] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[1.85rem]">ציוד, כרטיסים ושיעור אישי</h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/62">חוויית רכישה שקטה עם תהליך תשלום ברור.</p>
          </div>
          <div className="flex items-center justify-between rounded-[14px] bg-black/18 px-3 py-2 text-[12px] text-white/42">
            <span>מוצרים זמינים</span>
            <span className="font-semibold text-white">{products.length}</span>
          </div>
        </div>
      </div>
      <SectionHeader eyebrow="חנות" title="בחירה מהירה" subtitle="קל לזהות מה מוצר, מה כרטיס ומה שיעור פרטי." />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} user={user} show={show} />
        ))}
      </div>
      {canManageShopProducts(user) ? (
        <ActionCard title="ניהול מוצרים ותמונות" subtitle="הוספה, עריכה ותמונות מוצר" icon={ImagePlus} tone="shop" onClick={() => openScreen("product_management")} />
      ) : null}
      <div className={cardClass("border-white/[0.065]")}>
        <SectionHeader title="תשלום" subtitle="אפשרויות תשלום מסודרות: אשראי, Apple Pay או Bit." />
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-[18px] border border-white/[0.07] bg-black/24 p-1">
          {["Apple Pay", "Bit", "כרטיס אשראי"].map((method) => (
            <button
              key={method}
              onClick={() => {
                const product = products.find((p) => p.type !== "private_lesson");
                if (product) dispatch({ type: "shop_order_paid", actor: user, productId: product.id });
                show("התשלום אושר");
              }}
              className="min-w-0 rounded-[14px] px-2 py-2.5 text-center text-[12px] font-semibold text-white/62 transition hover:bg-white/[0.05] active:scale-[0.99]"
            >
              {method}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  function ProductCard({ product, user, show }: { product: V2Product; user: V2User; show: (message: string) => void }) {
    const media = productFeaturedMedia(db, product);
    return (
      <div
        className={cardClass(
          cx(
            "group flex flex-col justify-between p-0 transition duration-200 hover:-translate-y-1 active:translate-y-0",
            product.type === "ticket" && "border-amber-100/18 bg-gradient-to-br from-amber-300/15 via-white/[0.035] to-black/10",
            product.type === "private_lesson" && "border-emerald-100/18 bg-gradient-to-br from-emerald-300/13 via-cyan-300/6 to-black/10",
            product.type === "product" && "border-fuchsia-100/14 bg-gradient-to-br from-fuchsia-300/10 via-white/[0.035] to-black/10"
          )
        )}
      >
        <div className="relative grid h-20 place-items-center overflow-hidden border-b border-white/[0.06] bg-black/20 sm:h-24">
        {media?.localPreviewUrl ? (
            <img src={media.localPreviewUrl} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <div className={cx("grid h-12 w-12 place-items-center rounded-[18px]", product.type === "private_lesson" ? toneClass.studio.soft : toneClass.shop.soft)}>
            <ShoppingBag className={product.type === "private_lesson" ? toneClass.studio.text : toneClass.shop.text} size={20} />
          </div>
        )}
          <div className="absolute right-2 top-2 scale-90 origin-top-right">
            <StatusBadge tone={product.type === "ticket" ? "repertoire" : product.type === "private_lesson" ? "studio" : "hiphop"}>
              {product.type === "ticket" ? "כרטיס" : product.type === "private_lesson" ? "פרטי" : "בוטיק"}
            </StatusBadge>
          </div>
        </div>
            <div className="min-w-0 p-3">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="lk-text-balance text-[1.05rem] font-semibold leading-tight tracking-[-0.025em]">{product.title}</h2>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-white/58">{product.description}</p>
                </div>
                <p className="shrink-0 rounded-full bg-white/[0.055] px-2.5 py-1 text-[1rem] font-semibold leading-none tracking-[-0.03em]">₪{product.price}</p>
              </div>
              {product.type === "private_lesson" ? (
                <div className="mt-3 flex items-center justify-between rounded-[14px] bg-white/[0.035] px-3 py-2 text-[11px] text-white/42">
                  <span>זמינות מורה</span>
                  <span className="font-semibold text-emerald-100">בתיאום</span>
                </div>
              ) : null}
            </div>
            <div className="flex min-w-0 items-center justify-between gap-2 border-t border-white/[0.06] p-3 pt-2.5">
              <p className="min-w-0 truncate text-[11px] text-white/34">{product.category ?? "חנות הסטודיו"}</p>
              <Button
                onClick={() => {
                  appendAudit(user, product.type === "private_lesson" ? "פתיחת בקשת שיעור פרטי" : "פתיחת תשלום חנות", "product", product.id);
                  if (product.type !== "private_lesson") {
                    dispatch({ type: "shop_order_created", actor: user, productId: product.id });
                  }
                  show(product.type === "private_lesson" ? "בחרו מורה ומועד בשיעורים פרטיים" : "ההזמנה נוצרה");
                }}
              >
                {product.type === "private_lesson" ? "זמינות" : "רכישה"}
              </Button>
            </div>
      </div>
    );
  }
}

function More({ user, openScreen }: { user: V2User; openScreen: (screen: V2Screen) => void }) {
  const sections = [
    {
      title: "הסטודיו",
      items: [
        { title: "שיעורים פרטיים", subtitle: "בקשות, מורים ותשלום", icon: Receipt, tone: "shop" as PremiumTone, screen: "private_lessons" as V2Screen },
        ...(canAccessTeacherDashboard(user)
          ? [{ title: "ספריית מדיה", subtitle: "תמונות ווידאו לקבוצות", icon: ImagePlus, tone: "modern" as PremiumTone, screen: "media_library" as V2Screen }]
          : [])
      ]
    },
    {
      title: "כלים למורה",
      items: canAccessTeacherDashboard(user)
        ? [{ title: "לוח מורה", subtitle: "מהיר וברור", icon: School, tone: "studio" as PremiumTone, screen: "teacher" as V2Screen }]
        : []
    },
    {
      title: "ניהול",
      items: canAccessManagement(user)
        ? [
            { title: "ניהול סטודיו", subtitle: "משתמשים וניהול יומי", icon: Shield, tone: "management" as PremiumTone, screen: "management" as V2Screen },
            { title: "ניהול מוצרים", subtitle: "מוצרים, תמונות ומלאי", icon: ShoppingBag, tone: "shop" as PremiumTone, screen: "product_management" as V2Screen }
          ]
        : []
    },
    {
      title: "ניהול האפליקציה",
      items: canAccessSuperAdmin(user)
        ? [{ title: "ניהול האפליקציה", subtitle: "נתונים, הרשאות ויומן פעולות", icon: Database, tone: "admin" as PremiumTone, screen: "super_admin" as V2Screen }]
        : []
    }
  ].filter((section) => section.items.length);
  return (
    <div className="space-y-3.5">
      <Header title="עוד" subtitle="מפת דרכים מסודרת לפי תפקיד, בלי עומס ובלי טאבים נעלמים." />
      {sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <SectionHeader title={section.title} />
          <div className="grid gap-3 md:grid-cols-2">
            {section.items.map((item) => (
              <ActionCard key={item.title} title={item.title} subtitle={item.subtitle} icon={item.icon} tone={item.tone} onClick={() => openScreen(item.screen)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Back({ onBack }: { onBack: () => void }) {
  return (
    <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-100/80">
      <ChevronLeft size={16} />
      חזרה
    </button>
  );
}

function TeacherDashboard({ user, show, onBack }: { user: V2User; show: (message: string) => void; onBack: () => void }) {
  const { db, dispatch } = useV2App();
  const classes = classesForUser(db, user);
  const requests = privateLessonRequestsForUser(db, user);
  return (
    <div className="space-y-3.5">
      <Back onBack={onBack} />
      <Header title="לוח מורה" subtitle="מבט מהיר לשיעורים, תלמידים ובקשות פרטיות." />
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard label="שיעורים" value={classes.length} icon={CalendarDays} tone="studio" />
        <MetricCard label="בקשות פרטיות" value={requests.length} icon={Receipt} tone="shop" />
        <MetricCard label="קבוצות" value={user.groupIds.length} icon={Users} tone={toneForStyle(user.style)} />
      </div>
      <div className={cardClass("border-emerald-100/12")}>
        <SectionHeader title="בקשות שיעור פרטי" subtitle="מורה מציע מועד, התלמיד או ההורה מאשרים ואז נפתח תשלום." />
        <div className="mt-3 space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="rounded-[20px] border border-white/[0.08] bg-black/24 p-4 text-right">
              <div className="flex items-start justify-between gap-3">
                <StatusBadge tone="shop">₪{request.price}</StatusBadge>
                <div>
                  <p className="font-semibold">{displayUserName(db, request.studentId)}</p>
                  <p className="mt-1 text-xs text-white/42">{request.duration} דק׳ · {request.status}</p>
                </div>
              </div>
              <Button
                tone="ghost"
                onClick={() => {
                  dispatch({ type: "suggest_lesson_slot", actor: user, requestId: request.id, slot: "יום שני 17:00" });
                  show("מועד נשלח לתלמיד/ה");
                }}
              >
                הצע מועד
              </Button>
              <Button
                tone="danger"
                onClick={() => {
                  dispatch({ type: "mark_teacher_unavailable", actor: user, requestId: request.id });
                  show("נשלחה הודעה שאין זמינות כרגע");
                }}
              >
                אין זמינות
              </Button>
            </div>
          ))}
          {!requests.length ? <p className="text-sm text-white/42">אין בקשות כרגע.</p> : null}
        </div>
      </div>
    </div>
  );
}

function ManagementDashboard({ user, openScreen, onBack }: { user: V2User; openScreen: (screen: V2Screen) => void; onBack: () => void }) {
  const { db } = useV2App();
  const studioUsers = db.users.filter((u) => u.studioId === user.studioId);
  return (
    <div className="space-y-3.5">
      <Back onBack={onBack} />
      <Header title="ניהול סטודיו" subtitle="מבט נקי: אנשים, קבוצות, חנות ומשימות יום־יומיות." />
      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard label="תלמידים" value={studioUsers.filter((u) => u.role === "student").length} icon={UserRound} tone="hiphop" />
        <MetricCard label="מורים" value={studioUsers.filter((u) => u.role === "teacher").length} icon={School} tone="studio" />
        <MetricCard label="קבוצות" value={db.groups.length} icon={Users} tone="management" />
        <MetricCard label="מוצרים" value={db.products.length} icon={ShoppingBag} tone="shop" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <ActionCard title="ניהול משתמשים" subtitle="טלפון, סיסמה והרשאות" icon={Users} tone="management" onClick={() => openScreen("users")} />
        <ActionCard title="שיעורים פרטיים" subtitle="בקשות, מורים ותשלום" icon={Receipt} tone="shop" onClick={() => openScreen("private_lessons")} />
      </div>
    </div>
  );
}

function SuperAdminHub({ user, openScreen, onBack }: { user: V2User; openScreen: (screen: V2Screen) => void; onBack: () => void }) {
  return (
    <div className="space-y-3.5">
      <Back onBack={onBack} />
      <Header title="ניהול האפליקציה" subtitle="אלון בליטי · נתונים, הרשאות, טקסטים ויומן פעולות." />
      <div className="grid gap-3 md:grid-cols-2">
        <ActionCard title="ניהול משתמשים" subtitle="כל התפקידים וההרשאות" icon={Users} tone="admin" onClick={() => openScreen("users")} />
        <ActionCard title="ספריית מדיה" subtitle="פרטים, נראות וקישורים" icon={ImagePlus} tone="modern" onClick={() => openScreen("media_library")} />
        <ActionCard title="ניהול מוצרים" subtitle="חנות, תמונות ומלאי" icon={ShoppingBag} tone="shop" onClick={() => openScreen("product_management")} />
        <ActionCard title="ייצוא / ייבוא מסד" subtitle="גיבוי והחלפת מסד" icon={Database} tone="admin" onClick={() => openScreen("database")} />
        <ActionCard title="עריכת טקסטים" subtitle="טקסטים מהמסד" icon={Sparkles} tone="repertoire" onClick={() => openScreen("texts")} />
        <ActionCard title="יומן פעולות" subtitle="פעולות רגישות" icon={ClipboardList} tone="management" onClick={() => openScreen("audit")} />
        <ActionCard title="אפשרויות" subtitle="הפעלה וכיבוי" icon={Flag} tone="admin" onClick={() => openScreen("flags")} />
        {can(user, "manage_private_lessons") ? <ActionCard title="שיעורים פרטיים" subtitle="בקשות, תיאום ותשלום" icon={Receipt} tone="shop" onClick={() => openScreen("private_lessons")} /> : null}
      </div>
    </div>
  );
}

function defaultPermissions(role: V2Role): V2User["permissions"] {
  const empty = Object.fromEntries(permissionKeys.map((key) => [key, false])) as V2User["permissions"];
  if (role === "super_admin") return Object.fromEntries(permissionKeys.map((key) => [key, true])) as V2User["permissions"];
  if (role === "management") {
    return { ...empty, manage_users: true, edit_credentials: true, edit_permissions: true, export_import_db: true, edit_text: true, view_audit: true, manage_studio: true, manage_attendance: true, manage_shop: true, manage_private_lessons: true };
  }
  if (role === "teacher") return { ...empty, manage_attendance: true, manage_private_lessons: true, teacher_dashboard: true };
  return empty;
}

function UserManagement({ actor, show, onBack }: { actor: V2User; show: (message: string) => void; onBack: () => void }) {
  const { db, dispatch } = useV2App();
  const [selectedId, setSelectedId] = useState(db.users[0]?.id ?? "");
  const visibleUsers = usersForActor(db, actor);
  const [roleFilter, setRoleFilter] = useState<V2Role | "all">("all");
  const filteredUsers = roleFilter === "all" ? visibleUsers : visibleUsers.filter((u) => u.role === roleFilter);
  const selectedFromDb = db.users.find((u) => u.id === selectedId) ?? visibleUsers[0];
  const [editorOpen, setEditorOpen] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const selected: V2User | undefined = addMode
    ? {
        id: `u_new_${Date.now()}`,
        studioId: actor.studioId,
        name: "משתמש חדש",
        phone: "",
        role: "student",
        groupIds: [],
        linkedStudentIds: [],
        permissions: defaultPermissions("student"),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    : selectedFromDb;
  const [name, setName] = useState(selectedFromDb?.name ?? "");
  const [phone, setPhone] = useState(selectedFromDb?.phone ?? "");
  const [password, setPassword] = useState(db.credentials.find((c) => c.userId === selectedFromDb?.id)?.password ?? "");
  const [role, setRole] = useState<V2Role>(selectedFromDb?.role ?? "student");
  const selectedTone = toneForRole(selected?.role ?? "student");

  function loadUser(user: V2User) {
    setAddMode(false);
    setSelectedId(user.id);
    setName(user.name);
    setPhone(user.phone);
    setPassword(db.credentials.find((c) => c.userId === user.id)?.password ?? "");
    setRole(user.role);
    setEditorOpen(true);
  }

  function openAddUser() {
    setAddMode(true);
    setName("");
    setPhone("");
    setPassword("");
    setRole("student");
    setEditorOpen(true);
  }

  function save() {
    if (!selected) return;
    const id = addMode ? `u_${Date.now().toString(36)}` : selected.id;
    const next: V2User = {
      ...selected,
      id,
      name: name.trim() || "משתמש חדש",
      phone,
      role,
      permissions: role === selected.role && !addMode ? selected.permissions : defaultPermissions(role)
    };
    dispatch({ type: "upsert_user", actor, user: next, credential: { userId: id, phone, password, updatedAt: new Date().toISOString() } });
    if (addMode) {
      setSelectedId(id);
      setAddMode(false);
    }
    show(addMode ? "המשתמש נוצר" : "המשתמש נשמר");
  }

  return (
    <div className="space-y-3.5">
      <Back onBack={onBack} />
      <Header
        title="ניהול משתמשים"
        subtitle="טלפון, סיסמה והרשאות ממסד הנתונים. מקצועי, רגוע ומהיר."
        action={<Button onClick={openAddUser}>משתמש חדש</Button>}
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MetricCard label="משתמשים" value={visibleUsers.length} icon={Users} tone="management" />
        <MetricCard label="תלמידים" value={visibleUsers.filter((u) => u.role === "student").length} icon={UserRound} tone="hiphop" />
        <MetricCard label="מורים" value={visibleUsers.filter((u) => u.role === "teacher").length} icon={School} tone="studio" />
        <MetricCard label="ניהול" value={visibleUsers.filter((u) => u.role === "management" || u.role === "super_admin").length} icon={Shield} tone="admin" />
      </div>
      <div className="grid min-w-0 gap-3 lg:grid-cols-[1fr_1.15fr]">
        <div className={cardClass("space-y-3")}>
          <SectionHeader title="אנשים" subtitle="לחיצה פותחת עריכה מיידית בהקשר המשתמש." />
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
            {(["all", "student", "parent", "teacher", "management", "super_admin"] as Array<V2Role | "all">).map((item) => (
              <button
                key={item}
                onClick={() => setRoleFilter(item)}
                className={cx(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition",
                  roleFilter === item ? "border-white/28 bg-white text-black" : "border-white/[0.09] bg-white/[0.035] text-white/48"
                )}
              >
                {item === "all" ? "הכול" : roleLabel[item]}
              </button>
            ))}
          </div>
          <div className="max-h-[52svh] space-y-2 overflow-y-auto pr-0.5 scroll-touch lg:max-h-none">
          {filteredUsers.map((u) => {
            const t = toneClass[toneForRole(u.role)];
            return (
            <button
              key={u.id}
              onClick={() => loadUser(u)}
              className={cx(
                "flex w-full items-center justify-between gap-3 rounded-[20px] border px-3 py-3 text-right transition active:scale-[0.99]",
                selected?.id === u.id ? "border-white/24 bg-white text-black" : "border-white/[0.075] bg-white/[0.035] text-white hover:border-white/14"
              )}
            >
              <ChevronLeft className={cx("shrink-0", selected?.id === u.id ? "text-black/45" : "text-white/24")} size={17} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{u.name}</p>
                <p className={cx("mt-0.5 truncate text-xs", selected?.id === u.id ? "text-black/55" : "text-white/42")}>{roleLabel[u.role]} · {u.phone}</p>
              </div>
              <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-[15px] text-xs font-bold", selected?.id === u.id ? "bg-black/10 text-black" : cx(t.soft, t.text))}>
                {u.name.slice(0, 1)}
              </span>
            </button>
          );})}
          </div>
        </div>
        {selected ? (
          <div className={cardClass(cx("hidden space-y-4 lg:block", toneClass[selectedTone].border, "bg-gradient-to-br", toneClass[selectedTone].gradient))}>
            <div className="flex items-start justify-between gap-4">
              <StatusBadge tone={selectedTone}>{roleLabel[selected.role]}</StatusBadge>
              <div className="text-right">
                <h2 className="text-2xl font-semibold tracking-[-0.04em]">{selected.name}</h2>
                <p className="mt-1 text-xs text-white/42">השינויים נשמרים ביומן הפעולות</p>
              </div>
            </div>
            <Field label="שם" value={name} onChange={setName} />
            <Field label="טלפון" value={phone} onChange={setPhone} />
            <Field label="סיסמה" value={password} onChange={setPassword} />
            <label className="block text-right">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/38">תפקיד</span>
              <select value={role} onChange={(e) => setRole(e.target.value as V2Role)} className="mt-2 w-full rounded-[18px] border border-white/[0.09] bg-black/30 px-4 py-3 text-white">
                {Object.entries(roleLabel).map(([id, label]) => (
                  <option key={id} value={id} className="bg-zinc-950">{label}</option>
                ))}
              </select>
            </label>
            <SectionHeader title="הרשאות" subtitle="עריכה נקודתית בלי טבלה כבדה." />
            <div className="grid gap-2 sm:grid-cols-2">
              {permissionKeys.map((key) => (
                <label key={key} className="flex min-h-11 items-center justify-between gap-3 rounded-[18px] border border-white/[0.08] bg-black/22 px-3 py-2 text-xs font-semibold text-white/62">
                  <input
                    type="checkbox"
                    checked={Boolean(selected.permissions[key])}
                    onChange={(e) =>
                      dispatch({ type: "update_user_permissions", actor, userId: selected.id, permissions: { [key]: e.target.checked } })
                    }
                  />
                  {permissionLabel[key]}
                </label>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
              <p className="text-xs text-white/38">טלפון וסיסמה מתעדכנים במסד.</p>
              <div className="flex gap-2">
                <Button tone="ghost" onClick={() => setResetOpen(true)}>איפוס סיסמה</Button>
                <Button onClick={save}>
                  <span className="inline-flex items-center gap-2"><KeyRound size={16} /> שמירה</span>
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      {editorOpen && selected ? (
        <div className="fixed inset-0 z-[75] flex items-end bg-black/62 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-safe backdrop-blur-sm lg:hidden">
          <motion.div
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cardClass(cx("max-h-[86dvh] w-full overflow-y-auto rounded-[24px] p-4", toneClass[selectedTone].border))}
          >
            <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 flex items-center justify-between border-b border-white/[0.08] bg-zinc-950/92 px-4 py-3 backdrop-blur">
              <Button tone="ghost" onClick={() => setEditorOpen(false)}>סגירה</Button>
              <div className="text-right">
                <p className="text-lg font-semibold">{addMode ? "משתמש חדש" : selected.name}</p>
                <p className="text-xs text-white/40">{roleLabel[role]}</p>
              </div>
            </div>
            <div className="space-y-4">
              <Field label="שם" value={name} onChange={setName} />
              <Field label="טלפון" value={phone} onChange={setPhone} />
              <Field label="סיסמה" value={password} onChange={setPassword} />
              <label className="block text-right">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/38">תפקיד</span>
                <select value={role} onChange={(e) => setRole(e.target.value as V2Role)} className="mt-2 w-full rounded-[18px] border border-white/[0.09] bg-black/30 px-4 py-3 text-white">
                  {Object.entries(roleLabel).map(([id, label]) => (
                    <option key={id} value={id} className="bg-zinc-950">{label}</option>
                  ))}
                </select>
              </label>
              <div className="grid gap-2">
                {permissionKeys.map((key) => (
                  <label key={key} className="flex min-h-11 items-center justify-between gap-3 rounded-[18px] border border-white/[0.08] bg-black/22 px-3 py-2 text-xs font-semibold text-white/62">
                    <input
                      type="checkbox"
                      checked={Boolean(selected.permissions[key])}
                      onChange={(e) =>
                        dispatch({ type: "update_user_permissions", actor, userId: selected.id, permissions: { [key]: e.target.checked } })
                      }
                    />
                    {permissionLabel[key]}
                  </label>
                ))}
              </div>
              <div className="sticky bottom-0 -mx-4 -mb-4 flex gap-2 border-t border-white/[0.08] bg-zinc-950/94 px-4 py-3 backdrop-blur">
                <Button tone="ghost" onClick={() => setResetOpen(true)}>איפוס</Button>
                <Button onClick={() => { save(); setEditorOpen(false); }}>שמירה</Button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
      {resetOpen && selected ? (
        <div className="fixed inset-0 z-[85] grid place-items-center bg-black/68 px-4 backdrop-blur-sm">
          <div className={cardClass("w-full max-w-sm space-y-4")}>
            <SectionHeader title={`איפוס סיסמה · ${selected.name}`} subtitle="הסיסמה נשמרת במסד ונשלחת כהתראה למשתמש." />
            <Field label="סיסמה חדשה" value={password} onChange={setPassword} />
            <div className="flex gap-2">
              <Button tone="ghost" onClick={() => setResetOpen(false)}>ביטול</Button>
              <Button
                onClick={() => {
                  dispatch({ type: "update_credential", actor, userId: selected.id, phone, password });
                  setResetOpen(false);
                  show("הסיסמה עודכנה");
                }}
              >
                עדכון סיסמה
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DatabaseTools({ actor, show, onBack }: { actor: V2User; show: (message: string) => void; onBack: () => void }) {
  const { db, exportDatabase, importDatabase, validationWarnings } = useV2App();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-3.5">
      <Back onBack={onBack} />
      <Header title="מסד נתונים" subtitle="ייצוא וייבוא למסד. האפליקציה נפתחת מיד גם אם הייבוא נכשל." />
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard label="משתמשים" value={db.users.length} icon={Users} tone="management" />
        <MetricCard label="יומן" value={db.auditLog.length} icon={ClipboardList} tone="admin" />
        <MetricCard label="גרסה" value={db.version} icon={Database} tone="studio" />
      </div>
      <div className={cardClass("space-y-3")}>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportDatabase}>
            <span className="inline-flex items-center gap-2"><Download size={16} /> ייצוא מסד</span>
          </Button>
          <Button tone="ghost" onClick={() => inputRef.current?.click()}>
            <span className="inline-flex items-center gap-2"><Upload size={16} /> ייבוא מסד</span>
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const result = await importDatabase(file);
            show(result.ok === false ? result.reason : "מסד הנתונים יובא");
          }}
        />
        {validationWarnings.length ? <p className="text-sm text-amber-100/70">{validationWarnings.join(" · ")}</p> : null}
        <p className="text-xs text-white/36">פעולה על ידי {actor.name}</p>
      </div>
    </div>
  );
}

function TextEditor({ actor, show, onBack }: { actor: V2User; show: (message: string) => void; onBack: () => void }) {
  const { db, dispatch } = useV2App();
  return (
    <div className="space-y-3.5">
      <Back onBack={onBack} />
      <Header title="עריכת טקסטים" subtitle="מיקרוקופי חשוב נשמר במסד, כדי שהמוצר יישאר ניתן לעריכה." />
      <div className="space-y-3">
        {db.editableTexts.map((item) => (
          <div key={item.key} className={cardClass("space-y-3 border-white/[0.075]")}>
            <p className="text-xs text-white/38">{item.key}</p>
            <input
              defaultValue={item.value}
              onBlur={(e) => {
                dispatch({ type: "update_text", actor, key: item.key, value: e.target.value });
                show("טקסט נשמר");
              }}
              className="w-full rounded-2xl border border-white/[0.09] bg-black/30 px-4 py-3 text-right text-white outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditLog({ onBack }: { onBack: () => void }) {
  const { db } = useV2App();
  return (
    <div className="space-y-3.5">
      <Back onBack={onBack} />
      <Header title="יומן פעולות" subtitle="כל פעולה רגישה נשמרת בשפה ברורה." />
      <div className="space-y-2">
        {db.auditLog.slice(0, 50).map((entry) => (
          <div key={entry.id} className={cardClass("!p-4")}>
            <p className="font-semibold">{entry.action}</p>
            <p className="mt-1 text-xs text-white/42">{entry.actorName} · {entry.targetType} · {formatDateTime(entry.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureFlags({ actor, show, onBack }: { actor: V2User; show: (message: string) => void; onBack: () => void }) {
  const { db, dispatch } = useV2App();
  return (
    <div className="space-y-3.5">
      <Back onBack={onBack} />
      <Header title="ניהול יכולות" subtitle="המשטחים המרכזיים זמינים תמיד; הדגלים נשארים לניהול מבוקר." />
      <div className={cardClass("space-y-2")}>
        {Object.entries(db.featureFlags).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => {
                dispatch({ type: "update_flags", actor, flags: { [key]: e.target.checked } });
                show("פיצ׳ר עודכן");
              }}
            />
            <span className="text-sm font-semibold">{key}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

const shopCategories: V2ShopCategory[] = [
  "בגדי סטודיו",
  "חולצות ממותגות",
  "נעלי ריקוד",
  "גרבי ריקוד",
  "אביזרים",
  "כרטיסים למופעים",
  "שיעורים פרטיים",
  "סדנאות / מחנות"
];

const stockStatuses: Array<{ id: V2StockStatus; label: string }> = [
  { id: "in_stock", label: "במלאי" },
  { id: "low_stock", label: "מלאי נמוך" },
  { id: "sold_out", label: "אזל" },
  { id: "preorder", label: "הזמנה מוקדמת" }
];

function MediaLibraryScreen({ user, show, onBack }: { user: V2User; show: (message: string) => void; onBack: () => void }) {
  const { db, dispatch } = useV2App();
  const [uploadOpen, setUploadOpen] = useState(false);
  const groups = user.role === "teacher" ? db.groups.filter((group) => user.groupIds.includes(group.id)) : db.groups;
  return (
    <div className="space-y-3.5">
      <Back onBack={onBack} />
      <Header
        title="ספריית מדיה"
        subtitle="תמונות ווידאו לקבוצות ולחנות. הקבצים עצמם נשמרים כתצוגה מקומית בשלב זה."
        action={<Button onClick={() => setUploadOpen(true)}>העלאת מדיה</Button>}
      />
      <MediaLibrary
        user={user}
        items={db.mediaItems}
        groups={db.groups}
        products={db.products}
        onArchive={(item) => {
          dispatch({ type: "media_archived", actor: user, mediaId: item.id });
          show("המדיה אורכבה");
        }}
      />
      {uploadOpen ? (
        <div className="fixed inset-0 z-[85] flex items-end bg-black/68 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-safe backdrop-blur-sm sm:items-center sm:justify-center">
          <div className="max-h-[88dvh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-white/[0.1] bg-zinc-950 p-4 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <Button tone="ghost" onClick={() => setUploadOpen(false)}>סגירה</Button>
              <SectionHeader title="העלאת תמונה או וידאו" subtitle={user.role === "teacher" ? "מורים יכולים לבחור רק קבוצות משויכות." : "ניתן לשייך לקבוצה, מוצר או נראות צוות."} />
            </div>
            <MediaUploader
              user={user}
              groups={groups}
              products={db.products}
              mode="library"
              onCancel={() => setUploadOpen(false)}
              onSave={(item) => {
                dispatch({ type: "media_saved", actor: user, item });
                setUploadOpen(false);
                show("המדיה נשמרה");
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProductManagement({ user, show, onBack }: { user: V2User; show: (message: string) => void; onBack: () => void }) {
  const { db, dispatch } = useV2App();
  const [selectedId, setSelectedId] = useState(db.products[0]?.id ?? "");
  const selected = db.products.find((product) => product.id === selectedId);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [title, setTitle] = useState(selected?.title ?? "");
  const [description, setDescription] = useState(selected?.description ?? "");
  const [price, setPrice] = useState(String(selected?.price ?? 0));
  const [category, setCategory] = useState<V2ShopCategory>(selected?.category ?? "אביזרים");
  const [stockStatus, setStockStatus] = useState<V2StockStatus>(selected?.stockStatus ?? "in_stock");
  const [sizes, setSizes] = useState((selected?.sizes ?? []).join(", "));
  const [colors, setColors] = useState((selected?.colors ?? []).join(", "));
  const [active, setActive] = useState(selected?.isActive ?? true);

  function loadProduct(product: V2Product) {
    setSelectedId(product.id);
    setTitle(product.title);
    setDescription(product.description);
    setPrice(String(product.price));
    setCategory(product.category ?? "אביזרים");
    setStockStatus(product.stockStatus ?? "in_stock");
    setSizes((product.sizes ?? []).join(", "));
    setColors((product.colors ?? []).join(", "));
    setActive(product.isActive);
  }

  function newProduct() {
    setSelectedId("");
    setTitle("");
    setDescription("");
    setPrice("0");
    setCategory("אביזרים");
    setStockStatus("in_stock");
    setSizes("");
    setColors("");
    setActive(true);
  }

  function saveProduct(featuredMediaId?: string) {
    const id = selectedId || `prod_${Date.now().toString(36)}`;
    const previous = db.products.find((product) => product.id === id);
    const product: V2Product = {
      id,
      studioId: user.studioId,
      type: category === "כרטיסים למופעים" ? "ticket" : category === "שיעורים פרטיים" ? "private_lesson" : "product",
      title: title.trim() || "מוצר חדש",
      description: description.trim(),
      price: Number(price) || 0,
      category,
      stockStatus,
      sizes: sizes.split(",").map((item) => item.trim()).filter(Boolean),
      colors: colors.split(",").map((item) => item.trim()).filter(Boolean),
      imageMediaIds: featuredMediaId ? [...new Set([...(previous?.imageMediaIds ?? []), featuredMediaId])] : previous?.imageMediaIds ?? [],
      featuredImageMediaId: featuredMediaId ?? previous?.featuredImageMediaId,
      isActive: active
    };
    dispatch({ type: "upsert_product", actor: user, product });
    setSelectedId(id);
    show("המוצר נשמר");
  }

  const productMedia = selected ? db.mediaItems.filter((item) => item.linkedProductId === selected.id || selected.imageMediaIds?.includes(item.id)) : [];

  if (!canManageShopProducts(user)) {
    return (
      <div className="space-y-3.5">
        <Back onBack={onBack} />
        <Header title="ניהול מוצרים" subtitle="אין הרשאה לניהול מוצרים." />
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <Back onBack={onBack} />
      <Header title="ניהול מוצרים" subtitle="הוספה, עריכה, תמונות, מלאי וזמינות בחנות." action={<Button onClick={newProduct}>מוצר חדש</Button>} />
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className={cardClass("space-y-2")}>
          {db.products.map((product) => (
            <button key={product.id} onClick={() => loadProduct(product)} className={cx("w-full rounded-[20px] border px-3 py-3 text-right transition", selectedId === product.id ? "border-white/28 bg-white text-black" : "border-white/[0.08] bg-white/[0.035] text-white")}>
              <p className="font-semibold">{product.title}</p>
              <p className="mt-1 text-xs opacity-70">₪{product.price} · {product.category ?? "ללא קטגוריה"}</p>
            </button>
          ))}
        </div>
        <div className={cardClass("space-y-4")}>
          <Field label="שם מוצר" value={title} onChange={setTitle} />
          <label className="block text-right">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/38">תיאור</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 min-h-20 w-full rounded-[18px] border border-white/[0.09] bg-black/28 px-4 py-3 text-right text-white outline-none" />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="מחיר" value={price} onChange={setPrice} />
            <label className="block text-right">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/38">קטגוריה</span>
              <select value={category} onChange={(e) => setCategory(e.target.value as V2ShopCategory)} className="mt-2 w-full rounded-[18px] border border-white/[0.09] bg-black/28 px-4 py-3 text-white">
                {shopCategories.map((item) => <option key={item} value={item} className="bg-zinc-950">{item}</option>)}
              </select>
            </label>
            <label className="block text-right">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/38">מלאי</span>
              <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value as V2StockStatus)} className="mt-2 w-full rounded-[18px] border border-white/[0.09] bg-black/28 px-4 py-3 text-white">
                {stockStatuses.map((item) => <option key={item.id} value={item.id} className="bg-zinc-950">{item.label}</option>)}
              </select>
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="מידות" value={sizes} onChange={setSizes} placeholder="S, M, L" />
            <Field label="צבעים" value={colors} onChange={setColors} placeholder="שחור, לבן" />
          </div>
          <label className="flex items-center justify-between rounded-[18px] border border-white/[0.08] bg-black/20 px-3 py-3 text-sm font-semibold text-white/62">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            פעיל בחנות
          </label>
          {productMedia.length ? (
            <div>
              <SectionHeader title="תמונות מוצר" />
              <MediaPicker items={productMedia} selectedId={selected?.featuredImageMediaId} onSelect={(item) => saveProduct(item.id)} />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => saveProduct()}>שמירת מוצר</Button>
            <Button tone="ghost" onClick={() => setUploadOpen(true)} disabled={!selectedId || !canAttachMediaToProduct(user)}>העלאת תמונת מוצר</Button>
            {selected ? <Button tone="danger" onClick={() => { dispatch({ type: "archive_product", actor: user, productId: selected.id }); show("המוצר אורכב"); }}>ארכוב</Button> : null}
          </div>
        </div>
      </div>
      {uploadOpen && selected ? (
        <div className="fixed inset-0 z-[85] flex items-end bg-black/68 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-safe backdrop-blur-sm sm:items-center sm:justify-center">
          <div className="max-h-[88dvh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-white/[0.1] bg-zinc-950 p-4 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <Button tone="ghost" onClick={() => setUploadOpen(false)}>סגירה</Button>
              <SectionHeader title={`תמונה עבור ${selected.title}`} />
            </div>
            <MediaUploader
              user={user}
              groups={db.groups}
              products={[selected]}
              mode="product"
              onCancel={() => setUploadOpen(false)}
              onSave={(item) => {
                dispatch({ type: "media_saved", actor: user, item });
                saveProduct(item.id);
                setUploadOpen(false);
                show("תמונת המוצר נשמרה");
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PrivateLessons({ user, show, onBack }: { user: V2User; show: (message: string) => void; onBack: () => void }) {
  const { db, dispatch } = useV2App();
  const userStudents = user.role === "parent" ? db.users.filter((u) => user.linkedStudentIds.includes(u.id)) : user.role === "student" ? [user] : students(db);
  const teacherOptions = teachers(db);
  const [studentId, setStudentId] = useState(userStudents[0]?.id ?? "");
  const [teacherId, setTeacherId] = useState(teacherOptions[0]?.id ?? "");
  const [duration, setDuration] = useState<V2PrivateLessonDuration>(30);
  const [note, setNote] = useState("");
  const requests = privateLessonRequestsForUser(db, user);

  return (
    <div className="space-y-3.5">
      <Back onBack={onBack} />
      <Header title="שיעורים פרטיים" subtitle="בקשת זמינות, הצעת מועד, בחירה ואז תשלום. פשוט ויוקרתי." />
      <div className={cardClass("space-y-4 border-emerald-100/16 bg-gradient-to-br from-emerald-300/12 via-white/[0.035] to-cyan-300/6")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-white/[0.09] bg-black/22 p-4 text-right">
            <p className="text-xs text-white/38">שיעור 30 דקות</p>
            <p className="mt-1 text-3xl font-semibold">₪150</p>
          </div>
          <div className="rounded-[22px] border border-white/[0.09] bg-black/22 p-4 text-right">
            <p className="text-xs text-white/38">שיעור 45 דקות</p>
            <p className="mt-1 text-3xl font-semibold">₪225</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-right">
            <span className="text-xs text-white/38">תלמיד/ה</span>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="mt-2 w-full rounded-[18px] border border-white/[0.09] bg-black/30 px-4 py-3 text-white">
              {userStudents.map((s) => <option key={s.id} value={s.id} className="bg-zinc-950">{s.name}</option>)}
            </select>
          </label>
          <label className="text-right">
            <span className="text-xs text-white/38">מורה</span>
            <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="mt-2 w-full rounded-[18px] border border-white/[0.09] bg-black/30 px-4 py-3 text-white">
              {teacherOptions.map((t) => <option key={t.id} value={t.id} className="bg-zinc-950">{t.name}</option>)}
            </select>
          </label>
          <label className="text-right">
            <span className="text-xs text-white/38">משך</span>
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value) as V2PrivateLessonDuration)} className="mt-2 w-full rounded-[18px] border border-white/[0.09] bg-black/30 px-4 py-3 text-white">
              <option value={30} className="bg-zinc-950">30 דק׳ · ₪150</option>
              <option value={45} className="bg-zinc-950">45 דק׳ · ₪225</option>
            </select>
          </label>
        </div>
        <Field label="הערה למורה" value={note} onChange={setNote} />
        <Button
          onClick={() => {
            dispatch({ type: "request_private_lesson", actor: user, studentId, teacherId, duration, note });
            setNote("");
            show(`בקשת זמינות נשלחה · ₪${privateLessonPrice(duration)}`);
          }}
          disabled={!studentId || !teacherId}
        >
          בקשת זמינות מהמורה
        </Button>
      </div>
      <div className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className={cardClass("border-yellow-100/12")}>
            <div className="flex items-start justify-between gap-3">
              <StatusBadge tone="shop">{request.status}</StatusBadge>
              <div className="text-right">
                <p className="font-semibold">{displayUserName(db, request.studentId)} עם {displayUserName(db, request.teacherId)}</p>
                <p className="mt-1 text-sm text-white/45">{request.duration} דק׳ · ₪{request.price}</p>
              </div>
            </div>
            {request.suggestedSlots.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {request.suggestedSlots.map((slot) => (
                  <Button
                    key={slot}
                    tone="ghost"
                    onClick={() => {
                      dispatch({ type: "select_lesson_slot", actor: user, requestId: request.id, slot });
                      show("המועד נבחר");
                    }}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            ) : null}
            {request.status === "slot_selected" ? (
              <Button
                onClick={() => {
                  dispatch({ type: "open_lesson_payment", actor: user, requestId: request.id });
                  show("מסך התשלום מוכן");
                }}
              >
                פתיחת תשלום
              </Button>
            ) : null}
            {request.status === "payment_pending" ? (
              <Button
                onClick={() => {
                  dispatch({ type: "mark_lesson_paid", actor: user, requestId: request.id });
                  show("התשלום סומן");
                }}
              >
                סימון תשלום
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LKStudentSpaceV2() {
  return (
    <V2AppProvider>
      <Shell />
    </V2AppProvider>
  );
}
