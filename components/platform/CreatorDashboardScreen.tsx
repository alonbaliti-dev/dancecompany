"use client";

import { Building2, Database, Flag, FileText, Pencil, RefreshCw, Shield, ToggleLeft, ToggleRight } from "lucide-react";
import { useEditableText } from "@/context/EditableTextContext";
import { usePlatform } from "@/context/PlatformContext";
import { useShop } from "@/context/ShopContext";
import type { StackTabId } from "@/lib/types";
import { PLATFORM_OWNER_BADGE, PLATFORM_OWNER_NAME } from "@/lib/demo/identity";
import { Header, SectionEyebrow, screenClass } from "../ui";
import { ActionRow, StatCard } from "./PlatformUi";
import { DatabaseToolsPanel } from "./DatabaseToolsPanel";

export function CreatorDashboardScreen({ onNavigate }: { onNavigate: (s: StackTabId) => void }) {
  const { studios, platformBilling, forceRefreshMock } = usePlatform();
  const { canEdit, textEditMode, setTextEditMode } = useEditableText();
  const shop = useShop();
  const active = studios.filter((s) => s.status === "active").length;
  const users = studios.reduce((n, s) => n + s.activeUsers, 0);
  const shopRevenue = shop.orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.totalPrice, 0);
  const shopOrderCount = shop.orders.length;

  return (
    <div className={screenClass}>
      <Header title={`ניהול · ${PLATFORM_OWNER_NAME}`} subtitle="סטודיואים, הרשאות, תכונות, טקסטים ויומן פעולות במקום אחד." />
      <p className="-mt-4 rounded-2xl border border-violet-400/20 bg-violet-500/[0.08] px-4 py-2.5 text-right text-[11px] font-medium tracking-wide text-violet-100/85">
        {PLATFORM_OWNER_BADGE}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard label="סטודיואים" value={studios.length} sub={`${active} פעילים`} />
        <StatCard label="משתמשים" value={users} sub="בכל הסטודיואים" />
        <StatCard label="אחסון" value={`${platformBilling.storageGb} GB`} />
        <StatCard label="תשלום חודשי" value={`₪${platformBilling.monthlyPriceNis}`} sub={platformBilling.paymentStatus === "paid" ? "שולם" : "ממתין"} />
        {shop.canViewPlatformAnalytics ? (
          <>
            <StatCard label="הזמנות חנות" value={shopOrderCount} sub="כל הסטודיואים (מוק)" />
            <StatCard label="הכנסות חנות" value={`₪${shopRevenue}`} sub="שולם בדגמה" />
          </>
        ) : null}
      </div>
      <div>
        <SectionEyebrow>פעולות מהירות</SectionEyebrow>
        <div className="mt-3 space-y-2">
          <ActionRow title="ניהול ראשי" subtitle="מסד נתונים, חנות ומיתוג" icon={Database} onPress={() => onNavigate("super_admin_hub")} />
          <ActionRow title="סטודיואים" icon={Building2} onPress={() => onNavigate("studios_admin")} />
          <ActionRow title="אפשרויות" icon={Flag} onPress={() => onNavigate("feature_flags")} />
          <ActionRow title="יומן ביקורת" icon={Shield} onPress={() => onNavigate("platform_audit")} />
          <ActionRow title="עדכוני אפליקציה" icon={FileText} onPress={() => onNavigate("system_updates")} />
          <ActionRow title="רענון גרסה" subtitle="טעינה מחדש של הנתונים" icon={RefreshCw} onPress={forceRefreshMock} />
          {canEdit ? (
            <>
              <ActionRow title="עריכת טקסטים" subtitle="כותרות וכפתורים באפליקציה" icon={Pencil} onPress={() => onNavigate("text_editor")} />
              <button
                type="button"
                onClick={() => setTextEditMode(!textEditMode)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/[0.08] px-4 py-3.5 text-right transition active:scale-[0.99]"
              >
                <span className="text-violet-200/80">{textEditMode ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{textEditMode ? "מצב עריכה פעיל" : "הפעלת מצב עריכה"}</p>
                  <p className="mt-0.5 text-xs text-white/45">אייקוני עיפרון ליד טקסטים באפליקציה</p>
                </div>
              </button>
            </>
          ) : null}
        </div>
      </div>
      <DatabaseToolsPanel />
    </div>
  );
}
