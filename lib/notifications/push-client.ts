export type PushSupportStatus =
  | { supported: true; permission: NotificationPermission; serviceWorkerReady: boolean }
  | { supported: false; reason: "missing_window" | "unsupported_browser" | "insecure_context" };

export function getPushSupportStatus(): PushSupportStatus {
  if (typeof window === "undefined") return { supported: false, reason: "missing_window" };
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { supported: false, reason: "unsupported_browser" };
  }
  if (!window.isSecureContext) return { supported: false, reason: "insecure_context" };

  return {
    supported: true,
    permission: Notification.permission,
    serviceWorkerReady: Boolean(navigator.serviceWorker.controller)
  };
}

export async function ensurePushServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.register("/lk-push-sw.js", { scope: "/" });
}

export async function requestPushPermissionWhenUserAsks(): Promise<NotificationPermission | "unsupported"> {
  const status = getPushSupportStatus();
  if (!status.supported) return "unsupported";
  if (status.permission !== "default") return status.permission;
  await ensurePushServiceWorker();
  return Notification.requestPermission();
}
