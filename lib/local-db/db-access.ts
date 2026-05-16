/**
 * Read-only accessors — UI and services should prefer these over seed imports.
 * Data comes from the runtime snapshot loaded from `/database/*.json`.
 */
import type { LocalDatabase } from "./db-types";
import { getRuntimeDatabase } from "./runtime-store";

export function getDb(): LocalDatabase {
  return getRuntimeDatabase();
}

export function getDbUsers() {
  return getRuntimeDatabase().users;
}

export function getDbGroups(studioId?: string) {
  const groups = getRuntimeDatabase().groups;
  return studioId ? groups.filter((g) => g.studioId === studioId) : groups;
}

export function getDbClasses() {
  return getRuntimeDatabase().classes;
}

export function getDbTasks(studioId?: string) {
  const tasks = getRuntimeDatabase().tasks;
  return studioId ? tasks.filter((t) => t.studioId === studioId) : tasks;
}

export function getDbGoals(studentId?: string) {
  const goals = getRuntimeDatabase().productData.goals;
  return studentId ? goals.filter((g) => g.studentId === studentId) : goals;
}

export function getDbEvents() {
  return getRuntimeDatabase().events;
}

export function getDbAchievements() {
  return getRuntimeDatabase().achievements;
}

export function getDbShopProducts(studioId?: string) {
  const products = getRuntimeDatabase().shopProducts;
  return studioId ? products.filter((p) => p.studioId === studioId) : products;
}

export function getDbShopOrders(studioId?: string) {
  const orders = getRuntimeDatabase().shopOrders;
  return studioId ? orders.filter((o) => o.studioId === studioId) : orders;
}

export function getDbEditableTexts() {
  return getRuntimeDatabase().editableTexts;
}

export function getDbSystemSettings() {
  return getRuntimeDatabase().systemSettings;
}
