import type { PrivateLessonDurationMinutes } from "@/lib/types";

export const PRIVATE_LESSON_PRICE_30 = 150;
export const PRIVATE_LESSON_PRICE_45 = 225;

export const PRIVATE_LESSON_DURATIONS: PrivateLessonDurationMinutes[] = [30, 45];

export const PRIVATE_LESSON_WARMUP_POLICY =
  "מומלץ להגיע מחוממים/מחוממות לפני השיעור הפרטי. אם המורה יזהה שהתלמיד/ה לא חומם/ה כראוי, המורה יוביל חימום מלא ומקצועי כחלק מזמן השיעור — הזמן יוקדש לחימום ולא יורחב מעבר למשך השיעור שנרכש.";

export function privateLessonPriceForDuration(minutes: PrivateLessonDurationMinutes): number {
  return minutes === 30 ? PRIVATE_LESSON_PRICE_30 : PRIVATE_LESSON_PRICE_45;
}

export function defaultPrivateLessonDurations() {
  return PRIVATE_LESSON_DURATIONS.map((minutes) => ({
    minutes,
    price: privateLessonPriceForDuration(minutes)
  }));
}
