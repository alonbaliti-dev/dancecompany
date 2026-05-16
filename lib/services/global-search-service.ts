import { getRuntimeDatabase } from "@/lib/local-db/runtime-store";
import { getStudioGroups } from "@/lib/studio-groups-access";
import type { UserProfile } from "@/lib/types";
import { isManagement, isSuperAdmin, isTeacherTier } from "@/lib/permissions";
import type { StackTabId } from "@/lib/types";

export type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  stackTarget?: StackTabId;
  mainTab?: "dashboard" | "lessons" | "messages" | "shop";
};

export function globalSearch(user: UserProfile, query: string, limit = 30): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const db = getRuntimeDatabase();
  const results: SearchResult[] = [];
  const studioId = user.studioId;

  const canSeeUsers = isManagement(user) || isSuperAdmin(user) || isTeacherTier(user);

  if (canSeeUsers) {
    for (const u of db.users) {
      if (!isSuperAdmin(user) && u.studioId !== studioId) continue;
      const hay = `${u.name} ${u.phone ?? ""}`.toLowerCase();
      if (hay.includes(q)) {
        results.push({ id: `u_${u.id}`, title: u.name, subtitle: "משתמש", category: "users", stackTarget: "users" });
      }
    }
  }

  for (const g of getStudioGroups()) {
    if (!isSuperAdmin(user) && g.studioId !== studioId) continue;
    if (g.name.toLowerCase().includes(q)) {
      results.push({ id: `g_${g.id}`, title: g.name, subtitle: "קבוצה", category: "groups", mainTab: "lessons" });
    }
  }

  for (const t of db.tasks) {
    if (t.deletedAt) continue;
    if (t.studioId !== studioId && !isSuperAdmin(user)) continue;
    if (`${t.title} ${t.description}`.toLowerCase().includes(q)) {
      results.push({ id: `t_${t.id}`, title: t.title, subtitle: "משימה", category: "tasks", stackTarget: "tasks_hub" });
    }
  }

  for (const n of db.notifications) {
    if (n.studioId !== studioId && !isSuperAdmin(user)) continue;
    if (`${n.title} ${n.body}`.toLowerCase().includes(q)) {
      results.push({ id: `n_${n.id}`, title: n.title, subtitle: "התראה", category: "messages", stackTarget: "notifications" });
    }
  }

  for (const e of db.events) {
    if (e.title.toLowerCase().includes(q)) {
      results.push({ id: `e_${e.id}`, title: e.title, subtitle: "אירוע", category: "events", stackTarget: "legacy_board" });
    }
  }

  for (const item of db.gallery) {
    if (item.deletedAt) continue;
    if (item.studioId !== studioId && !isSuperAdmin(user)) continue;
    if (`${item.title} ${item.description ?? ""}`.toLowerCase().includes(q)) {
      results.push({ id: `gal_${item.id}`, title: item.title, subtitle: "גלריה", category: "gallery", stackTarget: "gallery" });
    }
  }

  if (isManagement(user) || isSuperAdmin(user)) {
    for (const p of db.shopProducts) {
      if (p.studioId !== studioId && !isSuperAdmin(user)) continue;
      if (p.title.toLowerCase().includes(q)) {
        results.push({ id: `shop_${p.id}`, title: p.title, subtitle: "חנות", category: "shop", stackTarget: "shop" });
      }
    }
    for (const o of db.shopOrders) {
      if (o.studioId !== studioId && !isSuperAdmin(user)) continue;
      if (o.id.toLowerCase().includes(q) || o.userName.toLowerCase().includes(q)) {
        results.push({ id: `ord_${o.id}`, title: o.userName, subtitle: "הזמנה", category: "orders", stackTarget: "shop" });
      }
    }
  }

  return results.slice(0, limit);
}
