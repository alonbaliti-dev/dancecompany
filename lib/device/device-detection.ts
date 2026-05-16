/**
 * Client-side device / runtime detection — call only in browser (useEffect).
 */
export type DeviceType = "mobile" | "tablet" | "desktop";
export type AppRuntime = "browser" | "pwa" | "native_shell";
export type ViewMode = "auto" | "mobile" | "tablet" | "desktop";
export type ResolvedLayoutMode = "mobile" | "tablet" | "desktop";

export type PreviewRole = "student" | "teacher" | "management" | null;

export type DeviceSnapshot = {
  deviceType: DeviceType;
  runtime: AppRuntime;
  viewportWidth: number;
  viewportHeight: number;
  touchCapable: boolean;
  standalone: boolean;
  prefersReducedMotion: boolean;
};

export type DevicePreferences = {
  viewMode: ViewMode;
  previewLayout: ResolvedLayoutMode | null;
  previewRole: PreviewRole;
  dismissInstallHintUntil: number | null;
};

const STORAGE_KEY = "lk_device_prefs_v1";

const DEFAULT_PREFS: DevicePreferences = {
  viewMode: "auto",
  previewLayout: null,
  previewRole: null,
  dismissInstallHintUntil: null
};

export const LAYOUT_BREAKPOINTS = {
  tabletMin: 768,
  desktopMin: 1024
} as const;

export function deviceTypeFromWidth(width: number): DeviceType {
  if (width >= LAYOUT_BREAKPOINTS.desktopMin) return "desktop";
  if (width >= LAYOUT_BREAKPOINTS.tabletMin) return "tablet";
  return "mobile";
}

export function resolveLayoutMode(
  viewMode: ViewMode,
  width: number,
  previewLayout: ResolvedLayoutMode | null
): ResolvedLayoutMode {
  if (previewLayout) return previewLayout;
  if (viewMode !== "auto") return viewMode;
  return deviceTypeFromWidth(width);
}

export function detectTouchCapable(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    nav.standalone === true
  );
}

export function detectRuntime(): AppRuntime {
  if (typeof window === "undefined") return "browser";
  if (detectStandalone()) {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("capacitor") || ua.includes("electron")) return "native_shell";
    return "pwa";
  }
  return "browser";
}

export function captureDeviceSnapshot(): DeviceSnapshot {
  const width =
    typeof window !== "undefined" ? Math.round(window.visualViewport?.width ?? window.innerWidth) : 390;
  const height =
    typeof window !== "undefined" ? Math.round(window.visualViewport?.height ?? window.innerHeight) : 844;
  return {
    deviceType: deviceTypeFromWidth(width),
    runtime: detectRuntime(),
    viewportWidth: width,
    viewportHeight: height,
    touchCapable: detectTouchCapable(),
    standalone: detectStandalone(),
    prefersReducedMotion:
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  };
}

export function readDevicePreferences(): DevicePreferences {
  if (typeof window === "undefined") return { ...DEFAULT_PREFS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw) as Partial<DevicePreferences>;
    return {
      viewMode: parsed.viewMode ?? DEFAULT_PREFS.viewMode,
      previewLayout: parsed.previewLayout ?? null,
      previewRole: parsed.previewRole ?? null,
      dismissInstallHintUntil: parsed.dismissInstallHintUntil ?? null
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function writeDevicePreferences(prefs: DevicePreferences): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function deviceTypeLabelHe(type: DeviceType): string {
  const map: Record<DeviceType, string> = {
    mobile: "טלפון",
    tablet: "טאבלט",
    desktop: "מחשב"
  };
  return map[type];
}

export function runtimeLabelHe(runtime: AppRuntime): string {
  const map: Record<AppRuntime, string> = {
    browser: "דפדפן",
    pwa: "אפליקציה מותקנת",
    native_shell: "אפליקציה מותקנת"
  };
  return map[runtime];
}

export function viewModeLabelHe(mode: ViewMode): string {
  const map: Record<ViewMode, string> = {
    auto: "אוטומטי",
    mobile: "טלפון",
    tablet: "טאבלט",
    desktop: "מחשב"
  };
  return map[mode];
}

export function layoutModeLabelHe(mode: ResolvedLayoutMode): string {
  return deviceTypeLabelHe(mode);
}

export function previewRoleLabelHe(role: PreviewRole): string {
  if (!role) return "ללא";
  const map: Record<NonNullable<PreviewRole>, string> = {
    student: "תלמיד/ה",
    teacher: "מורה",
    management: "הנהלה"
  };
  return map[role];
}

export function shouldShowInstallHint(
  snapshot: DeviceSnapshot,
  prefs: DevicePreferences
): boolean {
  if (snapshot.runtime !== "browser") return false;
  if (snapshot.deviceType === "desktop") return false;
  if (prefs.dismissInstallHintUntil && Date.now() < prefs.dismissInstallHintUntil) return false;
  return true;
}
