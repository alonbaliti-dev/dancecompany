"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronRight, Search } from "lucide-react";
import { buildMainNavTabs, computeMainTabBadges } from "@/lib/navigation";
import { EditableTextProvider, useEditableText } from "@/context/EditableTextContext";
import { CommunicationProvider, useCommunication } from "@/context/CommunicationContext";
import { LegacyEventsProvider, useLegacyEvents } from "@/context/LegacyEventsContext";
import { ShopProvider } from "@/context/ShopContext";
import { StudioIdentityProvider } from "@/context/StudioIdentityContext";
import { StudioOSProvider } from "@/context/StudioOSContext";
import { usePlatform, useBrandingStyle } from "@/context/PlatformContext";
import { canOpenStackForUser } from "@/lib/permissions";
import { getRoleHeaderLines } from "@/lib/role-ui";
import { useProductData } from "@/context/ProductDataContext";
import { useStudioData } from "@/context/StudioDataContext";
import type { CommandJump } from "./CommandPalette";
import type { MainTabId, StackTabId, UserProfile } from "@/lib/types";
import { ProductDataProvider } from "@/context/ProductDataContext";
import { StudioDataProvider } from "@/context/StudioDataContext";
import { AiToolsScreen } from "./AiToolsScreen";
import { AttendanceScreen } from "./AttendanceScreen";
import { AttendanceIntelligenceScreen } from "./attendance-intelligence/AttendanceIntelligenceScreen";
import { AttendanceIntelligenceProvider } from "@/context/AttendanceIntelligenceContext";
import { PrivateLessonsProvider } from "@/context/PrivateLessonsContext";
import { ToastProvider } from "@/context/ToastContext";
import { ToastHost } from "./ToastHost";
import type { ShopInitialView } from "./shop/ShopScreen";
import { ManagementDashboard } from "./ManagementDashboard";
import { MoreMenu } from "./navigation/MoreMenu";
import { LessonsHubScreen } from "./hubs/LessonsHubScreen";
import { MessagesHubScreen } from "./hubs/MessagesHubScreen";
import { TasksHubScreen } from "./hubs/TasksHubScreen";
import { GroupChatDetailScreen } from "./GroupChatDetailScreen";
import { GroupChatsListScreen } from "./GroupChatsListScreen";
import { NotificationCenterScreen } from "./NotificationCenterScreen";
import { SendUpdateSheet } from "./SendUpdateSheet";
import { GalleryScreen } from "./GalleryScreen";
import { GalleryUploadSheet } from "./GalleryUploadSheet";
import { LegacyBoardScreen } from "./LegacyBoardScreen";
import { LegacyEventDetailScreen } from "./LegacyEventDetailScreen";
import { LegacyEventManageSheet } from "./LegacyEventManageSheet";
import { OnboardingModal, readOnboardingDone } from "./OnboardingModal";
import { PracticeHubScreen } from "./PracticeHubScreen";
import { ProfileScreen } from "./ProfileScreen";
import { ProgressHubScreen } from "./ProgressHubScreen";
import { ReportsScreen } from "./ReportsScreen";
import { ScheduleScreen } from "./ScheduleScreen";
import { StudentFilesScreen } from "./StudentFilesScreen";
import { StudioSettingsScreen } from "./StudioSettingsScreen";
import { TeacherDashboard } from "./TeacherDashboard";
import { DashboardScreen } from "./dashboard/DashboardScreen";
import { UserManagementScreen } from "./UserManagementScreen";
import { RelationshipManagerScreen } from "./users/RelationshipManagerScreen";
import { UserDirectoryProvider } from "@/context/UserDirectoryContext";
import { LevelSystemScreen } from "./LevelSystemScreen";
import { RehearsalModeScreen } from "./RehearsalModeScreen";
import { FeedbackHubScreen } from "./FeedbackHubScreen";
import { CalendarHubScreen } from "./CalendarHubScreen";
import { ParentPeaceScreen } from "./ParentPeaceScreen";
import { StudioHealthScreen } from "./StudioHealthScreen";
import { LiveEventFeedScreen } from "./LiveEventFeedScreen";
import { AiCoachScreen } from "./AiCoachScreen";
import { RiskCenterScreen } from "./RiskCenterScreen";
import { CreatorDashboardScreen } from "./platform/CreatorDashboardScreen";
import { SuperAdminHubScreen } from "./platform/SuperAdminHubScreen";
import { PlatformOSProvider } from "@/context/PlatformOSContext";
import { EventOperatingModeProvider } from "@/context/EventOperatingModeContext";
import { SyncStatusBanner } from "./platform-os/SyncStatusBanner";
import { GlobalSearchSheet } from "./platform-os/GlobalSearchSheet";
import { ActivityFeedScreen } from "./platform-os/ActivityFeedScreen";
import { BackupRestoreScreen } from "./platform-os/BackupRestoreScreen";
import { SystemStatusScreen } from "./platform-os/SystemStatusScreen";
import { ConsentHubScreen } from "./platform-os/ConsentHubScreen";
import { ModerationQueueScreen } from "./platform-os/ModerationQueueScreen";
import { EventCommandCenterScreen } from "./platform-os/EventCommandCenterScreen";
import { RoleOnboardingScreen } from "./platform-os/RoleOnboardingScreen";
import { StudiosAdminScreen } from "./platform/StudiosAdminScreen";
import { FeatureFlagsScreen } from "./platform/FeatureFlagsScreen";
import { AuditLogScreen } from "./platform/AuditLogScreen";
import { SystemUpdatesScreen } from "./platform/SystemUpdatesScreen";
import { DataSafetyScreen } from "./platform/DataSafetyScreen";
import { BillingScreen } from "./platform/BillingScreen";
import { BrandingEditorScreen } from "./platform/BrandingEditorScreen";
import { GlobalSettingsScreen } from "./platform/GlobalSettingsScreen";
import { ShopScreen } from "./shop/ShopScreen";
import { StudioLegacyScreen } from "./studio-identity/StudioLegacyScreen";
import { StudioMediaFeed } from "./media/StudioMediaFeed";
import { FacultyHubScreen } from "./studio-identity/FacultyHubScreen";
import { DanceStylesScreen } from "./studio-identity/DanceStylesScreen";
import type { InstitutionalStyleId } from "@/lib/types";
import { interaction, surfaces } from "@/lib/design-system/tokens";
import { GhostButton, cx } from "./ui";
import { AppLayoutChrome } from "./layout/AppLayoutChrome";
import { SuperAdminTextEditorScreen } from "./super-admin/SuperAdminTextEditorScreen";
import { TextEditorSheet } from "./super-admin/TextEditorSheet";
import { CreatorPreviewBar } from "./layout/CreatorPreviewBar";
import { InstallHintBanner } from "./layout/InstallHintBanner";
import { ViewModeSettings } from "./settings/ViewModeSettings";
import { useDeviceLayout } from "@/context/DeviceLayoutContext";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

