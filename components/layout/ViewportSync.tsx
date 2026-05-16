"use client";

import { useEffect } from "react";
import { bindViewportSync } from "@/lib/layout/viewport-sync";

/** Keeps --app-height-px and runtime data-* flags in sync for Safari / mobile browsers. */
export function ViewportSync() {
  useEffect(() => bindViewportSync(), []);
  return null;
}
