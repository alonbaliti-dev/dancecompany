import type { V6Role, V6Screen, V6Tab } from "./types";

export type V6HomeModuleId =
  | "primary-status"
  | "next-action"
  | "updates"
  | "schedule"
  | "quick-actions"
  | "gallery"
  | "shop"
  | "management";

export type V6NavigationTarget =
  | { kind: "tab"; tab: V6Tab }
  | { kind: "screen"; screen: V6Screen };

export type V6UiModuleConfig = {
  id: V6HomeModuleId;
  visibleFor: V6Role[];
  target?: V6NavigationTarget;
  order: number;
};

export const defaultV6HomeComposition: V6UiModuleConfig[] = [
  { id: "primary-status", visibleFor: ["student", "parent", "teacher", "management", "super_admin"], order: 10 },
  { id: "next-action", visibleFor: ["student", "parent", "teacher", "management", "super_admin"], order: 20 },
  { id: "updates", visibleFor: ["student", "parent", "teacher", "management", "super_admin"], target: { kind: "tab", tab: "messages" }, order: 30 },
  { id: "schedule", visibleFor: ["student", "parent", "teacher", "management", "super_admin"], target: { kind: "tab", tab: "lessons" }, order: 40 },
  { id: "quick-actions", visibleFor: ["student", "parent", "teacher", "management", "super_admin"], order: 50 },
  { id: "gallery", visibleFor: ["student", "parent", "teacher", "management", "super_admin"], target: { kind: "screen", screen: "media" }, order: 60 },
  { id: "shop", visibleFor: ["student", "parent", "teacher", "management", "super_admin"], target: { kind: "tab", tab: "shop" }, order: 70 },
  { id: "management", visibleFor: ["management", "super_admin"], target: { kind: "screen", screen: "system" }, order: 80 }
];

export function modulesForRole(role: V6Role, modules = defaultV6HomeComposition) {
  return modules
    .filter((module) => module.visibleFor.includes(role))
    .sort((a, b) => a.order - b.order);
}
