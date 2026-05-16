"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { usePrivateLessons } from "@/context/PrivateLessonsContext";
import { defaultPaymentProvider } from "@/lib/payments/payment-device-detection";
import { externalRedirectMessageHe, pendingPaymentHintHe, paymentProviderLabelHe } from "@/lib/payments/labels-he";
import { isExternalAppProvider, providerToShopMethod, shopMethodToProvider } from "@/lib/payments/shop-bridge";
import { priceLabelForDuration } from "@/lib/private-lessons/logic";
import { PRIVATE_LESSON_WARMUP_POLICY } from "@/lib/private-lessons/constants";
import type { PaymentProvider } from "@/lib/payments/types";
import type { PrivateLessonBooking, PrivateLessonDurationMinutes, PrivateLessonProduct, ShopPaymentMethod } from "@/lib/types";
import { GhostButton, Header, PrimaryButton, SectionEyebrow, screenClass } from "../../ui";
import { PaymentMethodSelector } from "../checkout/PaymentMethodSelector";
import { WarmupPolicyCard } from "./WarmupPolicyCard";

type Step = "methods" | "processing" | "external" | "success";

type Draft = {
  durationMinutes: PrivateLessonDurationMinutes;
  requestedDate: string;
  requestedTime: string;
  notes: string;
};

export function PrivateLessonCheckoutFlow({
  product,
  draft,
  onBack,
  onConfirmed
}: {
  product: PrivateLessonProduct;
  draft: Draft;
  onBack: () => void;
  onConfirmed: (booking: PrivateLessonBooking) => void;
}) {
  const pl = usePrivateLessons();
  const [method, setMethod] = useState<ShopPaymentMethod>(() => providerToShopMethod(defaultPaymentProvider()));
  const [step, setStep] = useState<Step>("methods");
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<PrivateLessonBooking | null>(null);
  const [externalProvider, setExternalProvider] = useState<PaymentProvider | null>(null);

  const provider = useMemo(() => shopMethodToProvider(method === "card" ? "credit_card" : method), [method]);
  const priceLabel = priceLabelForDuration(draft.durationMinutes);

  const handlePay = async () => {
    setError(null);
    setStep("processing");
    try {
      const result = await pl.bookWithPayment({
        productId: product.id,
        durationMinutes: draft.durationMinutes,
        requestedDate: draft.requestedDate || undefined,
        requestedTime: draft.requestedTime || undefined,
        notes: draft.notes || undefined,
        paymentMethod: method
      });
      if (!result) {
        setError("לא ניתן להשלים את ההזמנה. נסו שוב.");
        setStep("methods");
        return;
      }
      setBooking(result);
      if (provider && isExternalAppProvider(provider)) {
        setExternalProvider(provider);
        setStep("external");
        return;
      }
      setStep("success");
    } catch {
      setError("שגיאת תשלום. נסו שוב או בחרו אמצעי אחר.");
      setStep("methods");
    }
  };

  const handleConfirmExternal = async () => {
    if (!booking) return;
    setStep("processing");
    const updated = await pl.confirmPendingPayment(booking.id);
    const next = updated ?? booking;
    setBooking(next);
    setStep("success");
  };

  useEffect(() => {
    if (step === "success" && booking) onConfirmed(booking);
  }, [step, booking, onConfirmed]);

  if (step === "success") {
    return (
      <div className={screenClass}>
        <div className="flex items-center justify-center gap-2 py-12 text-white/55">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm">מעביר לאישור…</span>
        </div>
      </div>
    );
  }

  if (step === "external" && externalProvider && booking) {
    return (
      <div className={screenClass}>
        <Header title="ממתין לאישור תשלום" subtitle={externalRedirectMessageHe(externalProvider)} />
        <div className="rounded-[22px] border border-sky-400/20 bg-sky-500/[0.08] px-5 py-5 text-right">
          <p className="text-sm leading-relaxed text-white/55">{pendingPaymentHintHe(externalProvider)}</p>
          <p className="mt-3 text-xs text-white/38">
            {paymentProviderLabelHe(externalProvider)} · בקשה #{booking.id.slice(-6)}
          </p>
        </div>
        <PrimaryButton onClick={handleConfirmExternal}>אישרתי בתשלום — בדיקת סטטוס</PrimaryButton>
        <GhostButton className="w-full" onClick={() => onConfirmed(booking)}>
          המשך לאישור
        </GhostButton>
      </div>
    );
  }

  return (
    <div className={screenClass}>
      <GhostButton onClick={onBack} className="!mb-2 !px-0 !py-1 !text-sm">
        ← חזרה לפרטי השיעור
      </GhostButton>
      <Header title="תשלום מאובטח" subtitle={`${product.teacherName} · ${draft.durationMinutes} דק׳`} />

      <div className="rounded-[22px] border border-white/[0.1] bg-white/[0.04] px-5 py-4 text-right">
        <SectionEyebrow>סיכום</SectionEyebrow>
        <p className="mt-2 text-lg font-semibold text-white">{priceLabel}</p>
        {draft.requestedDate ? (
          <p className="mt-2 text-sm text-white/45">
            מועד מבוקש: {draft.requestedDate}
            {draft.requestedTime ? ` · ${draft.requestedTime}` : ""}
          </p>
        ) : (
          <p className="mt-2 text-sm text-white/45">תיאום מועד לאחר אישור התשלום</p>
        )}
      </div>

      <WarmupPolicyCard policy={product.warmupPolicy} />
      <p className="text-right text-[11px] leading-relaxed text-white/35">{PRIVATE_LESSON_WARMUP_POLICY}</p>

      <PaymentMethodSelector selected={method} onSelect={setMethod} includeBankTransfer />

      {error ? <p className="text-right text-sm text-rose-300/90">{error}</p> : null}

      {step === "processing" ? (
        <div className="flex items-center justify-center gap-2 py-6 text-white/55">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm">מעבד תשלום…</span>
        </div>
      ) : (
        <PrimaryButton onClick={handlePay}>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck size={18} />
            השלמת הזמנה · {priceLabel}
          </span>
        </PrimaryButton>
      )}
    </div>
  );
}
