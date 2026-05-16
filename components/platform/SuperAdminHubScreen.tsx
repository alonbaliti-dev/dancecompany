"use client";

import { Building2, Database, Flag, Pencil, Shield, ShoppingBag, ToggleLeft, ToggleRight } from "lucide-react";
import { useEditableText } from "@/context/EditableTextContext";
import { usePlatform } from "@/context/PlatformContext";
import { useShop } from "@/context/ShopContext";
import { PLATFORM_OWNER_BADGE, PLATFORM_OWNER_NAME } from "@/lib/demo/identity";
import { getDbSystemSettings } from "@/lib/local-db/db-access";
import type { StackTabId } from "@/lib/types";
import { DatabaseIntegrityPanel } from "./DatabaseIntegrityPanel";
import { DatabaseToolsPanel } from "./DatabaseToolsPanel";
import { Header, SectionEyebrow, screenClass } from "../ui";
import { ActionRow, StatCard } from "./PlatformUi";

export function SuperAdminHubScreen({ onNavigate }: { onNavigate: (s: StackTabId) => void }) {
  const { studios, platformBilling, auditLog } = usePlatform();
  const { canEdit, textEditMode, setTextEditMode } = useEditableText();
  const shop = useShop();
  const settings = getDbSystemSettings();

  const active = studios.filter((s) => s.status === "active").length;
  const users = studios.reduce((n, s) => n + s.activeUsers, 0);
  const shopRevenue = shop.orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.totalPrice, 0);
  const recentAudit = auditLog.slice(0, 5);

  return (
    <div className={screenClass}>
      <Header
        title={`מרכז שליטה · ${PLATFORM_OWNER_NAME}`}
        subtitle="מסד נתונים, תוכן, הרשאות, חנות וביקורת — כל השינויים נשמרים ב-/database."
      />
      <p className="-mt-4 rounded-2xl border border-violet-400/20 bg-violet-500/[0.08] px-4 py-2.5 text-right text-[11px] font-medium tracking-wide text-violet-100/85">
        {PLATFORM_OWNER_BADGE}
        {settings.paymentsDemoMode ? " · תשלומים במצב הדגמה בלבד" : ""}
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        <StatCard label="סטודיואים" value={studios.length} sub={`${active} פעילים`} />
        <StatCard label="משתמשים" value={users} sub="בכל הסטודיואים" />
        <StatCard label="רשומות ביקורת" value={auditLog.length} />
        <StatCard label="הכנסות חנות" value={`₪${shopRevenue}`} sub="שולם (מוק)" />
      </div>

      <div>
        <SectionEyebrow>ניהול פלטפורמה</SectionEyebrow>
        <div className="mt-3 space-y-2">
          <ActionRow title="גיבוי ושחזור" icon={Database} onPress={() => onNavigate("backup_restore")} />
          <ActionRow title="סטטוס מערכת" icon={Shield} onPress={() => onNavigate("system_status")} />
          <ActionRow title="פעילות פלטפורמה" icon={Flag} onPress={() => onNavigate("activity_feed")} />
          <ActionRow title="סטודיואים" icon={Building2} onPress={() => onNavigate("studios_admin")} />
          <ActionRow title="ניהול תכונות" icon={Flag} onPress={() => onNavigate("feature_flags")} />
          <ActionRow title="מיתוג" icon={Pencil} onPress={() => onNavigate("branding_editor")} />
          <ActionRow title="עריכת טקסטים" icon={Pencil} onPress={() => onNavigate("text_editor")} />
          <ActionRow title="יומן ביקורת" icon={Shield} onPress={() => onNavigate("platform_audit")} />
          <ActionRow title="חנות — סקירה" icon={ShoppingBag} onPress={() => onNavigate("shop")} />
          <ActionRow title="אבטחה ופרטיות" icon={Shield} onPress={() => onNavigate("data_safety")} />
          {canEdit ? (
            <button
              type="button"
              onClick={() => setTextEditMode(!textEditMode)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/[0.08] px-4 py-3.5 text-right"
            >
              <span className="text-violet-200/80">{textEditMode ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}</span>
              <div>
                <p className="text-sm font-semibold text-white">{textEditMode ? "מצב עריכה פעיל" : "הפעלת מצב עריכה"}</p>
                <p className="mt-0.5 text-xs text-white/45">טקסטים גלובליים באפליקציה</p>
              </div>
            </button>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 text-violet-200/80">
          <Database size={18} />
          <SectionEyebrow>מסד נתונים</SectionEyebrow>
        </div>
        <DatabaseToolsPanel />
      </div>

      <DatabaseIntegrityPanel />

      {recentAudit.length > 0 ? (
        <div>
          <SectionEyebrow>פעילות אחרונה</SectionEyebrow>
          <ul className="mt-3 space-y-2 text-right text-sm text-white/50">
            {recentAudit.map((a) => (
              <li key={a.id} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
                <span className="text-white/70">{a.actorName}</span> — {a.action}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-center text-[10px] text-white/30">
        אחסון פלטפורמה: {platformBilling.storageGb} GB · סכימה v{settings.databaseSchemaVersion}
      </p>
    </div>
  );
}
