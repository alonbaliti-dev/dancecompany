"use client";

import { motion } from "framer-motion";
import { useShop } from "@/context/ShopContext";
import { formatPrice } from "@/lib/shop-logic";
import { productHeroGradient, productTone } from "@/lib/shop-boutique";
import { getTone } from "@/lib/design-system/colors";
import { GhostButton, Header, PrimaryButton, screenClass } from "../../ui";

export function ShopCartView({ onBack, onCheckout }: { onBack: () => void; onCheckout: () => void }) {
  const shop = useShop();

  return (
    <div className={screenClass}>
      <GhostButton onClick={onBack} className="!mb-2 !px-0 !py-1 !text-sm">
        ← חזרה לבוטיק
      </GhostButton>
      <Header title="העגלה שלך" subtitle={shop.cartCount ? `${shop.cartCount} פריטים נבחרו` : "העגלה ריקה"} />

      {shop.cart.length === 0 ? (
        <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.03] py-16 text-center">
          <p className="text-sm text-white/45">העגלה ריקה — גלו את הקולקציה</p>
          <GhostButton className="mt-4" onClick={onBack}>
            חזרה לבוטיק
          </GhostButton>
        </div>
      ) : (
        <div className="space-y-4">
          {shop.cart.map((line, i) => {
            const tone = productTone(line.product);
            const t = getTone(tone);
            return (
              <motion.div
                key={line.productId}
                className="overflow-hidden rounded-[22px] border border-white/[0.09] bg-black/30"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="flex gap-0">
                  <motion.div
                    className="w-24 shrink-0 border-l border-white/[0.06]"
                    style={{ background: productHeroGradient(line.product) }}
                  />
                  <div className="min-w-0 flex-1 p-4 text-right">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        className="text-[11px] text-white/40 transition hover:text-rose-300/90"
                        onClick={() => shop.removeFromCart(line.productId)}
                      >
                        הסרה
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white">{line.product.title}</p>
                        {line.size ? <p className="text-xs text-white/40">מידה {line.size}</p> : null}
                        {line.color ? <p className="text-xs text-white/40">צבע {line.color}</p> : null}
                      </div>
                    </div>
                    <p className="mt-3 text-base font-semibold tabular-nums" style={{ color: t.core }}>
                      {formatPrice(line.product.price * line.quantity)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          <div className="rounded-[22px] border border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-transparent px-5 py-5">
            <div className="flex items-center justify-between text-right">
              <span className="text-2xl font-semibold tabular-nums text-white">{formatPrice(shop.cartTotalNis)}</span>
              <span className="text-sm text-white/45">סה״כ לתשלום</span>
            </div>
            <p className="mt-2 text-right text-[11px] text-white/35">כולל איסוף מהסטודיו · תשלום מאובטח בשרת</p>
          </div>

          <PrimaryButton onClick={onCheckout}>המשך לתשלום מאובטח</PrimaryButton>
        </div>
      )}
    </div>
  );
}
