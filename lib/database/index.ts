/**
 * Data access layer — Supabase / PostgreSQL.
 * UI and contexts should call `lib/services/*`, not repositories directly.
 */
export * from "./supabase/client";
export * from "./supabase/server";
export * from "./repositories/interfaces";
