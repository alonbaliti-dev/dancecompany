"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  type DevicePreferences,
  type DeviceSnapshot,
  type PreviewRole,
  type ResolvedLayoutMode,
  type ViewMode,
  captureDeviceSnapshot,
  readDevicePreferences,
  resolveLayoutMode,
  writeDevicePreferences
} from "@/lib/device/device-detection";

type DeviceLayoutContextValue = {
  mounted: boolean;
  snapshot: DeviceSnapshot;
  prefs: DevicePreferences;
  layoutMode: ResolvedLayoutMode;
  effectiveWidth: number;
  setViewMode: (mode: ViewMode) => void;
  setPreviewLayout: (mode: ResolvedLayoutMode | null) => void;
  setPreviewRole: (role: PreviewRole) => void;
  dismissInstallHint: (days?: number) => void;
  refreshSnapshot: () => void;
};

const FALLBACK_SNAPSHOT: DeviceSnapshot = {
  deviceType: "mobile",
  runtime: "browser",
  viewportWidth: 390,
  viewportHeight: 844,
  touchCapable: true,
  standalone: false,
  prefersReducedMotion: false
};

const DeviceLayoutContext = createContext<DeviceLayoutContextValue | null>(null);

export function DeviceLayoutProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [snapshot, setSnapshot] = useState<DeviceSnapshot>(FALLBACK_SNAPSHOT);
  const [prefs, setPrefs] = useState<DevicePreferences>(() => readDevicePreferences());

  const refreshSnapshot = useCallback(() => {
    setSnapshot(captureDeviceSnapshot());
  }, []);

  useEffect(() => {
    setMounted(true);
    setPrefs(readDevicePreferences());
    refreshSnapshot();

    const onResize = () => refreshSnapshot();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [refreshSnapshot]);

  const persist = useCallback((next: DevicePreferences) => {
    setPrefs(next);
    writeDevicePreferences(next);
  }, []);

  const setViewMode = useCallback(
    (mode: ViewMode) => {
      persist({ ...prefs, viewMode: mode });
    },
    [persist, prefs]
  );

  const setPreviewLayout = useCallback(
    (mode: ResolvedLayoutMode | null) => {
      persist({ ...prefs, previewLayout: mode });
    },
    [persist, prefs]
  );

  const setPreviewRole = useCallback(
    (role: PreviewRole) => {
      persist({ ...prefs, previewRole: role });
    },
    [persist, prefs]
  );

  const dismissInstallHint = useCallback(
    (days = 14) => {
      persist({
        ...prefs,
        dismissInstallHintUntil: Date.now() + days * 24 * 60 * 60 * 1000
      });
    },
    [persist, prefs]
  );

  const layoutMode = useMemo(() => {
    const width = snapshot.viewportWidth;
    return resolveLayoutMode(prefs.viewMode, width, prefs.previewLayout);
  }, [prefs.viewMode, prefs.previewLayout, snapshot.viewportWidth]);

  const effectiveWidth = useMemo(() => {
    if (prefs.previewLayout === "mobile") return 390;
    if (prefs.previewLayout === "tablet") return 900;
    if (prefs.previewLayout === "desktop") return Math.max(snapshot.viewportWidth, 1280);
    if (prefs.viewMode === "mobile") return 390;
    if (prefs.viewMode === "tablet") return 900;
    if (prefs.viewMode === "desktop") return Math.max(snapshot.viewportWidth, 1280);
    return snapshot.viewportWidth;
  }, [prefs.previewLayout, prefs.viewMode, snapshot.viewportWidth]);

  const value = useMemo<DeviceLayoutContextValue>(
    () => ({
      mounted,
      snapshot,
      prefs,
      layoutMode,
      effectiveWidth,
      setViewMode,
      setPreviewLayout,
      setPreviewRole,
      dismissInstallHint,
      refreshSnapshot
    }),
    [
      mounted,
      snapshot,
      prefs,
      layoutMode,
      effectiveWidth,
      setViewMode,
      setPreviewLayout,
      setPreviewRole,
      dismissInstallHint,
      refreshSnapshot
    ]
  );

  return <DeviceLayoutContext.Provider value={value}>{children}</DeviceLayoutContext.Provider>;
}

export function useDeviceLayout(): DeviceLayoutContextValue {
  const ctx = useContext(DeviceLayoutContext);
  if (!ctx) throw new Error("useDeviceLayout must be used within DeviceLayoutProvider");
  return ctx;
}

export function useDeviceLayoutSafe(): DeviceLayoutContextValue | null {
  return useContext(DeviceLayoutContext);
}
