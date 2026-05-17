import type { EntityId, IsoDateTimeString } from "@/lib/types/base";
import type { LiveIncidentSeverity } from "@/lib/operations/incidents";

export type OperationalHealthArea =
  | "uploads"
  | "webhooks"
  | "integrations"
  | "academy_health"
  | "pending_errors"
  | "storage"
  | "sync"
  | "payments";

export type OperationalHealthState = "healthy" | "watching" | "needs_attention" | "blocked" | "not_configured";

export type OperationalHealthSignal = {
  area: OperationalHealthArea;
  state: OperationalHealthState;
  labelHe: string;
  summaryHe: string;
  count?: number;
  severity?: LiveIncidentSeverity;
};

export type OperationalHealthSnapshot = {
  academyId?: EntityId;
  generatedAt: IsoDateTimeString;
  signals: OperationalHealthSignal[];
  nextReviewHe: string;
};

export type OperationalHealthInput = {
  academyId?: EntityId;
  generatedAt: IsoDateTimeString;
  uploadFailures?: number;
  webhookFailures?: number;
  failedIntegrations?: number;
  academyWarnings?: number;
  pendingErrors?: number;
  storageUsagePercent?: number;
  syncFailures?: number;
  paymentAnomalies?: number;
};

function stateFromCount(count: number | undefined, warning = 1, blocked = 5): OperationalHealthState {
  if (count === undefined) return "watching";
  if (count >= blocked) return "blocked";
  if (count >= warning) return "needs_attention";
  return "healthy";
}

function stateFromStorage(percent: number | undefined): OperationalHealthState {
  if (percent === undefined) return "watching";
  if (percent >= 95) return "blocked";
  if (percent >= 80) return "needs_attention";
  return "healthy";
}

function severityFromState(state: OperationalHealthState): LiveIncidentSeverity | undefined {
  if (state === "blocked") return "p0";
  if (state === "needs_attention") return "p1";
  if (state === "watching") return "p2";
  return undefined;
}

export function buildOperationalHealthSnapshot(input: OperationalHealthInput): OperationalHealthSnapshot {
  const uploadState = stateFromCount(input.uploadFailures);
  const webhookState = stateFromCount(input.webhookFailures);
  const integrationState = stateFromCount(input.failedIntegrations);
  const academyState = stateFromCount(input.academyWarnings, 1, 3);
  const pendingErrorsState = stateFromCount(input.pendingErrors, 1, 10);
  const storageState = stateFromStorage(input.storageUsagePercent);
  const syncState = stateFromCount(input.syncFailures, 1, 5);
  const paymentsState = stateFromCount(input.paymentAnomalies, 1, 3);

  const signals: OperationalHealthSignal[] = [
    {
      area: "uploads",
      state: uploadState,
      labelHe: "העלאות",
      summaryHe: input.uploadFailures ? `${input.uploadFailures} העלאות דורשות בדיקה` : "אין כשלים ידועים בהעלאות",
      count: input.uploadFailures,
      severity: severityFromState(uploadState)
    },
    {
      area: "webhooks",
      state: webhookState,
      labelHe: "עדכונים חיצוניים",
      summaryHe: input.webhookFailures ? `${input.webhookFailures} עדכונים נכשלו` : "אין כשלים ידועים בעדכונים",
      count: input.webhookFailures,
      severity: severityFromState(webhookState)
    },
    {
      area: "integrations",
      state: integrationState,
      labelHe: "חיבורים",
      summaryHe: input.failedIntegrations ? `${input.failedIntegrations} חיבורים לא תקינים` : "החיבורים במעקב",
      count: input.failedIntegrations,
      severity: severityFromState(integrationState)
    },
    {
      area: "academy_health",
      state: academyState,
      labelHe: "בריאות אקדמיה",
      summaryHe: input.academyWarnings ? `${input.academyWarnings} נקודות דורשות טיפול` : "אין חסימות אקדמיה ידועות",
      count: input.academyWarnings,
      severity: severityFromState(academyState)
    },
    {
      area: "pending_errors",
      state: pendingErrorsState,
      labelHe: "שגיאות פתוחות",
      summaryHe: input.pendingErrors ? `${input.pendingErrors} שגיאות פתוחות` : "אין שגיאות פתוחות ידועות",
      count: input.pendingErrors,
      severity: severityFromState(pendingErrorsState)
    },
    {
      area: "storage",
      state: storageState,
      labelHe: "אחסון",
      summaryHe: input.storageUsagePercent === undefined ? "שימוש באחסון דורש חיבור מדידה" : `${input.storageUsagePercent}% שימוש באחסון`,
      severity: severityFromState(storageState)
    },
    {
      area: "sync",
      state: syncState,
      labelHe: "סנכרון",
      summaryHe: input.syncFailures ? `${input.syncFailures} פעולות לא הסתנכרנו` : "אין כשלים ידועים בסנכרון",
      count: input.syncFailures,
      severity: severityFromState(syncState)
    },
    {
      area: "payments",
      state: paymentsState,
      labelHe: "תשלומים",
      summaryHe: input.paymentAnomalies ? `${input.paymentAnomalies} תשלומים דורשים בדיקה` : "אין חריגות תשלום ידועות",
      count: input.paymentAnomalies,
      severity: severityFromState(paymentsState)
    }
  ];

  return {
    academyId: input.academyId,
    generatedAt: input.generatedAt,
    signals,
    nextReviewHe: "בדיקה יומית בזמן פיילוט, ומיד אחרי כל שחרור"
  };
}
