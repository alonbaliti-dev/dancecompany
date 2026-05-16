/** Open public studio media in a new tab — safe external navigation. */
export function openExternalMedia(url: string): void {
  if (typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer");
}
