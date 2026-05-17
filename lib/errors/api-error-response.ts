import { NextResponse } from "next/server";

export function apiErrorResponse(
  code: string,
  status: number,
  options: {
    messageHe?: string;
    messageEn?: string;
    technicalDetails?: string;
  } = {}
) {
  return NextResponse.json(
    {
      ok: false,
      error: code,
      message: options.messageHe ?? "הפעולה לא הושלמה. אפשר לנסות שוב בעוד רגע.",
      messageEn: options.messageEn ?? "The action could not be completed. Please try again in a moment.",
      technicalDetails: process.env.NODE_ENV === "production" ? undefined : options.technicalDetails
    },
    { status }
  );
}

export function supabaseUnavailableResponse(technicalDetails?: string) {
  return apiErrorResponse("supabase_unavailable", 503, {
    messageHe: "החיבור למסד הנתונים לא זמין כרגע. מצב דמו מקומי עדיין פתוח.",
    messageEn: "The database connection is unavailable right now. Local demo mode remains available.",
    technicalDetails
  });
}
