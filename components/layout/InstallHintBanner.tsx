"use client";

import { Share, X } from "lucide-react";
import { useDeviceLayout } from "@/context/DeviceLayoutContext";
import { shouldShowInstallHint } from "@/lib/device/device-detection";
import { isSafariEngine, isSamsungInternet } from "@/lib/layout/viewport-sync";
import { GhostButton } from "../ui";

export function InstallHintBanner() {
  const { snapshot, prefs, dismissInstallHint, mounted } = useDeviceLayout();
  if (!mounted || !shouldShowInstallHint(snapshot, prefs)) return null;

  const installHint =
    typeof window !== "undefined" && isSafariEngine()
      ? "ב-Safari: שיתוף ← «הוסף למסך הבית». ב-Chrome: תפריט ← התקנת אפליקציה."
      : typeof window !== "undefined" && isSamsungInternet()
        ? "בדפדפן Samsung: תפריט ← הוסף לדף הבית."
        : "ב-Safari: שיתוף → «הוסף למסך הבית». ב-Chrome: תפריט → התקנת אפליקציה.";

  return (
    <div className="mb-4 rounded-[18px] border border-emerald-400/20 bg-emerald-500/[0.08] px-4 py-3.5 text-right">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => dismissInstallHint(14)}
          className="shrink-0 rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
          aria-label="סגירה"
        >
          <X size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="flex items-center justify-end gap-2 font-semibold text-emerald-50">
            <Share size={16} className="text-emerald-200/80" />
            אפשר להוסיף למסך הבית
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-emerald-100/55">{installHint}</p>
          <GhostButton className="mt-2 !text-[11px]" onClick={() => dismissInstallHint(30)}>
            אל תציג שוב
          </GhostButton>
        </div>
      </div>
    </div>
  );
}
