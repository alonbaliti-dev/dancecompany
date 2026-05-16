"use client";

import { useMemo, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { defaultPaymentProvider } from "@/lib/payments/payment-device-detection";
import { externalRedirectMessageHe, pendingPaymentHintHe } from "@/lib/payments/labels-he";
import { paymentStatusLabel } from "@/lib/shop-logic";
import { paymentProviderLabelHe } from "@/lib/payments/labels-he";
import { isExternalAppProvider, providerToShopMethod, shopMethodToProvider } from "@/lib/payments/shop-bridge";
import type { PaymentProvider } from "@/lib/payments/types";
import type { ShopOrder, ShopPaymentMethod } from "@/lib/types";
import { GhostButton, Header, PrimaryButton, SectionEyebrow, screenClass } from "../../ui";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { PaymentMethodSelector } from "./PaymentMethodSelector";

type Step = "methods" | "processing" | "external" | "success";

export function PaymentCheckoutFlow({
  onBack,
  onOrders
}: {
  onBack: () => void;
  onOrders: () => void;
}) {
  const shop = useShop();
  const [method, setMethod] = useState<ShopPaymentMethod>(() => providerToShopMethod(defaultPaymentProvider()));
  const [step, setStep] = useState<Step>("methods");
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<ShopOrder | null>(null);
  const [externalProvider, setExternalProvider] = useState<PaymentProvider | null>(null);

  const provider = useMemo(() => shopMethodToProvider(method === "card" ? "credit_card" : method), [method]);

  const handlePay = async () => {
    setError(null);
    setStep("processing");
    try {
      const order = await shop.checkoutWithPayment(method);
      if (!order) {
        setError("לא ניתן להשלים את ההזמנה. נסו שוב.");
        setStep("methods");
        return;
      }

      if (provider && isExternalAppProvider(provider)) {
        setExternalProvider(provider);
        setCompletedOrder(order);
        setStep("external");
        return;
      }

      setCompletedOrder(order);
      setStep("success");
    } catch {
      setError("שגיאת תשלום. נסו שוב או בחרו אמצעי אחר.");
      setStep("methods");
    }
  };

  const handleConfirmExternal = async () => {
    if (!completedOrder) return;
    setStep("processing");
    const updated = await shop.confirmPendingPayment(completedOrder.id);
    setCompletedOrder(updated ?? completedOrder);
    setStep("success");
  };

  if (step === "success" && completedOrder) {
    const isTicket = completedOrder.items.some((i) => {
      const p = shop.getProduct(i.productId);
      return p?.category === "event_ticket";
    });
    return (
      <div className={screenClass}>
        <div className="overflow-hidden rounded-[26px] border border-emerald-400/25 bg-gradient-to-b from-emerald-500/12 to-black/40 px-6 py-8 text-right">
          <div className="flex items-center justify-end gap-2 text-emerald-200">
            <ShieldCheck size={28} />
            <p className="text-lg font-semibold text-white">התשלום התקבל</p>
          </div>
          <p className="mt-3 text-sm text-white/50">
            הזמנה #{completedOrder.id.slice(-6)} · {paymentStatusLabel(completedOrder.paymentStatus)}
          </p>
          {isTicket ? (
            <p className="mt-2 text-sm text-amber-100/80">כרטיסים למופע — אישור יישלח בהודעה מהסטודיו.</p>
          ) : null}
          <p className="mt-2 text-xs text-white/35">קבלה דיגיטלית תישלח לאחר אימות סופי בשרת.</p>
        </div>
        <PrimaryButton onClick={onOrders}>צפייה בהזמנות שלי</PrimaryButton>
        <GhostButton className="w-full" onClick={onBack}>
          חזרה לבוטיק
        </GhostButton>
      </div>
    );
  }

  if (step === "external" && externalProvider && completedOrder) {
    return (
      <div className={screenClass}>
        <Header title="ממתין לאישור תשלום" subtitle={externalRedirectMessageHe(externalProvider)} />
        <div className="rounded-[22px] border border-sky-400/20 bg-sky-500/[0.08] px-5 py-5 text-right">
          <p className="text-sm leading-relaxed text-white/55">{pendingPaymentHintHe(externalProvider)}</p>
          <p className="mt-3 text-xs text-white/38">
            {paymentProviderLabelHe(externalProvider)} · הזמנה #{completedOrder.id.slice(-6)}
          </p>
        </div>
        <PrimaryButton onClick={handleConfirmExternal}>אישרתי בתשלום — בדיקת סטטוס</PrimaryButton>
        <GhostButton className="w-full" onClick={onOrders}>
          המשך מאוחר יותר
        </GhostButton>
      </div>
    );
  }

  return (
    <div className={screenClass}>
      <GhostButton onClick={onBack} className="!mb-2 !px-0 !py-1 !text-sm">
        ← חזרה לעגלה
      </GhostButton>
      <Header title="תשלום מאובטח" subtitle="חוויית קנייה רגועה · ללא שמירת פרטי כרטיס" />

      <OrderSummaryCard lines={shop.cart} total={shop.cartTotalNis} />

      <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-right">
        <ShieldCheck className="shrink-0 text-emerald-300/80" size={20} />
        <p className="text-xs leading-relaxed text-white/50">
          חיוב מתבצע בשרת מאובטח (PCI). תומך ב-Stripe, Tranzila, Meshulam, Hyp, Grow, Cardcom, Bit ו-PayBox.
        </p>
      </div>

      <SectionEyebrow>אמצעי תשלום</SectionEyebrow>
      <PaymentMethodSelector selected={method} onSelect={setMethod} includeBankTransfer />

      {error ? <p className="text-right text-sm text-rose-300/90">{error}</p> : null}

      <PrimaryButton onClick={handlePay} disabled={step === "processing"}>
        {step === "processing" ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="animate-spin" size={18} />
            מעבד תשלום…
          </span>
        ) : (
          "שלם עכשיו"
        )}
      </PrimaryButton>
    </div>
  );
}
