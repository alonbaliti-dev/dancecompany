import "server-only";

import { requireAcademyScope, type AcademyScopedQuery } from "@/lib/security/academy-scope";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AcademyBrandingRow, AcademyRow } from "@/lib/supabase/types";
import { DEFAULT_ACADEMY, resolveAcademyBySlug } from "@/lib/v6/academy-config";
import { safeInitialV6Database } from "@/lib/v6/seed";
import type { Academy } from "@/lib/v6/types";

export type AcademyLoginBranding = {
  academy: Academy;
  source: "local_demo" | "supabase";
  reason?: string;
};

type AcademyRowWithBranding = AcademyRow & {
  academy_branding?: AcademyBrandingRow | AcademyBrandingRow[] | null;
};

type AcademyQueryBuilder = {
  select: (columns?: string) => AcademyQueryBuilder;
  eq: (column: string, value: unknown) => AcademyQueryBuilder;
  maybeSingle: () => Promise<{ data: AcademyRowWithBranding | null; error: { message?: string } | null }>;
  then: Promise<{ data: AcademyRow[] | null; error: unknown }>["then"];
};

function academiesTable(supabase: { client: { from: (table: string) => unknown } }) {
  return supabase.client.from("academies") as AcademyQueryBuilder;
}

function withBrandingFromRow(academy: Academy, branding?: AcademyBrandingRow | null): Academy {
  if (!branding) return academy;

  return {
    ...academy,
    branding: {
      ...academy.branding,
      displayName: branding.display_name,
      logo: branding.logo_url ?? academy.branding.logo,
      tagline: branding.tagline ?? academy.branding.tagline,
      accentColors: {
        primary: branding.primary_color ?? academy.branding.accentColors?.primary ?? "#D7B56D",
        secondary: branding.secondary_color ?? academy.branding.accentColors?.secondary ?? "#8A6A2D",
        highlight: branding.highlight_color ?? academy.branding.accentColors?.highlight ?? "#F6E6B5"
      }
    }
  };
}

export async function getAcademyBySlug(slug: string): Promise<AcademyLoginBranding> {
  const localAcademy = resolveAcademyBySlug(safeInitialV6Database.academies ?? safeInitialV6Database.studios, slug) ?? DEFAULT_ACADEMY;
  const supabase = getSupabaseServerClient();

  if (supabase.enabled === false) {
    return { academy: localAcademy, source: "local_demo", reason: supabase.reason };
  }

  const { data, error } = await academiesTable(supabase)
    .select("*, academy_branding(*)")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) {
    return {
      academy: localAcademy,
      source: "local_demo",
      reason: error?.message ?? "Academy not found in Supabase; using local demo academy."
    };
  }

  const branding = Array.isArray(data.academy_branding) ? data.academy_branding[0] : data.academy_branding;

  return {
    academy: withBrandingFromRow(
      {
        ...localAcademy,
        id: data.id,
        name: data.name,
        slug: data.slug,
        location: data.location ?? localAcademy.location,
        country: data.country,
        timezone: data.timezone,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      },
      branding as AcademyBrandingRow | null
    ),
    source: "supabase"
  };
}

export async function listAcademies(scope: AcademyScopedQuery): Promise<Academy[]> {
  const academyId = requireAcademyScope(scope);
  const supabase = getSupabaseServerClient();

  if (supabase.enabled === false) {
    return (safeInitialV6Database.academies ?? safeInitialV6Database.studios).filter((academy) => academy.id === academyId);
  }

  const { data, error } = await academiesTable(supabase).select("*").eq("id", academyId);
  if (error) throw error;

  return (data ?? []).map((academy) => ({
    ...DEFAULT_ACADEMY,
    id: academy.id,
    name: academy.name,
    slug: academy.slug,
    location: academy.location ?? "",
    country: academy.country,
    timezone: academy.timezone,
    status: academy.status,
    createdAt: academy.created_at,
    updatedAt: academy.updated_at
  }));
}
