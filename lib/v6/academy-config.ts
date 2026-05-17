import type { Academy, AcademyFeatureFlag, V6User } from "./types";
import { DEFAULT_ACADEMY_ID, DEFAULT_ACADEMY_SLUG, lkStudioAcademy } from "./seed";

export const DEFAULT_ACADEMY = lkStudioAcademy;

export const DEFAULT_ACADEMY_FEATURE_FLAGS: AcademyFeatureFlag[] = [
  "shop",
  "private_lessons",
  "media_gallery",
  "ai_insights",
  "event_mode",
  "attendance",
  "adult_groups",
  "student_uploads",
  "daily_practice"
];

export function academyIdForUser(user: Pick<V6User, "studioId" | "activeAcademyId">) {
  return user.activeAcademyId ?? user.studioId ?? DEFAULT_ACADEMY_ID;
}

export function canSwitchAcademies(user: Pick<V6User, "role" | "platformRole">) {
  return user.role === "super_admin" || user.platformRole === "super_admin";
}

export function academyLoginPath(academy: Pick<Academy, "slug"> = { slug: DEFAULT_ACADEMY_SLUG }) {
  return `/academy/${academy.slug}/login`;
}

export function resolveAcademyBySlug(academies: Academy[] | undefined, slug: string) {
  return academies?.find((academy) => academy.slug === slug && academy.status === "active") ?? (slug === DEFAULT_ACADEMY_SLUG ? DEFAULT_ACADEMY : undefined);
}
