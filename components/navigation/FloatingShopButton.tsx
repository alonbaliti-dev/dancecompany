"use client";

import { ShoppingBag } from "lucide-react";
import { useEditableTextOptional } from "@/context/EditableTextContext";
import { getTone } from "@/lib/design-system/colors";

const commercial = getTone("commercial");

export function FloatingShopButton({ visible, onPress }: { visible: boolean; onPress: () => void }) {
  const copy = useEditableTextOptional();
  if (!visible) return null;

  const label = copy?.t("floating.shop", "חנות") ?? "חנות";

  return (
    <button
      type="button"
      onClick={onPress}
      className="pointer-events-auto fixed bottom-[calc(var(--nav-offset)+0.5rem)] left-5 z-50 flex min-h-[3rem] touch-manipulation items-center gap-2 rounded-full border px-4 py-3 text-base shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition active:scale-[0.97]"
      style={{
        borderColor: commercial.border,
        background: `linear-gradient(135deg, ${commercial.soft} 0%, rgba(0,0,0,0.75) 100%)`
      }}
      aria-label={label}
    >
      <ShoppingBag size={20} style={{ color: commercial.core }} />
      <span className="text-sm font-semibold text-white">{label}</span>
    </button>
  );
}
