export type UserFacingErrorSeverity = "info" | "warning" | "error";

export type UserFacingError = {
  code: string;
  severity: UserFacingErrorSeverity;
  messageHe: string;
  messageEn: string;
  retryable: boolean;
  contactStudio: boolean;
  technicalDetails?: string;
};

export function createUserFacingError(
  code: string,
  options: {
    messageHe: string;
    messageEn: string;
    retryable?: boolean;
    contactStudio?: boolean;
    severity?: UserFacingErrorSeverity;
    technicalDetails?: string;
  }
): UserFacingError {
  return {
    code,
    severity: options.severity ?? "error",
    messageHe: options.messageHe,
    messageEn: options.messageEn,
    retryable: options.retryable ?? false,
    contactStudio: options.contactStudio ?? false,
    technicalDetails: process.env.NODE_ENV === "production" ? undefined : options.technicalDetails
  };
}

export function friendlyServerError(code = "server_error", technicalDetails?: string): UserFacingError {
  return createUserFacingError(code, {
    messageHe: "משהו השתבש. אפשר לנסות שוב בעוד רגע.",
    messageEn: "Something went wrong. Please try again in a moment.",
    retryable: true,
    contactStudio: false,
    technicalDetails
  });
}

export function permissionError(code = "permission_denied"): UserFacingError {
  return createUserFacingError(code, {
    messageHe: "אין לך הרשאה לבצע את הפעולה הזו.",
    messageEn: "You do not have permission to perform this action.",
    retryable: false,
    contactStudio: true,
    severity: "warning"
  });
}

export function weakConnectionError(code = "weak_connection"): UserFacingError {
  return createUserFacingError(code, {
    messageHe: "החיבור חלש. שמרנו את הפעולה וננסה לסנכרן שוב.",
    messageEn: "The connection is weak. We saved the action and will retry sync.",
    retryable: true,
    contactStudio: false,
    severity: "warning"
  });
}
