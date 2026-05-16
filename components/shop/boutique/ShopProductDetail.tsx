"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";
import { categoryLabel, formatPrice, paymentStatusLabel, fulfillmentStatusLabel, stockLabel } from "@/lib/shop-logic";
import {
  END_YEAR_SHOW,
  getCountdown,
  personalizeReason,
  productHeroGradient,
  productTone,
  productUsageHint,
  productVisualLabel
} from "@/lib/shop-boutique";
import { getTone } from "@/lib/design-system/colors";
import type { ShopOrder, ShopProduct } from "@/lib/types";
import { GhostButton, PrimaryButton, SectionEyebrow, cx, screenClass } from "../../ui";

export function ShopProductDetail({
  product,
  myEventOrder,
  onBack,
  onCart
}: {
  product: ShopProduct;
  myEventOrder?: ShopOrder;
  onBack: () => void;
  onCart: () => void;
}) {
  const shop = useShop();
  const { showToast } = useToast();
  const [size, setSize] = useState(product.availableSizes?.[0]);
  const [color, setColor] = useState(product.availableColors?.[0]);
  const [qty, setQty] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const tone = productTone(product);
  const t = getTone(tone);
  const soldOut = product.stockStatus === "sold_out";
  const isTicket = product.category === "event_ticket";
  const personal = personalizeReason(product, shop.user);
  const usage = productUsageHint(product);
  const countdown = isTicket && product.relatedEventId === END_YEAR_SHOW.eventId ? getCountdown(END_YEAR_SHOW.dateIso) : null;

  const galleryPanels = [
    productHeroGradient(product),
    `linear-gradient(160deg, ${t.soft} 0%, rgba(0,0,0,0.6) 100%)`,
    "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.5) 100%)"
  ];

  const handleAdd = () => {
    if (shop.addToCart(product.id, { quantity: qty, size, color })) {
      showToast("הפריט נוסף לעגלה");
      onCart();
    } else {
      showToast("לא ניתן להוסיף לעגלה", "error");
    }
  };

  return (
    <div className={screenClass}>
      <GhostButton onClick={onBack} className="!mb-2 !px-0 !py-1 !text-sm">
        ← חזרה לבוטיק
      </GhostButton>

      <motion.section
        className="relative overflow-hidden rounded-[26px] border border-white/[0.1]"
        style={{ background: galleryPanels[galleryIndex], boxShadow: `0 24px 70px rgba(0,0,0,0.45)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(255,255,255,0.12),transparent_55%)]" aria-hidden />
        <div className="relative aspect-[4/5] max-h-[22rem] w-full sm:aspect-[16/10] sm:max-h-none">
          <span
            className="absolute left-4 top-4 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-[0.2em] text-white/75"
            style={{ borderColor: t.border, backgroundColor: "rgba(0,0,0,0.4)" }}
          >
            {productVisualLabel(product)}
          </span>
          <div className="absolute bottom-0 inset-x-0 p-5 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: t.core }}>
              {categoryLabel(product.category)}
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight text-white sm:text-3xl">{product.title}</h1>
            {countdown ? (
              <p className="mt-2 inline-flex rounded-xl border border-amber-400/25 bg-black/35 px-3 py-1.5 text-sm font-semibold text-amber-100">
                {countdown.label}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex justify-center gap-1.5 border-t border-white/[0.06] py-3">
          {galleryPanels.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`תמונה ${i + 1}`}
              onClick={() => setGalleryIndex(i)}
              className={cx(
                "h-1.5 rounded-full transition-all",
                galleryIndex === i ? "w-6 bg-white/70" : "w-1.5 bg-white/25"
              )}
            />
          ))}
        </div>
      </motion.section>

      <div className="space-y-4 text-right">
        <p className="text-2xl font-semibold tabular-nums text-white">{formatPrice(product.price)}</p>
        <p className="text-sm leading-relaxed text-white/52">{product.description}</p>
        <p className="text-xs text-white/38">{stockLabel(product.stockStatus)}</p>

        {personal ? (
          <p className="flex items-center justify-end gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white/70">
            <Sparkles size={16} className="text-amber-200/80" />
            {personal}
          </p>
        ) : null}
        {usage ? (
          <p className="text-xs text-white/40">
            <span className="text-white/55">בסטודיו: </span>
            {usage}
          </p>
        ) : null}
        {myEventOrder ? (
          <p className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-50">
            הזמנה קיימת: {paymentStatusLabel(myEventOrder.paymentStatus)} · {fulfillmentStatusLabel(myEventOrder.fulfillmentStatus)}
          </p>
        ) : null}
      </div>

      {product.availableSizes?.length ? (
        <div>
          <SectionEyebrow>מידה</SectionEyebrow>
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            {product.availableSizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={cx(
                  "min-h-[2.5rem] rounded-full border px-4 py-2 text-sm font-semibold transition",
                  size === s ? "border-white/30 bg-white/12 text-white" : "border-white/10 text-white/50 hover:border-white/18"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {product.availableColors?.length ? (
        <div>
          <SectionEyebrow>צבע</SectionEyebrow>
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            {product.availableColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cx(
                  "min-h-[2.5rem] rounded-full border px-4 py-2 text-sm font-semibold transition",
                  color === c ? "border-white/30 bg-white/12 text-white" : "border-white/10 text-white/50"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {!isTicket ? (
        <div className="flex items-center justify-end gap-3">
          <span className="text-sm text-white/45">כמות</span>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
            <button type="button" className="touch-icon-btn flex h-11 w-11 items-center justify-center rounded-xl text-white/80 active:bg-white/[0.08]" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              −
            </button>
            <span className="w-8 text-center font-semibold tabular-nums text-white">{qty}</span>
            <button type="button" className="touch-icon-btn flex h-11 w-11 items-center justify-center rounded-xl text-white/80 active:bg-white/[0.08]" onClick={() => setQty((q) => q + 1)}>
              +
            </button>
          </div>
        </div>
      ) : null}

      <PrimaryButton tone={tone} disabled={soldOut} onClick={handleAdd}>
        {soldOut ? "אזל מהמלאי" : isTicket ? "רכישת כרטיס" : "הוספה לעגלה"}
      </PrimaryButton>

      <p className="text-center text-[11px] text-white/32">איסוף מהסטודיו בכפר ויתקין · תשלום מאובטח</p>
    </div>
  );
}
