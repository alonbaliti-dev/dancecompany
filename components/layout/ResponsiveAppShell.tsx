"use client";

import type { UserProfile } from "@/lib/types";
import { DeviceLayoutProvider } from "@/context/DeviceLayoutContext";
import { AppShell } from "../AppShell";
import { ViewportSync } from "./ViewportSync";

/**
 * Wraps the authenticated app with client-side device detection and responsive layouts.
 */
export function ResponsiveAppShell({
  user,
  onLogout,
  onUserUpdate
}: {
  user: UserProfile;
  onLogout: () => void;
  onUserUpdate: (next: UserProfile) => void;
}) {
  return (
    <DeviceLayoutProvider>
      <ViewportSync />
      <AppShell user={user} onLogout={onLogout} onUserUpdate={onUserUpdate} />
    </DeviceLayoutProvider>
  );
}