function AppContent({
  user,
  onLogout,
  onUserUpdate
}: {
  user: UserProfile;
  onLogout: () => void;
  onUserUpdate: (next: UserProfile) => void;
}) {
  const [mainTab, setMainTab] = useState<MainTabId>("dashboard");
  const [stack, setStack] = useState<StackTabId | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sendUpdateOpen, setSendUpdateOpen] = useState(false);
  const [galleryUploadOpen, setGalleryUploadOpen] = useState(false);
  const [activeLegacyEventId, setActiveLegacyEventId] = useState<string | null>(null);
  const [legacyManageOpen, setLegacyManageOpen] = useState(false);
  const [legacyEditId, setLegacyEditId] = useState<string | null>(null);
  const [shopFocus, setShopFocus] = useState<{
    eventId?: string;
    productId?: string;
    view?: ShopInitialView;
    adminTab?: "products" | "orders" | "private";
  } | null>(null);
  const [danceStyleFocus, setDanceStyleFocus] = useState<InstitutionalStyleId | null>(null);
  const [attendanceFocusStudentId, setAttendanceFocusStudentId] = useState<string | null>(null);
  const [showOnboard, setShowOnboard] = useState(false);

  const { tasks, updates } = useStudioData();
  const { unreadNotificationCount, accessibleChats, groupChats, getUnreadCountForChat, canSendUpdate } = useCommunication();
  const { getEvent, canManage: canManageLegacy } = useLegacyEvents();
  const { branding, effectiveFlags, impersonating, activeStudioId, setActiveStudioId, studios } = usePlatform();
  const { t, activeEditKey, setActiveEditKey } = useEditableText();
  const navTabs = useMemo(() => buildMainNavTabs(t), [t]);
  const brandStyle = useBrandingStyle(branding);
  const { layoutMode } = useDeviceLayout();
  const reducedMotion = useReducedMotion();
  const activeStudio = studios.find((s) => s.id === activeStudioId);
  const roleLines = getRoleHeaderLines(user, {
    activeStudioName: activeStudio?.name,
    impersonating
  });

  const canOpen = useCallback((s: StackTabId) => canOpenStackForUser(user, s, effectiveFlags), [user, effectiveFlags]);

  useEffect(() => {
    setShowOnboard(!readOnboardingDone());
  }, []);

  const notifCount = useMemo(() => {
    let n = unreadNotificationCount;
    n += accessibleChats.reduce((sum, c) => sum + getUnreadCountForChat(c.id), 0);
    return Math.min(99, n);
  }, [unreadNotificationCount, accessibleChats, getUnreadCountForChat]);

  const tabBadges = useMemo(
    () => computeMainTabBadges(user, tasks, notifCount),
    [user, tasks, notifCount]
  );

  const openMain = useCallback((m: MainTabId) => {
    setStack(null);
    setMainTab(m);
  }, []);

  const openShop = useCallback(
    (opts?: {
      eventId?: string;
      productId?: string;
      view?: ShopInitialView;
      adminTab?: "products" | "orders" | "private";
    }) => {
      setShopFocus(opts ?? null);
      setStack(null);
      setMainTab("shop");
    },
    []
  );

  const openAttendanceIntelligence = useCallback(
    (studentId?: string) => {
      if (!canOpen("attendance_intelligence")) return;
      setAttendanceFocusStudentId(studentId ?? null);
      setStack("attendance_intelligence");
    },
    [canOpen]
  );

  const openStack = useCallback(
    (s: StackTabId) => {
      if (!canOpen(s)) return;
      if (s !== "group_chats") setActiveChatId(null);
      if (s !== "legacy_board") setActiveLegacyEventId(null);
      if (s !== "shop") setShopFocus(null);
      if (s !== "dance_styles") setDanceStyleFocus(null);
      if (s !== "attendance_intelligence") setAttendanceFocusStudentId(null);
      setStack(s);
    },
    [canOpen]
  );

  const openChat = useCallback(
    (chatId: string) => {
      setActiveChatId(chatId);
      setStack("group_chats");
    },
    []
  );

  const openLegacyEvent = useCallback((id: string) => {
    setActiveLegacyEventId(id);
    setStack("legacy_board");
  }, []);

  const handleNavBack = useCallback(() => {
    if (activeChatId) {
      setActiveChatId(null);
      return;
    }
    if (activeLegacyEventId) {
      setActiveLegacyEventId(null);
      return;
    }
    setAttendanceFocusStudentId(null);
    setStack(null);
  }, [activeChatId, activeLegacyEventId]);

  const handleJump = useCallback(
    (j: CommandJump) => {
      if (j.type === "main") {
        openMain(j.target as MainTabId);
        return;
      }
      const t = j.target as StackTabId;
      if (canOpen(t)) setStack(t);
    },
    [canOpen, openMain]
  );

  const effective = stack ?? mainTab;

  const renderMain = () => {
    switch (mainTab) {
      case "dashboard":
        return (
          <DashboardScreen
            user={user}
            onOpenStack={openStack}
            onGoMain={openMain}
            onOpenShop={openShop}
            onOpenAttendanceIntelligence={openAttendanceIntelligence}
          />
        );
      case "lessons":
        return (
          <LessonsHubScreen
            user={user}
            onOpenFullSchedule={() => openStack("schedule_full")}
            onOpenAttendance={user.permissions.isTeacher ? () => openStack("attendance") : undefined}
            onOpenTeacher={user.permissions.isTeacher ? () => openStack("teacher") : undefined}
          />
        );
      case "messages":
        return (
          <MessagesHubScreen
            user={user}
            onOpenNotifications={() => openStack("notifications")}
            onOpenChats={() => openStack("group_chats")}
            onOpenSendUpdate={canSendUpdate ? () => setSendUpdateOpen(true) : undefined}
          />
        );
      case "shop":
        return (
          <ShopScreen
            initialEventId={shopFocus?.eventId}
            initialProductId={shopFocus?.productId}
            initialView={shopFocus?.view}
            initialAdminTab={shopFocus?.adminTab}
          />
        );
      case "more":
        return (
          <MoreMenu user={user} onOpenStack={openStack} onOpenSearch={() => setSearchOpen(true)} onOpenShop={() => openShop()} />
        );
      default:
        return null;
    }
  };

  const renderStack = () => {
    if (!stack) return null;
    switch (stack) {
      case "profile":
        return (
          <ProfileScreen
            user={user}
            onUserUpdate={onUserUpdate}
            onOpenNotifications={() => openStack("notifications")}
            onOpenSettings={() => openStack("settings")}
          />
        );
      case "progress":
        return <ProgressHubScreen user={user} onOpenStack={openStack} />;
      case "settings":
        return <StudioSettingsScreen />;
      case "view_display_settings":
        return <ViewModeSettings user={user} />;
      case "tasks_hub":
        return (
          <TasksHubScreen
            user={user}
            onOpenPractice={() => openStack("practice_hub")}
            onOpenTeacher={user.permissions.isTeacher ? () => openStack("teacher") : undefined}
            onOpenRehearsal={user.permissions.isTeacher ? () => openStack("rehearsal_mode") : undefined}
          />
        );
      case "text_editor":
        return <SuperAdminTextEditorScreen onBack={() => setStack(null)} />;
      case "practice_hub":
        return (
          <PracticeHubScreen
            onOpenGallery={() => openStack("gallery")}
            onOpenGalleryUpload={canSendUpdate ? () => setGalleryUploadOpen(true) : undefined}
          />
        );
      case "teacher":
        return (
          <TeacherDashboard
            user={user}
            onNavigate={openStack}
            onSendUpdate={canSendUpdate ? () => setSendUpdateOpen(true) : undefined}
            onOpenShop={(focus) => openShop(focus)}
          />
        );
      case "files":
        return <StudentFilesScreen user={user} />;
      case "attendance":
        return <AttendanceScreen user={user} />;
      case "attendance_intelligence":
        return (
          <AttendanceIntelligenceScreen
            user={user}
            initialStudentId={attendanceFocusStudentId}
            onOpenTasks={() => setStack("tasks_hub")}
          />
        );
      case "ai":
        return <AiToolsScreen />;
      case "management":
        return (
          <ManagementDashboard
            user={user}
            onOpenUsers={() => openStack("users")}
            onNavigate={openStack}
            onOpenShop={(focus) => openShop(focus)}
          />
        );
      case "users":
        return (
          <UserManagementScreen actor={user} onOpenRelationships={() => openStack("user_relationships")} />
        );
      case "user_relationships":
        return <RelationshipManagerScreen actor={user} onBack={() => openStack("users")} />;
      case "reports":
        return <ReportsScreen />;
      case "studio_settings":
        return <StudioSettingsScreen />;
      case "schedule_full":
        return <ScheduleScreen />;
      case "notifications":
        return (
          <NotificationCenterScreen
            onNavigate={({ stack, main, chatId }) => {
              if (main) openMain(main);
              if (stack) openStack(stack);
              if (chatId) openChat(chatId);
            }}
          />
        );
      case "group_chats": {
        const chat = activeChatId ? groupChats.find((c) => c.id === activeChatId) : null;
        if (chat) return <GroupChatDetailScreen chat={chat} />;
        return (
          <GroupChatsListScreen
            onOpenChat={openChat}
            onSendUpdate={canSendUpdate ? () => setSendUpdateOpen(true) : undefined}
          />
        );
      }
      case "gallery":
        return (
          <GalleryScreen onUpload={canSendUpdate ? () => setGalleryUploadOpen(true) : undefined} />
        );
      case "legacy_board": {
        const legacyEvent = activeLegacyEventId ? getEvent(activeLegacyEventId) : null;
        if (legacyEvent) {
          return (
            <LegacyEventDetailScreen
              event={legacyEvent}
              onEdit={
                canManageLegacy
                  ? () => {
                      setLegacyEditId(legacyEvent.id);
                      setLegacyManageOpen(true);
                    }
                  : undefined
              }
              onBuyTickets={legacyEvent.status !== "past" ? () => openShop({ eventId: legacyEvent.id }) : undefined}
              onBack={() => setActiveLegacyEventId(null)}
            />
          );
        }
        return (
          <LegacyBoardScreen
            onOpenEvent={openLegacyEvent}
            onCreateEvent={canManageLegacy ? () => { setLegacyEditId(null); setLegacyManageOpen(true); } : undefined}
          />
        );
      }
      case "levels":
        return <LevelSystemScreen />;
      case "rehearsal_mode":
        return <RehearsalModeScreen onSendGroupUpdate={canSendUpdate ? () => setSendUpdateOpen(true) : undefined} />;
      case "feedback_hub":
        return <FeedbackHubScreen />;
      case "calendar_hub":
        return <CalendarHubScreen />;
      case "parent_peace":
        return <ParentPeaceScreen />;
      case "studio_health":
        return <StudioHealthScreen />;
      case "live_feed":
        return <LiveEventFeedScreen />;
      case "ai_coach":
        return <AiCoachScreen />;
      case "risk_center":
        return <RiskCenterScreen />;
      case "creator_dashboard":
        return <CreatorDashboardScreen onNavigate={openStack} />;
      case "super_admin_hub":
        return <SuperAdminHubScreen onNavigate={openStack} />;
      case "activity_feed":
        return <ActivityFeedScreen />;
      case "backup_restore":
        return <BackupRestoreScreen user={user} />;
      case "system_status":
        return <SystemStatusScreen />;
      case "parent_consents":
        return <ConsentHubScreen user={user} />;
      case "moderation_queue":
        return <ModerationQueueScreen user={user} />;
      case "event_command_center":
        return <EventCommandCenterScreen user={user} />;
      case "role_onboarding":
        return <RoleOnboardingScreen user={user} onNavigate={openStack} />;
      case "studios_admin":
        return <StudiosAdminScreen />;
      case "feature_flags":
        return <FeatureFlagsScreen />;
      case "platform_audit":
        return <AuditLogScreen scope="platform" />;
      case "audit_log":
        return <AuditLogScreen scope="studio" />;
      case "system_updates":
        return <SystemUpdatesScreen />;
      case "data_safety":
        return <DataSafetyScreen />;
      case "billing":
        return <BillingScreen mode="studio" />;
      case "platform_billing":
        return <BillingScreen mode="platform" />;
      case "branding_editor":
        return <BrandingEditorScreen />;
      case "global_settings":
        return <GlobalSettingsScreen />;
      case "shop":
        return (
          <ShopScreen
            initialEventId={shopFocus?.eventId}
            initialProductId={shopFocus?.productId}
            initialView={shopFocus?.view}
            initialAdminTab={shopFocus?.adminTab}
          />
        );
      case "studio_legacy":
        return (
          <StudioLegacyScreen
            onOpenLegacyBoard={effectiveFlags.achievementsBoard ? () => openStack("legacy_board") : undefined}
            onOpenEvent={(id) => openLegacyEvent(id)}
          />
        );
      case "studio_media":
        return <StudioMediaFeed />;
      case "studio_faculty":
        return (
          <FacultyHubScreen
            onOpenMedia={() => openStack("studio_media")}
            onOpenStyle={(id) => {
              setDanceStyleFocus(id);
              openStack("dance_styles");
            }}
            onBookPrivateLesson={(teacherId) => openShop({ productId: `pl_${teacherId}`, view: "private_detail" })}
          />
        );
      case "dance_styles":
        return (
          <DanceStylesScreen
            initialStyleId={danceStyleFocus ?? undefined}
            onOpenFaculty={() => openStack("studio_faculty")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ToastProvider>
    <ShopProvider user={user} initialEventId={shopFocus?.eventId ?? null}>
      <PrivateLessonsProvider user={user}>
      <AttendanceIntelligenceProvider user={user}>
      <StudioIdentityProvider user={user}>
        <AppLayoutChrome
          brandStyle={brandStyle}
          mainTab={mainTab}
          tabs={navTabs}
          tabBadges={tabBadges}
          onTabChange={openMain}
          previewBar={<CreatorPreviewBar user={user} />}
          installHint={
            <div className={cx(layoutMode === "mobile" && "px-5", layoutMode === "tablet" && "px-6", layoutMode === "desktop" && "px-8 pt-4")}>
              <InstallHintBanner />
            </div>
          }
          header={
            <header className={cx("header-sticky-layer mb-4", layoutMode === "mobile" && "px-5", layoutMode === "tablet" && "px-6", layoutMode === "desktop" && "mb-6")}>
          <div className={cx(surfaces.header, "px-3.5 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.25)]")}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className={interaction.iconBtn}
                  aria-label="חיפוש"
                >
                  <Search size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => openStack("notifications")}
                  className={cx(interaction.iconBtn, "relative")}
                  aria-label="התראות"
                >
                  <Bell size={18} />
                  {notifCount > 0 ? (
                    <span className="absolute -top-0.5 -left-0.5 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  ) : null}
                </button>
              </div>

              {stack ? (
                <button
                  type="button"
                  onClick={handleNavBack}
                  className="flex min-h-[2.75rem] min-w-0 flex-1 touch-manipulation items-center justify-end gap-1 py-2 text-right text-emerald-200/90 active:opacity-80"
                >
                  <span className="truncate text-[14px] font-semibold">חזרה</span>
                  <ChevronRight size={18} className="shrink-0 rotate-180" />
                </button>
              ) : (
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">{branding.appName}</p>
                  <p className="mt-0.5 truncate text-[15px] font-semibold leading-tight text-white">{user.name}</p>
                  <p className="truncate text-[11px] font-medium text-white/42">{roleLines.primary}</p>
                  <p className="truncate text-[10px] text-white/32">{roleLines.secondary}</p>
                  {user.permissions.isSuperAdmin && studios.length > 1 ? (
                    <select
                      className="mt-1 max-w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-white"
                      value={activeStudioId}
                      onChange={(e) => setActiveStudioId(e.target.value)}
                    >
                      {studios.map((s) => (
                        <option key={s.id} value={s.id} className="bg-zinc-900">
                          {s.name}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
              )}

              <GhostButton className="!shrink-0 !rounded-full !border-white/[0.12] !bg-white/[0.05] !px-3 !py-2 !text-[11px] !font-semibold" onClick={onLogout}>
                יציאה
              </GhostButton>
            </div>
          </div>
        </header>
          }
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={effective}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {stack ? renderStack() : renderMain()}
            </motion.div>
          </AnimatePresence>
        </AppLayoutChrome>

      <SyncStatusBanner />
      <GlobalSearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} user={user} onJump={handleJump} />

      <GalleryUploadSheet open={galleryUploadOpen} onClose={() => setGalleryUploadOpen(false)} user={user} />
      <SendUpdateSheet open={sendUpdateOpen} onClose={() => setSendUpdateOpen(false)} user={user} />
      <LegacyEventManageSheet
        open={legacyManageOpen}
        onClose={() => { setLegacyManageOpen(false); setLegacyEditId(null); }}
        editEvent={legacyEditId ? getEvent(legacyEditId) ?? null : null}
      />

      {showOnboard ? <OnboardingModal onDone={() => setShowOnboard(false)} /> : null}

      <TextEditorSheet
        textKey={activeEditKey}
        open={Boolean(activeEditKey)}
        onClose={() => setActiveEditKey(null)}
      />
      </StudioIdentityProvider>
      </AttendanceIntelligenceProvider>
      </PrivateLessonsProvider>
    </ShopProvider>
    <ToastHost />
    </ToastProvider>
  );
}

function AppShellTextProvider({ user, children }: { user: UserProfile; children: ReactNode }) {
  const { activeStudioId } = usePlatform();
  const studioId = user.permissions.isSuperAdmin ? activeStudioId : user.studioId;
  return (
    <EditableTextProvider user={user} studioId={studioId}>
      {children}
    </EditableTextProvider>
  );
}

export function AppShell({
  user,
  onLogout,
  onUserUpdate
}: {
  user: UserProfile;
  onLogout: () => void;
  onUserUpdate: (next: UserProfile) => void;
}) {
  return (
    <StudioDataProvider user={user}>
      <ProductDataProvider key={user.id} user={user}>
        <CommunicationProvider user={user}>
          <LegacyEventsProvider user={user}>
            <StudioOSProvider user={user}>
              <UserDirectoryProvider>
                <AppShellTextProvider user={user}>
                  <PlatformOSProvider user={user}>
                    <EventOperatingModeProvider user={user}>
                      <AppContent user={user} onLogout={onLogout} onUserUpdate={onUserUpdate} />
                    </EventOperatingModeProvider>
                  </PlatformOSProvider>
                </AppShellTextProvider>
              </UserDirectoryProvider>
            </StudioOSProvider>
          </LegacyEventsProvider>
        </CommunicationProvider>
      </ProductDataProvider>
    </StudioDataProvider>
  );
}
