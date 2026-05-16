"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { formatPrice, stockLabel } from "@/lib/shop-logic";
import {
  personalizeReason,
  productGlow,
  productHeroGradient,
  productTone,
  productVisualLabel
} from "@/lib/shop-boutique";
import { getTone } from "@/lib/design-system/colors";
import { motionPresets } from "@/lib/design-system/motion";
import type { ShopProduct, UserProfile } from "@/lib/types";
import { cx } from "../../ui";

type Variant = "rail" | "grid" | "hero";

export function ShopProductCardPremium({
  product,
  user,
  onPress,
  variant = "grid",
  index = 0
}: {
  product: ShopProduct;
  user?: UserProfile;
  onPress: () => void;
  variant?: Variant;
  index?: number;
}) {
  const tone = productTone(product);
  const t = getTone(tone);
  const personal = user ? personalizeReason(product, user) : null;
  const soldOut = product.stockStatus === "sold_out";
  const isTicket = product.category === "event_ticket";
  const rail = variant === "rail";
  const hero = variant === "hero";

  return (
    <motion.button
      type="button"
      onClick={onPress}
      disabled={soldOut}
      className={cx(
        "group relative shrink-0 overflow-hidden rounded-[22px] border text-right transition",
        "border-white/[0.09] bg-black/40 active:scale-[0.99]",
        soldOut && "opacity-55",
        rail && "w-[11.5rem]",
        hero && "w-full",
        !rail && !hero && "w-full"
      )}
      style={{ boxShadow: productGlow(product) }}
      {...motionPresets.press}
      initial={motionPresets.cardEnter.initial}
      animate={motionPresets.cardEnter.animate}
      transition={{ ...motionPresets.cardTransition, delay: index * 0.04 }}
    >
      <motion.div
        className={cx(
          "relative overflow-hidden",
          hero ? "aspect-[16/10]" : rail ? "aspect-[4/5]" : "aspect-[5/6]"
        )}
        style={{ background: productHeroGradient(product) }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.14),transparent_55%)]"
          aria-hidden
          initial={false}
          whileHover={{ opacity: 1.1 }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: `linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.75) 100%)`
          }}
          aria-hidden
        />
        <span
          className="absolute left-3 top-3 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-[0.2em] text-white/70"
          style={{ borderColor: t.border, backgroundColor: "rgba(0,0,0,0.35)" }}
        >
          {productVisualLabel(product)}
        </span>
        {personal ? (
          <span className="absolute right-3 top-3 flex max-w-[70%] items-center gap-1 rounded-full border border-white/15 bg-black/45 px-2 py-1 text-[9px] font-medium text-white/85 backdrop-blur-sm">
            <Sparkles size={10} className="shrink-0 text-amber-200/90" />
            <span className="truncate">{personal}</span>
          </span>
        ) : null}
        {product.stockStatus === "low_stock" ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-semibold text-amber-100">
            מלאי מוגבל
          </span>
        ) : null}
        <motion.div
          className="absolute bottom-0 inset-x-0 p-3.5"
          initial={false}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <p className={cx("font-semibold leading-snug text-white", hero ? "text-lg" : "text-[15px]")}>
            {product.title}
          </p>
          {!rail ? (
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/48">{product.description}</p>
          ) : null}
        </motion.div>
      </motion.div>

      <div className="flex items-center justify-between gap-2 px-3.5 py-3">
        <span className="text-[15px] font-semibold tabular-nums" style={{ color: t.core }}>
          {formatPrice(product.price)}
        </span>
        <span className="text-[10px] text-white/38">
          {isTicket ? "כרטיס דיגיטלי" : stockLabel(product.stockStatus)}
        </span>
      </div>
    </motion.button>
  );
}
