import { captureDeviceSnapshot } from "@/lib/device/device-detection";

/** Sync dynamic viewport + safe-area CSS variables (browser only). */
export function syncViewportCssVars(): void {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  const vv = window.visualViewport;
  const height = Math.round(vv?.height ?? window.innerHeight);
  const width = Math.round(vv?.width ?? window.innerWidth);
  const offsetTop = Math.round(vv?.offsetTop ?? 0);
  const keyboardInset = Math.max(0, Math.round(window.innerHeight - height - offsetTop));

  root.style.setProperty("--app-height-px", `${height}px`);
  root.style.setProperty("--viewport-width-px", `${width}px`);
  root.style.setProperty("--viewport-offset-top", `${offsetTop}px`);
  root.style.setProperty("--keyboard-inset", `${keyboardInset}px`);

  const snap = captureDeviceSnapshot();
  const body = document.body;
  body.dataset.runtime = snap.runtime;
  body.dataset.standalone = snap.standalone ? "true" : "false";
  body.dataset.touch = snap.touchCapable ? "true" : "false";
  body.dataset.reducedMotion = snap.prefersReducedMotion ? "true" : "false";
  body.dataset.safari = isSafariEngine() ? "true" : "false";
}

export function isSafariEngine(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|CriOS|Chromium|Edg|OPR|SamsungBrowser/i.test(ua);
}

export function isSamsungInternet(): boolean {
  if (typeof navigator === "undefined") return false;
  return /SamsungBrowser/i.test(navigator.userAgent);
}

export function bindViewportSync(): () => void {
  syncViewportCssVars();

  const onChange = () => syncViewportCssVars();
  window.addEventListener("resize", onChange, { passive: true });
  window.addEventListener("orientationchange", onChange, { passive: true });
  window.visualViewport?.addEventListener("resize", onChange, { passive: true });
  window.visualViewport?.addEventListener("scroll", onChange, { passive: true });

  const delayed = window.setTimeout(onChange, 120);

  return () => {
    window.clearTimeout(delayed);
    window.removeEventListener("resize", onChange);
    window.removeEventListener("orientationchange", onChange);
    window.visualViewport?.removeEventListener("resize", onChange);
    window.visualViewport?.removeEventListener("scroll", onChange);
  };
}
