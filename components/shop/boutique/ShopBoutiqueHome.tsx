"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Sparkles } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { usePrivateLessons } from "@/context/PrivateLessonsContext";
import { END_YEAR_EVENT_ID, formatPrice } from "@/lib/shop-logic";
import {
  BOUTIQUE_CATEGORIES,
  categoryBannerGradient,
  featuredProductIds,
  isNewArrival,
  matchBoutiqueCategory,
  scoreProductForUser,
  type BoutiqueCategoryId
} from "@/lib/shop-boutique";
import { cardGradients } from "@/lib/theme/gradients";
import { styleChipStylePlain } from "@/lib/theme/dance-styles";
import type { ShopProduct } from "@/lib/types";
import { GhostButton, cx, screenClass } from "../../ui";
import { ShopEventTicketStage } from "./ShopEventTicketStage";
import { ShopProductCardPremium } from "./ShopProductCardPremium";
import { PrivateLessonCardPremium } from "../private-lessons/PrivateLessonCardPremium";

export function ShopBoutiqueHome({
  onProduct,
  onPrivateLesson,
  onCart,
  onOrders,
  onAdmin,
  onTeacherPrivate,
  onMyPrivateLessons
}: {
  onProduct: (id: string) => void;
  onPrivateLesson: (id: string) => void;
  onCart: () => void;
  onOrders: () => void;
  onAdmin?: () => void;
  onTeacherPrivate?: () => void;
  onMyPrivateLessons?: () => void;
}) {
  const shop = useShop();
  const pl = usePrivateLessons();
  const [category, setCategory] = useState<BoutiqueCategoryId>("all");

  const tickets = useMemo(
    () => shop.visibleProducts.filter((p) => p.relatedEventId === END_YEAR_EVENT_ID && p.category === "event_ticket"),
    [shop.visibleProducts]
  );

  const featured = useMemo(() => {
    const ids = featuredProductIds();
    return ids.map((id) => shop.getProduct(id)).filter((p): p is ShopProduct => !!p && p.isActive);
  }, [shop]);

  const heroProduct = featured[0] ?? shop.visibleProducts[0];

  const recommended = useMemo(() => {
    return [...shop.visibleProducts]
      .filter((p) => p.isActive && p.id !== heroProduct?.id)
      .sort((a, b) => scoreProductForUser(b, shop.user) - scoreProductForUser(a, shop.user))
      .slice(0, 8);
  }, [shop.visibleProducts, shop.user, heroProduct?.id]);

  const newArrivals = useMemo(
    () => shop.visibleProducts.filter((p) => isNewArrival(p) || p.stockStatus === "low_stock").slice(0, 6),
    [shop.visibleProducts]
  );

  const privateLessons = pl.visibleProducts;

  const filtered = useMemo(() => {
    if (category === "private_lessons") return [];
    let list = shop.visibleProducts.filter((p) => matchBoutiqueCategory(p, category));
    if (shop.focusEventId) {
      list = list.filter((p) => p.relatedEventId === shop.focusEventId || p.category === "event_ticket");
    }
    return list;
  }, [shop.visibleProducts, category, shop.focusEventId]);

  const activeCat = BOUTIQUE_CATEGORIES.find((c) => c.id === category) ?? BOUTIQUE_CATEGORIES[0]!;

  return (
    <div className={cx(screenClass, "pb-4")}>
      <header className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onCart}
          className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-white/20 active:scale-[0.98]"
          aria-label="עגלה"
        >
          <ShoppingBag size={20} className="text-white/75" strokeWidth={1.5} />
          {shop.cartCount > 0 ? (
            <span className="absolute -top-1 -left-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-400 px-1 text-[10px] font-bold text-emerald-950">
              {shop.cartCount}
            </span>
          ) : null}
        </button>
        <div className="min-w-0 flex-1 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">LK Boutique</p>
          <h1 className="mt-1 text-[1.65rem] font-semibold leading-tight tracking-tight text-white">בוטיק הסטודיו</h1>
          <p className="mt-2 max-w-[18rem] text-sm leading-relaxed text-white/48">
            קולקציה אוצרת — בגדי ריקוד, ציוד ובמה. לא חנות גנרית, חוויית LK.
          </p>
        </div>
      </header>

      <div className="flex flex-wrap justify-end gap-2">
        {onMyPrivateLessons ? (
          <GhostButton className="!text-sm !text-emerald-200/85" onClick={onMyPrivateLessons}>
            השיעורים הפרטיים שלי
          </GhostButton>
        ) : null}
        {onTeacherPrivate ? (
          <GhostButton className="!text-sm !text-sky-200/80" onClick={onTeacherPrivate}>
            בקשות שיעורים פרטיים
          </GhostButton>
        ) : null}
        {shop.canManageShop && onAdmin ? (
          <GhostButton className="!text-sm !text-white/55" onClick={onAdmin}>
            ניהול קולקציה והזמנות
          </GhostButton>
        ) : null}
      </div>

      {privateLessons.length > 0 && category !== "private_lessons" ? (
        <section className="space-y-3">
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38">שיעורים פרטיים</p>
            <p className="mt-0.5 text-xs text-white/42">אחד על אחד עם מורה הסטודיו · 30 או 45 דקות</p>
          </div>
          <div className="-mx-1 flex gap-3 overflow-x-auto pb-2 no-scrollbar" dir="rtl">
            {privateLessons.map((p, i) => (
              <PrivateLessonCardPremium key={p.id} product={p} onPress={() => onPrivateLesson(p.id)} variant="rail" index={i} />
            ))}
          </div>
        </section>
      ) : null}

      {heroProduct ? (
        <motion.button
          type="button"
          onClick={() => onProduct(heroProduct.id)}
          className="relative w-full overflow-hidden rounded-[26px] border border-white/[0.1] text-right shadow-[0_28px_80px_rgba(0,0,0,0.5)] active:scale-[0.995]"
          style={{
            background: cardGradients.commercial,
            boxShadow: "0 28px 80px rgba(0,0,0,0.5), 0 0 100px rgba(52,211,153,0.08)"
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(255,255,255,0.12),transparent_50%)]" aria-hidden />
          <div className="relative flex min-h-[11rem] flex-col justify-end p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/90">קולקציה מובילה</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{heroProduct.title}</h2>
            <p className="mt-2 line-clamp-2 max-w-[85%] text-sm text-white/52">{heroProduct.description}</p>
            <div className="mt-4 flex items-center justify-end gap-3">
              <span className="text-lg font-semibold tabular-nums text-white">{formatPrice(heroProduct.price)}</span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-white/70">
                גלו עכשיו
                <ArrowLeft size={16} className="rotate-180" />
              </span>
            </div>
          </div>
        </motion.button>
      ) : null}

      <ShopEventTicketStage
        tickets={tickets}
        myOrder={shop.myOrderForEvent(END_YEAR_EVENT_ID)}
        onSelectTicket={onProduct}
      />

      <EditorialRail
        title="מומלץ עבורך"
        subtitle="לפי הקבוצות והסגנון שלך בסטודיו"
        products={recommended}
        user={shop.user}
        onProduct={onProduct}
      />

      {newArrivals.length > 0 ? (
        <EditorialRail
          title="חדש ומוגבל"
          subtitle="פריטים עם מלאי מצומצם או הזמנה מראש"
          products={newArrivals}
          user={shop.user}
          onProduct={onProduct}
        />
      ) : null}

      <section className="space-y-3">
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38">קטגוריות</p>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 no-scrollbar" dir="rtl">
          {BOUTIQUE_CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.id);
                  if (cat.id !== "event_ticket") shop.setFocusEventId(null);
                }}
                className={cx(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
                  active ? "text-white" : "border-white/10 text-white/45 hover:border-white/16"
                )}
                style={styleChipStylePlain(cat.styleId === "default" ? "default" : cat.styleId, active)}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {category !== "all" ? (
          <div
            className="overflow-hidden rounded-[22px] border border-white/[0.08] px-5 py-4 text-right"
            style={{ background: categoryBannerGradient(activeCat) }}
          >
            <p className="text-lg font-semibold text-white">{activeCat.label}</p>
            <p className="mt-1 text-sm text-white/45">{activeCat.tagline}</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {category === "private_lessons" ? (
            privateLessons.length === 0 ? (
              <div className="col-span-full rounded-[22px] border border-white/[0.08] bg-white/[0.03] py-14 text-center text-sm text-white/40">
                אין שיעורים פרטיים זמינים כרגע.
              </div>
            ) : (
              privateLessons.map((p, i) => (
                <PrivateLessonCardPremium key={p.id} product={p} onPress={() => onPrivateLesson(p.id)} index={i} />
              ))
            )
          ) : filtered.length === 0 ? (
            <div className="col-span-full rounded-[22px] border border-white/[0.08] bg-white/[0.03] py-14 text-center text-sm text-white/40">
              אין פריטים בקטגוריה זו כרגע.
            </div>
          ) : (
            filtered.map((p, i) => (
              <ShopProductCardPremium key={p.id} product={p} user={shop.user} onPress={() => onProduct(p.id)} index={i} />
            ))
          )}
        </div>
      </section>

      <div className="rounded-[22px] border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-2 text-white/55">
          <Sparkles size={16} />
          <p className="text-xs">תשלום מאובטח בשרת · ללא שמירת פרטי כרטיס באפליקציה</p>
        </div>
      </div>

      <GhostButton className="w-full !text-white/50" onClick={onOrders}>
        ההזמנות והכרטיסים שלי
      </GhostButton>
    </div>
  );
}

function EditorialRail({
  title,
  subtitle,
  products,
  user,
  onProduct
}: {
  title: string;
  subtitle: string;
  products: ShopProduct[];
  user: import("@/lib/types").UserProfile;
  onProduct: (id: string) => void;
}) {
  if (!products.length) return null;
  return (
    <section className="space-y-3">
      <div className="text-right">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38">{title}</p>
        <p className="mt-0.5 text-xs text-white/42">{subtitle}</p>
      </div>
      <div className="-mx-1 flex gap-3 overflow-x-auto pb-2 no-scrollbar" dir="rtl">
        {products.map((p, i) => (
          <ShopProductCardPremium key={p.id} product={p} user={user} onPress={() => onProduct(p.id)} variant="rail" index={i} />
        ))}
      </div>
    </section>
  );
}
