"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  CreditCard,
  Database,
  Download,
  Flag,
  HeartPulse,
  ImagePlus,
  KeyRound,
  Lock,
  MessageCircle,
  MoonStar,
  Plus,
  Receipt,
  Search,
  School,
  Settings,
  Shield,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Upload,
  UserRound,
  Users,
  WandSparkles
} from "lucide-react";
import { V6AppProvider, useV6 } from "@/lib/v6/AppProvider";
import { permissionsFor, roleLabel } from "@/lib/v6/seed";
import { aiSafetyNotice, runAIAssistants } from "@/lib/ai/ai-orchestrator";
import {
  AISuggestionStack,
  AppShellFrame,
  BottomNavDock,
  BottomSheet as V6BottomSheet,
  Button as V6Button,
  FeedRow as V6FeedRow,
  FormField,
  HeroSurface,
  SegmentedControl,
  StatusBadge as V6StatusBadge,
  Surface,
  Toast as V6Toast,
  Widget,
  v6Cx,
  v6Tone,
  type V6Tone
} from "@/components/v6/design-system";
import { HomeScreen } from "@/components/v6/screens/HomeScreen";
import { selectV6LessonsForActor } from "@/lib/domains/attendance/selectors";
import { selectV6MessagesForActor, selectV6NotificationsForActor } from "@/lib/domains/messages/selectors";
import { selectV6PrivateLessonsForActor } from "@/lib/domains/private-lessons/selectors";
import { selectV6ShopProductsByCategory, selectV6FeaturedShopLanes } from "@/lib/domains/shop/selectors";
import { selectV6MediaForActor } from "@/lib/domains/media/selectors";
import { selectV6UsersByRole } from "@/lib/domains/users/selectors";
import { selectV6SystemIssues } from "@/lib/domains/system/selectors";
import { selectV6AIInsightsForActor } from "@/lib/domains/ai/selectors";
import { computeV6ManagementHealth, computeV6PrivateLessonCoordination, summarizeV6Audit } from "@/lib/engines/v6";
import type { AIInsight } from "@/lib/ai/ai-types";
import type { V6Group, V6MediaItem, V6Permissions, V6Product, V6Role, V6Screen, V6Tab, V6User } from "@/lib/v6/types";

type Tone = "studio" | "flamenco" | "hiphop" | "classic" | "modern" | "pointe" | "repertoire" | "management" | "admin" | "shop" | "urgent";

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

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
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

function Card({ children, tone = "studio", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <div className={cx("mx-auto w-full max-w-full overflow-hidden rounded-[26px] border border-white/[0.055] bg-[linear-gradient(155deg,rgba(255,255,255,0.082),rgba(255,255,255,0.032)_58%,rgba(0,0,0,0.16))] p-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-2xl", className)}>
      {children}
    </div>
  );
}

function Button({ children, onClick, variant = "primary", disabled, type = "button" }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "danger"; disabled?: boolean; type?: "button" | "submit" }) {
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cx("inline-flex min-h-11 max-w-full items-center justify-center gap-1.5 rounded-[18px] px-4 py-2 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45", variant === "primary" && "bg-[linear-gradient(135deg,#fbfff8,#baf7dc_44%,#4fd1c5)] text-zinc-950 shadow-[0_12px_26px_rgba(45,212,191,0.18)]", variant === "ghost" && "bg-white/[0.065] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]", variant === "danger" && "bg-rose-500/14 text-rose-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]")}>
      {children}
    </button>
  );
}

function StatusBadge({ children, tone = "studio" }: { children: ReactNode; tone?: Tone }) {
  const t = tones[tone];
  return <span className={cx("inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[11px] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]", t.soft, t.text)}>{children}</span>;
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="mx-auto w-full max-w-full text-right">
      <div className="flex items-start justify-between gap-3">
        {action ? <div className="shrink-0">{action}</div> : null}
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-100/65">LK Student Space</p>
          <h1 className="mt-1 text-[2.05rem] font-bold leading-[1.02] tracking-[-0.055em] text-white">{title}</h1>
          {subtitle ? <p className="mt-1.5 text-[14px] leading-snug text-white/58">{subtitle}</p> : null}
        </div>
      </div>
    </header>
  );
}

function ActionCard({ icon: Icon, title, subtitle, tone, onClick }: { icon: React.ElementType; title: string; subtitle: string; tone: Tone; onClick: () => void }) {
  const t = tones[tone];
  return (
    <button onClick={onClick} className="mx-auto flex min-h-[64px] w-full items-center gap-3 rounded-[22px] bg-white/[0.055] p-3 text-right shadow-[0_8px_20px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.025)] transition active:scale-[0.985]">
      <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-[16px]", t.soft, t.text)}><Icon size={18} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-white">{title}</span>
        <span className="mt-1 block line-clamp-2 text-[13px] leading-snug text-white/52">{subtitle}</span>
      </span>
      <ChevronLeft className="shrink-0 text-white/30" size={18} />
    </button>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block text-right">
      <span className="text-[12px] font-bold text-white/50">{label}</span>
      <input value={value} type={type} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-2 min-h-[54px] w-full rounded-[22px] border border-white/[0.065] bg-white/[0.075] px-4 text-right text-[16px] text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] focus:border-emerald-100/22 focus:bg-white/[0.105]" />
    </label>
  );
}

function BottomSheet({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end bg-black/62 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] backdrop-blur-sm md:hidden">
      <motion.div initial={{ y: 36, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-h-[86dvh] w-full overflow-hidden rounded-[30px] bg-zinc-950 shadow-[0_28px_90px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
          <Button variant="ghost" onClick={onClose}>סגירה</Button>
          <h2 className="text-right text-xl font-semibold tracking-[-0.03em]">{title}</h2>
        </div>
        <div className="max-h-[calc(86dvh-5rem)] overflow-y-auto p-5">{children}</div>
      </motion.div>
    </div>
  );
}

function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="fixed left-1/2 top-[calc(env(safe-area-inset-top,0px)+0.8rem)] z-[90] w-[min(92vw,360px)] -translate-x-1/2 rounded-full border border-white/10 bg-zinc-950/92 px-4 py-2 text-center text-sm font-bold text-white shadow-2xl backdrop-blur-xl">{message}</motion.div>;
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
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_46%_at_50%_-10%,rgba(52,211,153,0.18),transparent_55%),radial-gradient(ellipse_50%_42%_at_12%_82%,rgba(217,70,239,0.12),transparent_55%),#040405]" />
      <div className="relative mx-auto w-full max-w-[430px]">
        <div className="mb-7 text-center">
          <div className="mx-auto grid h-[68px] w-[68px] place-items-center rounded-[28px] bg-white/[0.075] shadow-[0_20px_58px_rgba(52,211,153,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]"><MoonStar className="text-emerald-200" size={30} /></div>
          <h1 suppressHydrationWarning className="mx-auto mt-5 max-w-[20rem] text-[clamp(2.15rem,11vw,2.7rem)] font-semibold leading-[0.98] tracking-[-0.07em]">{db.editableTexts.loginTitle ?? studio?.branding.name}</h1>
          <p className="mx-auto mt-4 max-w-xs text-[15px] leading-relaxed text-white/62">{db.editableTexts.loginSubtitle ?? studio?.branding.tagline}</p>
        </div>
        <form
          className="mx-auto w-full max-w-full space-y-5 rounded-[34px] border border-white/[0.055] bg-[linear-gradient(155deg,rgba(255,255,255,0.09),rgba(255,255,255,0.035)_58%,rgba(0,0,0,0.18))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.54),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:p-6"
          onSubmit={(e) => {
            e.preventDefault();
            const result = login(phone, password);
            if (result.ok === false) show(result.reason);
          }}
        >
          <div className="flex min-h-11 items-center justify-between gap-3 rounded-[20px] bg-black/18 px-4 py-3 text-right text-[13px] text-white/56 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]"><span className="min-w-0 leading-snug">כניסה מאובטחת לפי מסד הנתונים</span><Lock className="shrink-0" size={16} /></div>
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
  return (
    <>
      <V6Toast message={message} />
      <AppShellFrame user={user} studioName={studio?.name} onLogout={logout}>
        <div key={`${tab}-${screen}`}>
          {home && tab === "dashboard" ? <HomeScreen user={user} openScreen={openScreen} openTab={(next) => { setScreen("home"); setTab(next); window.scrollTo({ top: 0 }); }} /> : null}
          {home && tab === "lessons" ? <Lessons user={user} show={show} /> : null}
          {home && tab === "messages" ? <Messages user={user} show={show} /> : null}
          {home && tab === "shop" ? <Shop user={user} show={show} openScreen={openScreen} /> : null}
          {home && tab === "more" ? <More user={user} openScreen={openScreen} openTab={(next) => { setScreen("home"); setTab(next); window.scrollTo({ top: 0 }); }} /> : null}
          {!home && screen === "users" ? <UsersScreen actor={user} show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "private_lessons" ? <PrivateLessons user={user} show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "media" ? <MediaScreen user={user} show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "database" ? <DatabaseScreen actor={user} show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "texts" ? <TextsScreen actor={user} show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "flags" ? <FlagsScreen actor={user} show={show} back={() => setScreen("home")} /> : null}
          {!home && screen === "audit" ? <AuditScreen back={() => setScreen("home")} /> : null}
          {!home && screen === "system" ? <SystemScreen back={() => setScreen("home")} /> : null}
          {!home && screen === "branding" ? <BrandingScreen actor={user} show={show} back={() => setScreen("home")} /> : null}
        </div>
      </AppShellFrame>
      <BottomNavDock tab={tab} unread={unread} onTab={(next) => { setScreen("home"); setTab(next); window.scrollTo({ top: 0 }); }} />
    </>
  );
}

