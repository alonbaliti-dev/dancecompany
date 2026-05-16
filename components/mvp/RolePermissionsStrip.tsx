"use client";

import { useEffect, useState } from "react";
import { Shield, X } from "lucide-react";
import { PERMISSIONS_STRIP_STORAGE_KEY } from "@/lib/mvp/mvp-policy";
import { summarizeUserPermissions } from "@/lib/mvp/permissions-summary";
import type { UserProfile } from "@/lib/types";

export function RolePermissionsStrip({ user }: { user: UserProfile }) {
  const storageKey = `${PERMISSIONS_STRIP_STORAGE_KEY}:${user.id}`;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(sessionStorage.getItem(storageKey) !== "1");
    } catch {
      setVisible(true);
    }
  }, [storageKey]);

  if (!visible) return null;

  const { roleLabel, capabilities } = summarizeUserPermissions(user);

  function dismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="lk-permissions-strip relative px-4 py-3 pr-11 text-right" dir="rtl">
      <button
        type="button"
        onClick={dismiss}
        className="touch-icon-btn absolute left-2 top-2 rounded-full text-white/40 hover:text-white/70"
        aria-label="סגירה"
      >
        <X size={18} />
      </button>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10">
          <Shield size={18} className="text-emerald-200" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200/75">הרשאות החשבון</p>
          <p className="mt-0.5 text-[15px] font-semibold text-white">{roleLabel}</p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-white/48">{capabilities.join(" · ")}</p>
        </div>
      </div>
    </section>
  );
}
