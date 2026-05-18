"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { TopBar } from "./TopBar";
import { BottomNav, type NavKey } from "./BottomNav";
import { BottomSheet } from "./BottomSheet";
import { RoleSwitcher } from "./RoleSwitcher";
import { Dashboard } from "@/components/lovable/dashboard/Dashboard";
import { NotificationList } from "@/components/lovable/dashboard/NotificationList";
import { NOTIFICATIONS, ROLES, ROLE_NAME } from "@/lib/lovable/sample-data";
import type { ClassSession, Role } from "@/lib/lovable/types";

export function AppShell() {
  const [role, setRole] = useState<Role>("student");
  const [tab, setTab] = useState<NavKey>("home");
  const [roleOpen, setRoleOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [activeClass, setActiveClass] = useState<ClassSession | null>(null);

  const unread = useMemo(
    () => NOTIFICATIONS.filter((n) => n.unread).length,
    [],
  );

  const handleRoleSelect = (next: Role) => {
    setRole(next);
    setRoleOpen(false);
    const meta = ROLES.find((r) => r.id === next);
    toast(`עברת לתצוגת ${meta?.label}`, {
      description: meta?.tagline,
    });
  };

  const handleNav = (key: NavKey) => {
    setTab(key);
    if (key === "alerts") setAlertsOpen(true);
    if (key === "profile") setRoleOpen(true);
  };

  return (
    <div className="relative min-h-dvh" dir="rtl">
      <TopBar
        role={role}
        name={ROLE_NAME[role]}
        unread={unread}
        onNotifications={() => setAlertsOpen(true)}
        onRoleTap={() => setRoleOpen(true)}
      />

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={role + tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Dashboard role={role} onOpenClass={setActiveClass} />
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav active={tab} onChange={handleNav} unread={unread} />

      <BottomSheet
        open={roleOpen}
        onOpenChange={setRoleOpen}
        title="החלפת תצוגה"
        description="צפייה בחוויה מנקודת המבט של תלמיד, מורה או הנהלה."
      >
        <RoleSwitcher active={role} onSelect={handleRoleSelect} />
      </BottomSheet>

      <BottomSheet
        open={alertsOpen}
        onOpenChange={setAlertsOpen}
        title="התראות"
        description={`${unread} חדשות`}
      >
        <NotificationList items={NOTIFICATIONS} />
      </BottomSheet>

      <BottomSheet
        open={!!activeClass}
        onOpenChange={(o) => !o && setActiveClass(null)}
        title={activeClass?.title}
        description={
          activeClass
            ? `${activeClass.style} · עם ${activeClass.teacher}`
            : undefined
        }
      >
        {activeClass && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { k: "אולפן", v: activeClass.room },
                { k: "משך", v: `${activeClass.durationMin} דק׳` },
                { k: "רמה", v: activeClass.level },
              ].map((c) => (
                <div key={c.k} className="glass rounded-2xl px-2 py-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {c.k}
                  </div>
                  <div className="mt-1 text-sm font-medium">{c.v}</div>
                </div>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              שיעור זורם המחבר נשימה, משקל ותנופה. כולל עבודת רצפה,
              עבודה בזוגות ופראזה ארוכה באלכסון.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  toast.success(`נרשמת · ${activeClass.title}`, {
                    description: `${activeClass.room} · ${new Date(
                      activeClass.startsAt,
                    ).toLocaleTimeString("he-IL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`,
                  });
                  setActiveClass(null);
                }}
                className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
              >
                הרשמה לשיעור
              </button>
              <button
                onClick={() => setActiveClass(null)}
                className="rounded-full border border-hairline px-5 text-sm font-medium text-foreground"
              >
                סגירה
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
