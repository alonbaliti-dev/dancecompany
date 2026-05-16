"use client";

export function DatabaseLoadWarningBanner({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-100/85"
      dir="rtl"
    >
      {message}
    </div>
  );
}
