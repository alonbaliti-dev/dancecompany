"use client";

import { Drawer } from "vaul";
import type { ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  snapPoints?: (string | number)[];
}

/**
 * iOS-style bottom sheet built on `vaul`. RTL-aware.
 * Drop into Next.js as-is (no framework-specific imports).
 */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  snapPoints,
}: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} snapPoints={snapPoints}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content
          dir="rtl"
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92vh] w-full max-w-md flex-col rounded-t-[28px] border border-hairline bg-surface-elevated/95 text-right backdrop-blur-2xl outline-none"
        >
          <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-white/15" />
          {(title || description) && (
            <div className="px-6 pb-2 pt-4">
              {title && (
                <Drawer.Title className="text-lg font-semibold tracking-tight text-foreground">
                  {title}
                </Drawer.Title>
              )}
              {description && (
                <Drawer.Description className="mt-1 text-sm text-muted-foreground">
                  {description}
                </Drawer.Description>
              )}
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-6 pb-8 pt-2 safe-bottom">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