function BottomNav({ tab, unread, onTab }: { tab: V6Tab; unread: number; onTab: (tab: V6Tab) => void }) {
  const items: Array<{ id: V6Tab; label: string; icon: React.ElementType }> = [
    { id: "dashboard", label: "בית", icon: Sparkles },
    { id: "lessons", label: "שיעורים", icon: CalendarDays },
    { id: "messages", label: "הודעות", icon: MessageCircle },
    { id: "shop", label: "חנות", icon: ShoppingBag },
    { id: "more", label: "עוד", icon: Users }
  ];
  return (
    <nav className="fixed left-1/2 z-50 -translate-x-1/2" style={{ bottom: "max(0.58rem, env(safe-area-inset-bottom, 0px))", width: "min(calc(100vw - 24px), 404px)" }}>
      <div className="grid w-full grid-cols-5 gap-1 rounded-[28px] border border-white/[0.075] bg-[linear-gradient(180deg,rgba(39,39,42,0.54),rgba(9,9,11,0.78))] p-1.5 shadow-[0_18px_46px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.075)] backdrop-blur-2xl">
        {items.map((item) => {
          const active = tab === item.id;
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => onTab(item.id)} className={cx("relative grid min-h-[46px] place-items-center rounded-[21px] text-[9.5px] font-black leading-none transition active:scale-95", active ? "bg-[linear-gradient(135deg,#fff7ed,#d6fff0_54%,#9ae6dd)] text-zinc-950 shadow-[0_9px_20px_rgba(45,212,191,0.16)]" : "text-white/44 hover:text-white/68")}>
              <span className={cx("grid h-5 w-5 place-items-center rounded-full", active && "bg-zinc-950/8")}><Icon size={14} /></span>
              <span className="-mt-0.5">{item.label}</span>
              {item.id === "messages" && unread ? <span className="absolute right-3 top-1.5 h-2 w-2 rounded-full bg-rose-300 shadow-[0_0_14px_rgba(253,164,175,0.9)]" /> : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function visibleLessons(db: ReturnType<typeof useV6>["db"], user: V6User) {
  if (user.role === "super_admin" || user.role === "management") return db.lessons;
  return db.lessons.filter((lesson) => user.groupIds.includes(lesson.groupId));
}

function Dashboard({ user, openScreen, openTab }: { user: V6User; openScreen: (screen: V6Screen) => void; openTab: (tab: V6Tab) => void }) {
  const { db } = useV6();
  const lessons = visibleLessons(db, user);
  const next = lessons[0];
  const unread = db.notifications.filter((n) => n.userIds.includes(user.id) && !n.readBy.includes(user.id)).length;
  const tasks = db.tasks.filter((task) => user.role === "management" || user.role === "super_admin" || user.groupIds.includes(task.groupId));
  const visiblePrivateLessons = db.privateLessons.filter((item) => {
    if (user.role === "student") return item.studentId === user.id || item.requestedByUserId === user.id;
    if (user.role === "parent") return user.linkedStudentIds.includes(item.studentId);
    if (user.role === "teacher") return item.teacherId === user.id;
    return true;
  });
  const attendanceScope = user.role === "student" ? db.attendance.filter((item) => item.studentId === user.id) : db.attendance;
  const attendanceRate = attendanceScope.length ? Math.round((attendanceScope.filter((item) => item.status === "present").length / attendanceScope.length) * 100) : 0;
  const roleTone = toneForRole(user.role);
  const primaryGroup = db.groups.find((group) => user.groupIds.includes(group.id));
  const event = db.events[0];
  const insights = useMemo(() => runAIAssistants({ db, actor: user, role: user.role }), [db, user]);
  const highInsight = insights.find((insight) => insight.riskLevel === "high");
  const feedItems = [
    ...db.notifications
      .filter((item) => item.userIds.includes(user.id))
      .slice(0, 2)
      .map((item) => ({ id: item.id, title: item.title, body: item.body, meta: item.readBy.includes(user.id) ? "נקרא" : "חדש", tone: item.readBy.includes(user.id) ? "studio" as Tone : "urgent" as Tone, icon: Bell })),
    ...db.messages.slice(0, 1).map((item) => ({ id: item.id, title: item.title, body: item.body, meta: "עדכון סטודיו", tone: "modern" as Tone, icon: MessageCircle })),
    ...tasks.slice(0, 1).map((item) => ({ id: item.id, title: item.title, body: "משימה פתוחה לפי קבוצה והרשאות", meta: "משימה", tone: "repertoire" as Tone, icon: ClipboardList }))
  ].slice(0, 4);
  const quickActions = [
    (user.permissions.manageMedia || user.role === "super_admin") ? { icon: ImagePlus, title: "מדיה", subtitle: "העלאה", tone: "modern" as Tone, onClick: () => openScreen("media") } : null,
    { icon: MessageCircle, title: "קבוצה", subtitle: "הודעות", tone: "studio" as Tone, onClick: () => openTab("messages") },
    { icon: Receipt, title: "פרטי", subtitle: "שיעור", tone: "shop" as Tone, onClick: () => openScreen("private_lessons") },
    (user.permissions.manageUsers || user.role === "super_admin") ? { icon: Shield, title: "משתמשים", subtitle: "ניהול", tone: "management" as Tone, onClick: () => openScreen("users") } : null,
    (user.permissions.manageShop || user.role === "super_admin") ? { icon: Plus, title: "חנות", subtitle: "ניהול", tone: "shop" as Tone, onClick: () => openTab("shop") } : null
  ].filter(Boolean) as Array<{ icon: React.ElementType; title: string; subtitle: string; tone: Tone; onClick: () => void }>;
  return (
    <div className="space-y-4">
      <HomeHero user={user} nextTitle={next ? `${next.title} · ${next.weekday} ${next.time}` : "היום פנוי לתרגול ושקט"} groupName={primaryGroup?.name} attendanceRate={attendanceRate || (user.role === "student" ? 78 : 92)} onPrimary={() => next ? openTab("lessons") : openScreen("private_lessons")} onSecondary={() => openTab("messages")} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <HomeMetric icon={Check} tone={roleTone} value={attendanceScope.length ? `${attendanceRate}%` : "חדש"} label="נוכחות" trend={attendanceScope.length ? "מעקב פעיל" : "טרם סומן"} />
        <HomeMetric icon={Bell} tone={unread ? "urgent" : "modern"} value={unread ? `${unread}` : "0"} label="עדכונים" trend={unread ? "דורש קריאה" : "רגוע"} />
        <HomeMetric icon={CalendarDays} tone={roleTone} value={next ? next.time : "—"} label="שיעור הבא" trend={next ? next.weekday : "אין היום"} />
        <HomeMetric icon={Receipt} tone="shop" value={`${visiblePrivateLessons.length}`} label="פרטיים" trend={visiblePrivateLessons[0]?.status ?? "זמינות"} />
        <HomeMetric icon={ClipboardList} tone="repertoire" value={`${tasks.length}`} label="משימות" trend={tasks.length ? "פתוחות" : "נקי"} />
      </div>
      <QuickActionDock actions={quickActions} />
      <AlertStack unread={unread} highInsight={highInsight} next={next ? `${next.title} ב${next.room}` : undefined} />
      <section className="grid gap-3 md:grid-cols-[1.04fr_0.96fr]">
        <SoftModule title="מה קורה עכשיו" kicker="פעילות ועדכונים" icon={Bell} tone={unread ? "urgent" : "modern"}>
          <div className="space-y-2">
            {feedItems.map((item) => <FeedRow key={item.id} icon={item.icon} title={item.title} body={item.body} meta={item.meta} tone={item.tone} />)}
          </div>
        </SoftModule>
        <SoftModule title="הקרוב ביותר" kicker="היום והשבוע" icon={CalendarDays} tone={roleTone}>
          <div className="space-y-2">
            <UpcomingRow icon={CalendarDays} title={next?.title ?? "אין שיעור קרוב"} meta={next ? `${next.weekday} · ${next.time} · ${next.room}` : "אפשר לפתוח שיעור פרטי או הודעות"} tone={roleTone} />
            <UpcomingRow icon={Sparkles} title={event?.title ?? "אירועי סטודיו"} meta={event ? event.date : "אין אירוע קרוב"} tone="repertoire" />
            <UpcomingRow icon={Receipt} title={visiblePrivateLessons[0] ? "שיעור פרטי בטיפול" : "שיעור פרטי"} meta={visiblePrivateLessons[0]?.selectedSlot ?? visiblePrivateLessons[0]?.status ?? "בקשה חדשה זמינה"} tone="shop" />
          </div>
        </SoftModule>
      </section>
      <AIPanel user={user} />
    </div>
  );
}

function HomeHero({ user, nextTitle, groupName, attendanceRate, onPrimary, onSecondary }: { user: V6User; nextTitle: string; groupName?: string; attendanceRate: number; onPrimary: () => void; onSecondary: () => void }) {
  const tone = toneForRole(user.role);
  return (
    <section className={cx("relative isolate overflow-hidden rounded-[34px] bg-gradient-to-br px-4 py-4 shadow-[0_26px_70px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.1)]", tones[tone].grad)}>
      <div className="pointer-events-none absolute -left-12 -top-16 h-40 w-40 rounded-full bg-white/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-36 w-44 rounded-full bg-emerald-200/10 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <ProgressRing value={attendanceRate} />
        <div className="min-w-0 text-right">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <StatusBadge tone={tone}>{roleLabel[user.role]}</StatusBadge>
            {groupName ? <span className="rounded-full bg-black/16 px-2.5 py-1 text-[11px] font-bold text-white/58">{groupName}</span> : null}
          </div>
          <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-white/45">LK Student Space</p>
          <h1 className="mt-1 max-w-[15rem] text-[2.1rem] font-semibold leading-[0.98] tracking-[-0.07em] text-white">היי {user.name.split(" ")[0]}</h1>
          <p className="mt-3 max-w-[17rem] text-[13px] leading-relaxed text-white/64">{nextTitle}</p>
        </div>
      </div>
      <div className="relative mt-5 rounded-[24px] bg-black/18 p-2.5 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
        <div className="flex items-center justify-between gap-2 px-1 pb-2">
          <span className="text-[12px] font-bold text-white/58">הפעולה הטובה הבאה</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black text-emerald-100">Live</span>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Button onClick={onPrimary}>{nextTitle.includes("פנוי") ? "קביעת שיעור פרטי" : "פתיחת השיעור"}</Button>
          <Button variant="ghost" onClick={onSecondary}>הודעות</Button>
        </div>
      </div>
    </section>
  );
}

function HomeMetric({ icon: Icon, tone, value, label, trend }: { icon: React.ElementType; tone: Tone; value: string; label: string; trend: string }) {
  const t = tones[tone];
  return (
    <div className="min-w-0 rounded-[23px] bg-white/[0.058] px-3 py-3 text-right shadow-[0_12px_30px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-2">
        <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-full", t.soft, t.text)}><Icon size={15} /></span>
        <span className="truncate text-[1.05rem] font-black tracking-[-0.04em] text-white">{value}</span>
      </div>
      <p className="mt-2 truncate text-[11px] font-bold text-white/58">{label}</p>
      <p className="mt-0.5 truncate text-[10px] text-white/36">{trend}</p>
    </div>
  );
}

function QuickActionDock({ actions }: { actions: Array<{ icon: React.ElementType; title: string; subtitle: string; tone: Tone; onClick: () => void }> }) {
  return (
    <section className="overflow-hidden rounded-[29px] bg-[linear-gradient(135deg,rgba(255,255,255,0.072),rgba(255,255,255,0.032))] px-3 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.075)] backdrop-blur-2xl">
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {actions.map((action) => {
          const Icon = action.icon;
          const t = tones[action.tone];
          return (
            <button key={action.title} onClick={action.onClick} className="grid min-h-[72px] min-w-[66px] shrink-0 place-items-center rounded-[24px] bg-black/16 px-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] transition active:scale-[0.97]">
              <span className={cx("grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br shadow-[0_10px_24px_rgba(0,0,0,0.18)]", t.soft, t.text)}><Icon size={18} /></span>
              <span className="mt-1 text-[11px] font-black text-white">{action.title}</span>
              <span className="-mt-0.5 text-[9px] font-bold text-white/38">{action.subtitle}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function AlertStack({ unread, highInsight, next }: { unread: number; highInsight?: AIInsight; next?: string }) {
  const alerts = [
    unread ? { id: "unread", icon: Bell, title: `${unread} עדכונים ממתינים`, body: "כדאי לעבור על הודעות הסטודיו לפני השיעור.", tone: "urgent" as Tone } : null,
    highInsight ? { id: "ai", icon: Sparkles, title: highInsight.title, body: highInsight.body, tone: "admin" as Tone } : null,
    next ? { id: "next", icon: CalendarDays, title: "הפעולה הקרובה", body: next, tone: "studio" as Tone } : null
  ].filter(Boolean) as Array<{ id: string; icon: React.ElementType; title: string; body: string; tone: Tone }>;
  if (!alerts.length) return null;
  return (
    <div className="grid gap-2">
      {alerts.slice(0, 2).map((alert) => {
        const Icon = alert.icon;
        return (
          <div key={alert.id} className={cx("flex items-center gap-3 rounded-[24px] bg-gradient-to-l px-3.5 py-3 text-right shadow-[0_14px_36px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.075)]", tones[alert.tone].grad)}>
            <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-full", tones[alert.tone].soft, tones[alert.tone].text)}><Icon size={17} /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-black text-white">{alert.title}</span>
              <span className="mt-0.5 block truncate text-[12px] text-white/52">{alert.body}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SoftModule({ title, kicker, icon: Icon, tone, children }: { title: string; kicker: string; icon: React.ElementType; tone: Tone; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[29px] bg-white/[0.052] p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] font-black text-white/38">{kicker}</span>
        <div className="flex min-w-0 items-center gap-2 text-right">
          <h2 className="truncate text-[16px] font-black tracking-[-0.035em] text-white">{title}</h2>
          <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-full", tones[tone].soft, tones[tone].text)}><Icon size={15} /></span>
        </div>
      </div>
      {children}
    </section>
  );
}

function FeedRow({ icon: Icon, title, body, meta, tone }: { icon: React.ElementType; title: string; body: string; meta: string; tone: Tone }) {
  return (
    <div className="flex items-center gap-3 rounded-[21px] bg-black/14 px-3 py-2.5 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-full", tones[tone].soft, tones[tone].text)}><Icon size={15} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold text-white">{title}</span>
        <span className="mt-0.5 block truncate text-[12px] text-white/46">{body}</span>
      </span>
      <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-1 text-[10px] font-black text-white/42">{meta}</span>
    </div>
  );
}

function UpcomingRow({ icon: Icon, title, meta, tone }: { icon: React.ElementType; title: string; meta: string; tone: Tone }) {
  return (
    <div className="flex items-center gap-3 rounded-[21px] bg-black/14 px-3 py-2.5 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-full", tones[tone].soft, tones[tone].text)}><Icon size={15} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold text-white">{title}</span>
        <span className="mt-0.5 block truncate text-[12px] text-white/46">{meta}</span>
      </span>
      <ChevronLeft className="shrink-0 text-white/22" size={16} />
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  return <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-[11px] font-black text-white" style={{ background: `conic-gradient(rgba(167,243,208,.95) ${value * 3.6}deg, rgba(255,255,255,.10) 0)` }}><span className="grid h-10 w-10 place-items-center rounded-full bg-zinc-950">{value}%</span></div>;
}

function MiniSummary({ icon: Icon, tone, label, title, meta }: { icon: React.ElementType; tone: Tone; label: string; title: string; meta: string }) {
  const t = v6Tone[tone];
  return (
    <Surface tone={tone} className="flex items-center gap-3 p-3">
      <span className={v6Cx("grid h-10 w-10 shrink-0 place-items-center rounded-[16px]", t.soft, t.text)}><Icon size={17} /></span>
      <span className="min-w-0 flex-1 text-right">
        <span className="block truncate text-[11px] font-bold text-white/50">{label}</span>
        <span className="mt-0.5 block truncate text-base font-bold">{title}</span>
        <span className="mt-0.5 block truncate text-[11px] text-white/46">{meta}</span>
      </span>
    </Surface>
  );
}

function AIPanel({ user, limit = 3 }: { user: V6User; limit?: number }) {
  const { db } = useV6();
  const insights = useMemo(() => runAIAssistants({ db, actor: user, role: user.role }).slice(0, limit), [db, limit, user]);
  const tone = user.role === "super_admin" ? "admin" : user.role === "management" ? "management" : user.role === "teacher" ? "studio" : "modern";
  return (
    <section className={cx("overflow-hidden rounded-[30px] bg-gradient-to-br p-3.5 shadow-[0_22px_58px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.075)] backdrop-blur-2xl", tones[tone].grad)}>
      <div className="flex items-start justify-between gap-3">
        <div className="max-w-[12rem] text-right">
          <h2 className="text-[16px] font-black tracking-[-0.035em] text-white">העוזרת החכמה</h2>
          <p className="mt-1 text-[11px] leading-snug text-white/45">קצר, שימושי, עם אישור אנושי לפני פרסום.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-violet-300/12 px-2.5 py-1 text-[10px] font-black text-violet-100">המלצות</span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.075] text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"><WandSparkles size={17} /></span>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {insights.map((insight) => <AIInsightCard key={insight.id} insight={insight} />)}
      </div>
    </section>
  );
}

function AIInsightCard({ insight }: { insight: AIInsight }) {
  const [expanded, setExpanded] = useState(false);
  const [approved, setApproved] = useState(false);
  const action = insight.requiresApproval ? "לאשר נוסח לפני שליחה" : insight.riskLevel === "high" ? "לטפל היום" : "לעקוב בהמשך";
  return (
    <div className="rounded-[20px] bg-black/18 p-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="flex items-start justify-between gap-3">
        <span className={cx("shrink-0 rounded-full px-2 py-1 text-[10px] font-black", insight.riskLevel === "high" ? "bg-rose-300 text-rose-950" : insight.riskLevel === "medium" ? "bg-amber-200 text-amber-950" : "bg-emerald-200 text-emerald-950")}>{insight.riskLevel === "high" ? "דחוף" : insight.riskLevel === "medium" ? "לבדיקה" : "רגוע"}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-white">{insight.title}</p>
          <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-white/56">{insight.body}</p>
        </div>
      </div>
      {expanded ? <div className="mt-2 rounded-[16px] bg-white/[0.055] p-3 text-[12px] leading-relaxed text-white/55"><p>{aiSafetyNotice()}</p><p className="mt-2 font-bold text-white/72">פעולה מומלצת: {action}</p></div> : null}
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className={cx("truncate text-[11px]", insight.requiresApproval ? "font-bold text-amber-100/75" : "text-white/38")}>{approved ? "אושר ידנית" : action}</p>
        <div className="flex shrink-0 gap-1.5">
          {insight.requiresApproval ? <button onClick={() => setApproved(true)} className="min-h-9 rounded-full bg-emerald-200 px-2.5 text-[11px] font-black text-emerald-950">{approved ? "מאושר" : "אישור"}</button> : null}
          <button onClick={() => setExpanded((value) => !value)} className="min-h-9 rounded-full bg-white/[0.06] px-2.5 text-[11px] font-bold text-white/62">{expanded ? "סגור" : "פירוט"}</button>
        </div>
      </div>
    </div>
  );
}

function Lessons({ user, show }: { user: V6User; show: (message: string) => void }) {
  const { db, audit } = useV6();
  const lessons = selectV6LessonsForActor(db, user);
  const nextLesson = lessons[0];
  return (
    <div className="space-y-4">
      <PageHeader title="שיעורים" subtitle="מערכת שבועית ברורה, מותאמת לתפקיד ולקבוצות." />
      <HeroSurface tone="studio" className="p-4">
        <div className="flex items-center justify-between gap-3 text-right">
          <V6StatusBadge tone="studio">השיעור הקרוב</V6StatusBadge>
          <CalendarDays className="text-emerald-100" size={22} />
        </div>
        <h2 className="mt-4 text-right text-[1.75rem] font-semibold leading-none tracking-[-0.055em]">{nextLesson?.title ?? "אין שיעור קרוב"}</h2>
        <p className="mt-2 text-right text-sm text-white/58">{nextLesson ? `${nextLesson.weekday} · ${nextLesson.time} · ${nextLesson.room}` : "אפשר לתאם שיעור פרטי מהמסך הבא."}</p>
      </HeroSurface>
      {lessons.map((lesson) => {
        const group = db.groups.find((g) => g.id === lesson.groupId);
        const tone = toneForStyle(group?.style);
        return (
          <Surface key={lesson.id} tone={tone} className="p-3">
            <div className="flex flex-col gap-3 text-right sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className={v6Cx("grid h-12 w-12 shrink-0 place-items-center rounded-[20px]", v6Tone[tone].soft, v6Tone[tone].text)}><CalendarDays size={18} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <V6StatusBadge tone={tone}>{group?.style}</V6StatusBadge>
                  <p className="truncate text-base font-black text-white">{lesson.title}</p>
                </div>
                <p className="mt-1 truncate text-sm text-white/52">{lesson.weekday} · {lesson.time} · {lesson.room}</p>
              </div>
              </div>
              {(user.permissions.manageAttendance || user.role === "super_admin") ? <div className="sm:shrink-0 [&>button]:w-full"><V6Button variant="ghost" onClick={() => { audit(user, "פתיחת נוכחות", lesson.id); show("סימון נוכחות נפתח"); }}>נוכחות</V6Button></div> : null}
            </div>
          </Surface>
        );
      })}
    </div>
  );
}

function Messages({ user, show }: { user: V6User; show: (message: string) => void }) {
  const { db, dispatch } = useV6();
  const notifications = selectV6NotificationsForActor(db, user);
  const messages = selectV6MessagesForActor(db, user);
  return (
    <div className="space-y-4">
      <PageHeader title="הודעות" subtitle="התראות, עדכוני סטודיו והודעות קבוצה במקום אחד." action={<V6Button variant="ghost" onClick={() => { dispatch({ type: "mark_all_read", userId: user.id }); show("הכול סומן כנקרא"); }}>סמן הכול</V6Button>} />
      <Surface tone="modern" className="space-y-2 p-3">
        {notifications.length ? notifications.map((item) => (
        <button key={item.id} onClick={() => { dispatch({ type: "mark_notification_read", userId: user.id, notificationId: item.id }); show("ההודעה סומנה כנקראה"); }} className="w-full">
          <V6FeedRow icon={Bell} title={item.title} body={item.body} meta={item.readBy.includes(user.id) ? "נקרא" : "חדש"} tone={item.readBy.includes(user.id) ? "studio" : "urgent"} />
        </button>
      )) : <p className="py-4 text-center text-sm text-white/45">אין התראות כרגע.</p>}
      </Surface>
      <Widget title="עדכוני סטודיו" kicker="קבוצה וקהילה" icon={MessageCircle} tone="modern">
        <div className="space-y-2">{messages.map((item) => <V6FeedRow key={item.id} icon={MessageCircle} title={item.title} body={item.body} meta="סטודיו" tone="modern" />)}</div>
      </Widget>
    </div>
  );
}

function ProductCard({ product, user, show, onPrivateLesson }: { product: V6Product; user: V6User; show: (message: string) => void; onPrivateLesson: () => void }) {
  const { dispatch } = useV6();
  const privateLesson = product.category.includes("שיעורים");
  const ticket = product.category.includes("כרטיסים");
  const tone: V6Tone = privateLesson ? "studio" : ticket ? "repertoire" : "shop";
  const action = privateLesson
    ? () => onPrivateLesson()
    : () => {
        dispatch({ type: "shop_order", actor: user, productId: product.id });
        show("הפעולה נשמרה ונשלחה התראה");
      };
  return (
    <Surface tone={tone} className="p-0">
      <div className={v6Cx("relative grid h-36 place-items-center bg-gradient-to-br", v6Tone[tone].grad)}>
        <div className="absolute right-3 top-3 rounded-full bg-black/22 px-2.5 py-1 text-[10px] font-black text-white/62">{product.category}</div>
        <div className="grid h-20 w-20 place-items-center rounded-[28px] bg-black/20 shadow-[0_18px_40px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)]">
          {privateLesson ? <Receipt className="text-emerald-100" size={28} /> : ticket ? <Sparkles className="text-amber-100" size={28} /> : <ShoppingBag className="text-yellow-100" size={28} />}
        </div>
      </div>
      <div className="p-4 text-right">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold">{product.title}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-white/58">{product.description}</p>
          </div>
          <p className="shrink-0 rounded-full bg-white/[0.08] px-3 py-1 font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">₪{product.price}</p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="truncate rounded-full bg-white/[0.06] px-3 py-1 text-xs font-black text-white/52">{product.active ? "זמין עכשיו" : "לא פעיל"}</span>
          <V6Button disabled={!product.active} onClick={action}>{privateLesson ? "זמינות" : "רכישה"}</V6Button>
        </div>
      </div>
    </Surface>
  );
}

function Shop({ user, show, openScreen }: { user: V6User; show: (message: string) => void; openScreen: (screen: V6Screen) => void }) {
  const { db } = useV6();
  const [category, setCategory] = useState("הכול");
  const categories = ["הכול", "אביזרים", "כרטיסים", "פרטיים"];
  const filtered = category === "פרטיים" ? selectV6ShopProductsByCategory(db, "שיעורים") : selectV6ShopProductsByCategory(db, category);
  const lanes = selectV6FeaturedShopLanes(db);
  return (
    <div className="space-y-4">
      <PageHeader title="חנות" subtitle="בוטיק סטודיו, כרטיסים ושיעורים פרטיים בחוויה אחת." />
      <HeroSurface tone="shop" className="p-5">
        <V6StatusBadge tone="shop">Boutique</V6StatusBadge>
        <h2 className="mt-3 text-right text-[1.8rem] font-semibold leading-tight tracking-[-0.05em]">בוטיק סטודיו חי</h2>
        <p className="mt-2 text-right text-[14px] leading-relaxed text-white/62">מוצרים, כרטיסים ושיעורים פרטיים בחוויה אחת נקייה.</p>
        <div className="mt-4"><SegmentedControl value={category} options={categories} onChange={setCategory} /></div>
      </HeroSurface>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => openScreen("private_lessons")} className="min-h-[74px] rounded-[24px] bg-emerald-300/12 p-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
          <Receipt className="mb-2 text-emerald-100" size={18} />
          <p className="text-sm font-black">שיעורים פרטיים</p>
          <p className="mt-0.5 text-[11px] text-white/45">{lanes.privateLessons.length} אפשרויות</p>
        </button>
        <button onClick={() => setCategory("כרטיסים")} className="min-h-[74px] rounded-[24px] bg-amber-300/12 p-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
          <Sparkles className="mb-2 text-amber-100" size={18} />
          <p className="text-sm font-black">כרטיסים</p>
          <p className="mt-0.5 text-[11px] text-white/45">{lanes.tickets.length} במלאי</p>
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((product) => <ProductCard key={product.id} product={product} user={user} show={show} onPrivateLesson={() => openScreen("private_lessons")} />)}
      </div>
      {(user.permissions.manageShop || user.role === "super_admin") ? <ActionCard icon={Plus} title="הוספת מוצר" subtitle="ניהול מוצר ותמונות" tone="shop" onClick={() => openScreen("media")} /> : null}
      <Surface tone="shop" className="space-y-3">
        <div className="flex items-center justify-between gap-2 text-right"><span className="text-xs font-bold text-white/42">תשלום מאובטח יופעל בצד שרת</span><CreditCard className="text-yellow-100" size={18} /></div>
        <div className="grid grid-cols-3 gap-1 rounded-[18px] bg-black/22 p-1 text-center text-xs font-bold text-white/62">
          {["Apple Pay", "Bit", "אשראי"].map((method) => <button key={method} onClick={() => show(`${method} נבחר כאמצעי תשלום מועדף`)} className="min-h-11 rounded-[14px] transition hover:bg-white/[0.05] active:scale-95">{method}</button>)}
        </div>
      </Surface>
    </div>
  );
}

function More({ user, openScreen, openTab }: { user: V6User; openScreen: (screen: V6Screen) => void; openTab: (tab: V6Tab) => void }) {
  const { db } = useV6();
  const aiInsights = useMemo(() => selectV6AIInsightsForActor(db, user).slice(0, 2), [db, user]);
  const sections = [
    { title: "הסטודיו", items: [{ title: "שיעורים פרטיים", subtitle: "בקשות, מועדים ותשלום", icon: Receipt, tone: "shop" as Tone, screen: "private_lessons" as V6Screen }, { title: "מדיה וגלריה", subtitle: "תמונות, וידאו וחומרים", icon: ImagePlus, tone: "modern" as Tone, screen: "media" as V6Screen }] },
    { title: "חנות ותשלומים", items: [{ title: "בוטיק ותשלומים", subtitle: "מוצרים, כרטיסים ואמצעי תשלום", icon: ShoppingBag, tone: "shop" as Tone, tab: "shop" as V6Tab }] },
    { title: "כלים למורה", items: user.role === "teacher" || user.role === "management" || user.role === "super_admin" ? [{ title: "נוכחות וקבוצות", subtitle: "פעולות מהירות למורה", icon: School, tone: "studio" as Tone, screen: "system" as V6Screen }] : [] },
    { title: "ניהול", items: user.permissions.manageUsers || user.role === "super_admin" ? [{ title: "ניהול משתמשים", subtitle: "טלפונים, סיסמאות והרשאות", icon: Users, tone: "management" as Tone, screen: "users" as V6Screen }] : [] },
    { title: "מערכת", items: user.role === "super_admin" ? [{ title: "מסד נתונים", subtitle: "ייצוא, ייבוא וגיבוי", icon: Database, tone: "admin" as Tone, screen: "database" as V6Screen }, { title: "טקסטים", subtitle: "תוכן ניתן לעריכה", icon: Sparkles, tone: "repertoire" as Tone, screen: "texts" as V6Screen }, { title: "פיצ׳רים", subtitle: "דגלי יכולת", icon: Flag, tone: "admin" as Tone, screen: "flags" as V6Screen }, { title: "אודיט", subtitle: "יומן פעולות", icon: ClipboardList, tone: "management" as Tone, screen: "audit" as V6Screen }, { title: "בריאות מערכת", subtitle: "סטטוס מקומי", icon: HeartPulse, tone: "studio" as Tone, screen: "system" as V6Screen }, { title: "מיתוג", subtitle: "שם, שפה ונראות סטודיו", icon: Settings, tone: "admin" as Tone, screen: "branding" as V6Screen }] : [] }
  ].filter((s) => s.items.length);
  return (
    <div className="space-y-4">
      <PageHeader title="עוד" subtitle="כל מה שצריך לסטודיו במקום אחד." />
      {sections.map((section) => (
        <section key={section.title} className="space-y-2.5">
          <div className="flex items-center justify-end gap-2"><span className="h-px flex-1 bg-white/[0.04]" /><p className="text-right text-[13px] font-black text-white/48">{section.title}</p></div>
          <div className={section.title === "מערכת" ? "grid gap-2 sm:grid-cols-2" : "space-y-2.5"}>
            {section.items.map((item) => <ActionCard key={item.title} icon={item.icon} title={item.title} subtitle={item.subtitle} tone={item.tone} onClick={() => "tab" in item ? openTab(item.tab) : openScreen(item.screen)} />)}
          </div>
        </section>
      ))}
      <AISuggestionStack insights={aiInsights} />
    </div>
  );
}

function BackHeader({ title, back, action }: { title: string; back: () => void; action?: ReactNode }) {
  return <PageHeader title={title} action={<div className="flex gap-2">{action}<V6Button variant="ghost" onClick={back}>חזרה</V6Button></div>} />;
}

function UsersScreen({ actor, show, back }: { actor: V6User; show: (message: string) => void; back: () => void }) {
  const { db, dispatch } = useV6();
  const [selectedId, setSelectedId] = useState(db.users[0]?.id ?? "");
  const selected = db.users.find((u) => u.id === selectedId);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<V6Role | "all">("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState(selected?.name ?? "");
  const [phone, setPhone] = useState(selected?.phone ?? "");
  const [role, setRole] = useState<V6Role>(selected?.role ?? "student");
  const [password, setPassword] = useState("new2026");
  const queryValue = query.trim();
  const filteredUsers = selectV6UsersByRole(db, actor, filter).filter((user) => !queryValue || `${user.name} ${user.phone} ${roleLabel[user.role]}`.includes(queryValue));
  const filterOptions: Array<{ id: V6Role | "all"; label: string }> = [
    { id: "all", label: "כולם" },
    { id: "student", label: "תלמידים" },
    { id: "parent", label: "הורים" },
    { id: "teacher", label: "מורים" },
    { id: "management", label: "הנהלה" }
  ];
  function load(user: V6User) {
    setSelectedId(user.id);
    setName(user.name);
    setPhone(user.phone);
    setRole(user.role);
    setSheetOpen(true);
  }
  function save() {
    const idValue = selectedId || `user_${Date.now().toString(36)}`;
    dispatch({ type: "upsert_user", actor, user: { ...(selected ?? actor), id: idValue, studioId: actor.studioId, name, phone, role, permissions: permissionsFor(role), active: true, groupIds: selected?.groupIds ?? [], linkedStudentIds: selected?.linkedStudentIds ?? [] }, credential: { userId: idValue, phone, password } });
    setSelectedId(idValue);
    show("המשתמש נשמר");
  }
  const editor = (
    <div className="space-y-4">
      <FormField label="שם" value={name} onChange={setName} />
      <FormField label="טלפון" value={phone} onChange={setPhone} />
      <label className="block text-right"><span className="text-[12px] font-bold text-white/50">תפקיד</span><select value={role} onChange={(e) => setRole(e.target.value as V6Role)} className="mt-2 min-h-[52px] w-full rounded-[20px] border border-white/[0.065] bg-white/[0.075] px-4 text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">{Object.entries(roleLabel).map(([id, label]) => <option key={id} value={id} className="bg-zinc-950">{label}</option>)}</select></label>
      <FormField label="סיסמה חדשה" value={password} onChange={setPassword} />
      <div className="sticky bottom-0 -mx-1 flex gap-2 rounded-[22px] bg-zinc-950/88 p-2 backdrop-blur">
        <V6Button onClick={() => { save(); setSheetOpen(false); }}>שמירה</V6Button>
        <V6Button variant="ghost" onClick={() => { if (!selected) { show("איפוס זמין אחרי שמירת משתמש חדש"); return; } dispatch({ type: "reset_password", actor, userId: selected.id, password }); show("סיסמה עודכנה"); }}>איפוס</V6Button>
      </div>
    </div>
  );
  return (
    <div className="space-y-5">
      <BackHeader title="ניהול משתמשים" back={back} action={<V6Button onClick={() => { setSelectedId(""); setName(""); setPhone(""); setRole("student"); setPassword("new2026"); setSheetOpen(true); }}>חדש</V6Button>} />
      <Surface tone="management" className="space-y-3 p-3.5">
        <FormField label="חיפוש" value={query} onChange={setQuery} placeholder="חיפוש לפי שם או טלפון" />
        <SegmentedControl value={filterOptions.find((item) => item.id === filter)?.label ?? "כולם"} options={filterOptions.map((item) => item.label)} onChange={(value) => setFilter(filterOptions.find((item) => item.label === value)?.id ?? "all")} />
      </Surface>
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-2.5">{filteredUsers.map((user) => <button key={user.id} onClick={() => load(user)} className="w-full"><UserCard user={user} active={selected?.id === user.id} /></button>)}</div>
        <Surface tone="management" className="hidden space-y-3 lg:block">{editor}</Surface>
      </div>
      {sheetOpen ? <V6BottomSheet title={selected?.name ?? "משתמש חדש"} onClose={() => setSheetOpen(false)}>{editor}</V6BottomSheet> : null}
    </div>
  );
}

function UserCard({ user, active }: { user: V6User; active?: boolean }) {
  const tone = toneForRole(user.role);
  return <div className={v6Cx("flex items-center gap-3 rounded-[24px] p-3.5 text-right shadow-[0_10px_28px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.045)]", active ? "bg-[linear-gradient(135deg,#fff7ed,#d6fff0_54%,#9ae6dd)] text-zinc-950" : "bg-black/18 text-white")}><span className={v6Cx("grid h-11 w-11 shrink-0 place-items-center rounded-[18px] font-black", active ? "bg-black/10 text-zinc-950" : v6Cx(v6Tone[tone].soft, v6Tone[tone].text))}>{user.name.slice(0, 1)}</span><span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-bold">{user.name}</span><span className={v6Cx("mt-1 block truncate text-[12px]", active ? "text-zinc-700" : "text-white/50")}>{user.phone}</span></span><span className={v6Cx("shrink-0 rounded-full px-2 py-1 text-[10px] font-black", active ? "bg-black/10 text-zinc-900" : "bg-white/[0.07] text-white/58")}>{roleLabel[user.role]}</span><ChevronLeft className="shrink-0 opacity-45" size={17} /></div>;
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
      <HeroSurface tone="shop" className="p-4">
        <V6StatusBadge tone={coordination.needsAttention ? "urgent" : "shop"}>{coordination.needsAttention ? "דורש תיאום" : "זמין לתיאום"}</V6StatusBadge>
        <h2 className="mt-3 text-right text-[1.7rem] font-semibold leading-tight tracking-[-0.05em]">בקשה קצרה, תיאום רגוע</h2>
        <p className="mt-2 text-right text-sm leading-relaxed text-white/58">בחרו תלמיד/ה, מורה ואורך שיעור. כל פעולה נשמרת במסד ומופיעה בהתראות.</p>
      </HeroSurface>
      <Surface tone="shop" className="space-y-3">
        <label className="block text-right"><span className="text-xs text-white/46">תלמיד/ה</span><select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="mt-2 min-h-12 w-full rounded-[18px] border border-white/[0.065] bg-white/[0.075] px-3 text-white outline-none">{students.map((s) => <option key={s.id} value={s.id} className="bg-zinc-950">{s.name}</option>)}</select></label>
        <label className="block text-right"><span className="text-xs text-white/46">מורה</span><select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="mt-2 min-h-12 w-full rounded-[18px] border border-white/[0.065] bg-white/[0.075] px-3 text-white outline-none">{teachers.map((t) => <option key={t.id} value={t.id} className="bg-zinc-950">{t.name}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-2">
          <V6Button disabled={!canRequest} onClick={() => request(30)}>30 דקות</V6Button>
          <V6Button disabled={!canRequest} onClick={() => request(45)}>45 דקות</V6Button>
        </div>
        {!canRequest ? <p className="text-right text-xs text-amber-100/70">אין מספיק נתונים לשליחת בקשה. צריך תלמיד/ה ומורה פעילים.</p> : null}
      </Surface>
      <div className="space-y-3">
        {privateLessons.length ? privateLessons.map((item) => (
          <Surface key={item.id} tone="shop">
            <div className="flex items-start justify-between gap-3 text-right">
              <V6StatusBadge tone={item.status === "paid" ? "success" : item.status === "requested" ? "urgent" : "shop"}>{item.status}</V6StatusBadge>
              <div className="min-w-0">
                <h2 className="font-bold">{db.users.find((u) => u.id === item.studentId)?.name} · {item.duration} דקות</h2>
                <p className="mt-1 text-sm text-white/55">₪{item.price} · {item.selectedSlot ?? item.suggestedSlots[0] ?? "מועד טרם נקבע"}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3 [&>button]:w-full">
              <V6Button variant="ghost" onClick={() => { dispatch({ type: "suggest_private_lesson", actor: user, requestId: item.id, slot: "יום שני 17:00" }); show("מועד הוצע"); }}>הצע מועד</V6Button>
              <V6Button variant="ghost" onClick={() => { dispatch({ type: "select_private_lesson", actor: user, requestId: item.id, slot: "יום שני 17:00" }); show("מועד נבחר"); }}>בחר מועד</V6Button>
              <V6Button onClick={() => { dispatch({ type: "mark_private_lesson_paid", actor: user, requestId: item.id }); show("שולם"); }}>שולם</V6Button>
            </div>
          </Surface>
        )) : <Surface tone="shop"><p className="text-center text-sm text-white/50">אין בקשות שיעור פרטי פתוחות כרגע.</p></Surface>}
      </div>
    </div>
  );
}

function MediaScreen({ user, show, back }: { user: V6User; show: (message: string) => void; back: () => void }) {
  const { db, dispatch } = useV6();
  const input = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("חומר חדש");
  const [groupId, setGroupId] = useState(user.groupIds[0] ?? db.groups[0]?.id ?? "");
  const groups = user.role === "teacher" ? db.groups.filter((g) => user.groupIds.includes(g.id)) : db.groups;
  function save(file?: File) {
    const media: V6MediaItem = { id: `media_${Date.now().toString(36)}`, studioId: user.studioId, uploadedByUserId: user.id, title, fileName: file?.name ?? "local-preview", mediaType: file?.type.startsWith("video/") ? "video" : "image", linkedGroupId: groupId, visibility: "group", localPreviewUrl: file ? URL.createObjectURL(file) : undefined, createdAt: new Date().toISOString() };
    dispatch({ type: "save_media", actor: user, media });
    show("המדיה נשמרה");
  }
  const media = selectV6MediaForActor(db, user);
  return (
    <div className="space-y-4">
      <BackHeader title="מדיה וגלריה" back={back} />
      <Surface tone="modern" className="space-y-3">
        <FormField label="כותרת" value={title} onChange={setTitle} />
        <label className="block text-right"><span className="text-xs text-white/46">קבוצה</span><select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="mt-2 min-h-12 w-full rounded-[18px] border border-white/[0.065] bg-white/[0.075] px-3 text-white outline-none">{groups.map((g) => <option key={g.id} value={g.id} className="bg-zinc-950">{g.name}</option>)}</select></label>
        <input ref={input} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => save(e.target.files?.[0])} />
        <div className="flex gap-2">
          <V6Button onClick={() => input.current?.click()}><Upload size={16} /> בחירת קובץ</V6Button>
          <V6Button variant="ghost" onClick={() => save()}>שמירת מטאדאטה</V6Button>
        </div>
        <p className="text-right text-xs leading-relaxed text-white/44">ב־MVP נשמרת מטאדאטה ותצוגה מקומית. בפרודקשן הקבצים יעברו לאחסון מאובטח.</p>
      </Surface>
      {media.map((item) => <Surface key={item.id} tone="modern"><h2 className="text-right font-bold">{item.title}</h2><p className="mt-1 text-right text-sm text-white/55">{item.fileName}</p></Surface>)}
    </div>
  );
}

function DatabaseScreen({ actor, show, back }: { actor: V6User; show: (message: string) => void; back: () => void }) {
  const { db, exportDatabase, importDatabase } = useV6();
  const ref = useRef<HTMLInputElement>(null);
  return <div className="space-y-4"><BackHeader title="מסד נתונים" back={back} /><div className="grid gap-2 sm:grid-cols-3"><MiniSummary icon={Users} tone="management" label="משתמשים" title={`${db.users.length}`} meta="מהמסד" /><MiniSummary icon={Bell} tone="modern" label="התראות" title={`${db.notifications.length}`} meta="פעילות" /><MiniSummary icon={Database} tone="admin" label="אודיט" title={`${db.auditLog.length}`} meta="פעולות" /></div><Surface tone="admin" className="space-y-3"><p className="text-right text-sm leading-relaxed text-white/55">ייצוא וייבוא משתמשים באותו מסד V6 מקומי, דרך Provider יחיד.</p><input ref={ref} type="file" accept="application/json" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const result = await importDatabase(file); show(result.ok === true ? "המסד יובא" : result.reason); }} /><div className="flex flex-wrap gap-2"><V6Button onClick={exportDatabase}><Download size={16} /> ייצוא</V6Button><V6Button variant="ghost" onClick={() => ref.current?.click()}><Upload size={16} /> ייבוא</V6Button></div></Surface></div>;
}

function TextsScreen({ actor, show, back }: { actor: V6User; show: (message: string) => void; back: () => void }) {
  const { db, dispatch } = useV6();
  const [title, setTitle] = useState(db.editableTexts.loginTitle ?? "");
  const [prompt] = useState(db.aiPrompts.super_admin ?? "");
  return <div className="space-y-4"><BackHeader title="טקסטים ו־AI" back={back} /><Surface tone="repertoire" className="space-y-3"><FormField label="כותרת כניסה" value={title} onChange={setTitle} /><V6Button onClick={() => { dispatch({ type: "update_text", actor, key: "loginTitle", value: title }); show("הטקסט נשמר"); }}>שמירה</V6Button></Surface><Surface tone="admin" className="space-y-3"><label className="block text-right"><span className="text-[11px] font-bold text-white/46">תבנית AI למנהל מערכת</span><textarea value={prompt} readOnly className="mt-2 min-h-32 w-full rounded-[18px] border border-white/[0.065] bg-white/[0.045] p-3 text-right text-[16px] text-white/68 outline-none" /></label><p className="text-right text-xs text-white/45">תבניות AI מוצגות לצפייה בלבד בשלב זה. פרסום תוכן דורש אישור אנושי.</p><V6Button variant="ghost" onClick={() => show("עריכת תבניות AI לא מופעלת ב־V6 הנוכחי")}>למה לא נשמר?</V6Button></Surface></div>;
}

function FlagsScreen({ actor, show, back }: { actor: V6User; show: (message: string) => void; back: () => void }) {
  const { db, dispatch } = useV6();
  return <div className="space-y-4"><BackHeader title="פיצ׳רים" back={back} />{Object.entries(db.featureFlags).map(([key, value]) => <Surface key={key} tone="admin" className="flex items-center justify-between"><span className="truncate font-bold">{key}</span><button onClick={() => { dispatch({ type: "update_flags", actor, flags: { [key]: !value } }); show("הדגל עודכן"); }} className={v6Cx("shrink-0 rounded-full px-3 py-1 text-xs font-bold", value ? "bg-emerald-300 text-zinc-950" : "bg-white/10 text-white/55")}>{value ? "פעיל" : "כבוי"}</button></Surface>)}</div>;
}

function BrandingScreen({ actor, show, back }: { actor: V6User; show: (message: string) => void; back: () => void }) {
  return <div className="space-y-4"><BackHeader title="מיתוג" back={back} /><Surface tone="admin"><p className="text-right text-sm text-white/58">מיתוג הסטודיו נשמר במסד ויורחב בשלב הבא.</p><div className="mt-3"><V6Button onClick={() => show("מיתוג מוכן לעריכה")}>בדיקת מיתוג</V6Button></div></Surface></div>;
}

function AuditScreen({ back }: { back: () => void }) {
  const { db } = useV6();
  const summary = summarizeV6Audit(db.auditLog);
  return <div className="space-y-4"><BackHeader title="אודיט" back={back} /><div className="grid grid-cols-2 gap-2"><MiniSummary icon={ClipboardList} tone="management" label="פעולות" title={`${summary.total}`} meta="נרשמו" /><MiniSummary icon={Shield} tone="urgent" label="רגישות" title={`${summary.sensitive}`} meta="דורשות מעקב" /></div><Widget title="יומן פעולות" kicker="בקרה מערכתית" icon={ClipboardList} tone="management"><div className="space-y-2">{db.auditLog.map((item) => <V6FeedRow key={item.id} icon={Shield} title={item.action} body={`${item.actorName} · ${item.target}`} meta={new Date(item.createdAt).toLocaleDateString("he-IL")} tone="management" />)}</div></Widget></div>;
}

function SystemScreen({ back }: { back: () => void }) {
  const { db, sync } = useV6();
  const issues = selectV6SystemIssues(db);
  const health = computeV6ManagementHealth(db);
  return <div className="space-y-4"><BackHeader title="בריאות מערכת" back={back} /><HeroSurface tone={issues.length ? "urgent" : "studio"} className="p-4"><V6StatusBadge tone={issues.length ? "urgent" : "success"}>{issues.length ? "דורש בדיקה" : "תקין"}</V6StatusBadge><h2 className="mt-3 text-right text-[1.7rem] font-semibold tracking-[-0.05em]">{health.summary}</h2><p className="mt-2 text-right text-sm text-white/58">פתיחה מיידית, מסד מקומי וסטטוס סנכרון מוצגים ללא פאנלים גולמיים.</p></HeroSurface><div className="grid gap-2 sm:grid-cols-3"><MiniSummary icon={Check} tone="studio" label="פתיחה" title="מיידית" meta={sync} /><MiniSummary icon={Database} tone="admin" label="גרסה" title={`V${db.version}`} meta="מסד מקומי" /><MiniSummary icon={HeartPulse} tone={issues.length ? "urgent" : "modern"} label="סטטוס" title={issues.length ? `${issues.length} לבדיקה` : "תקין"} meta={issues.length ? "מנוע אבחון" : "ללא חסימות"} /></div><Widget title="בדיקות מערכת" kicker="תפעול יומי" icon={HeartPulse} tone={issues.length ? "urgent" : "studio"}><div className="space-y-2">{issues.length ? issues.map((issue) => <V6FeedRow key={issue.id} icon={HeartPulse} title={issue.title} body={issue.body} meta={issue.severity === "critical" ? "קריטי" : "בדיקה"} tone={issue.severity === "critical" ? "urgent" : "management"} />) : <V6FeedRow icon={CheckCircle2} title="אין חסימות פעילות" body="המערכת מוכנה לפתיחה ושימוש יומי." meta="תקין" tone="studio" />}</div></Widget></div>;
}

export function LKStudentSpaceV6() {
  return <V6AppProvider><Shell /></V6AppProvider>;
}
