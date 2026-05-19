"use client";

import type { ElementType } from "react";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import type { V6Product } from "@/lib/v6/types";
import { BidiNumber, SafeMeta, SafeTitle } from "./primitives";
import { v6Cx, v6Lovable, v6Motion } from "./tokens";

export function V6ShopProductCard({
  product,
  imageUrl,
  priceLabel,
  onPress,
  onEdit,
  actionLabel,
  actionDisabled,
  fallbackIcon: FallbackIcon = ShoppingBag
}: {
  product: V6Product;
  imageUrl?: string;
  priceLabel: string;
  onPress: () => void;
  onEdit?: () => void;
  actionLabel: string;
  actionDisabled?: boolean;
  fallbackIcon?: ElementType;
}) {
  return (
    <motion.article
      dir="rtl"
      whileTap={{ scale: 0.97 }}
      className={v6Cx(v6Lovable.productCard, v6Motion.standard, v6Motion.focusRing, "touch-manipulation")}
    >
      <button type="button" onClick={onPress} disabled={actionDisabled} className="flex w-full flex-col gap-3 text-start disabled:opacity-55">
        <motion.div
          className={v6Lovable.productMedia}
          style={imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          role={imageUrl ? "img" : undefined}
          aria-label={imageUrl ? product.title : undefined}
        >
          {!imageUrl ? <FallbackIcon size={30} className="text-[#f4d58d]/70" strokeWidth={1.4} aria-hidden="true" /> : null}
          <span className="absolute bottom-2 right-2 text-[9px] uppercase tracking-[0.16em] text-white/40">{product.category}</span>
        </motion.div>
        <div className="flex min-w-0 flex-col gap-1">
          <SafeTitle as="h3" className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-white/90">
            {product.title}
          </SafeTitle>
          <SafeMeta as="p" className="line-clamp-2 text-xs leading-relaxed text-white/48">
            {product.description || "מוצר מהחנות"}
          </SafeMeta>
        </div>
        <div className="flex items-center justify-between gap-2">
          <SafeMeta as="span" className="text-sm font-semibold text-[#fff7df]/90">
            <BidiNumber>{priceLabel}</BidiNumber>
          </SafeMeta>
          <span className="inline-flex min-h-8 items-center rounded-full bg-[#f4d58d] px-3 text-[11px] font-semibold text-zinc-950">
            {actionLabel}
          </span>
        </div>
      </button>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className={v6Cx(
            "w-full min-h-8 rounded-2xl border border-[#f4d58d]/10 bg-white/[0.030] text-[11px] font-semibold text-white/62",
            v6Motion.pressSoft,
            v6Motion.focusRing,
            "touch-manipulation"
          )}
        >
          עריכה
        </button>
      ) : null}
    </motion.article>
  );
}

export function V6ShopProductGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <motion.div className={v6Cx("grid grid-cols-2 gap-2.5", className)}>{children}</motion.div>;
}
