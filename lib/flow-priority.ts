import type { FlowPriority, StudioUpdate } from "./types";

const rank: Record<FlowPriority, number> = { urgent: 0, important: 1, normal: 2 };

export function priorityRank(p: FlowPriority): number {
  return rank[p];
}

export function compareFlowPriority(a: FlowPriority, b: FlowPriority): number {
  return rank[a] - rank[b];
}

/** Unread first, then priority, then newest. */
export function compareUpdatesForInbox(a: StudioUpdate, b: StudioUpdate, userId: string): number {
  const ra = a.readByUserIds.includes(userId);
  const rb = b.readByUserIds.includes(userId);
  if (ra !== rb) return ra ? 1 : -1;
  const pc = compareFlowPriority(a.priority, b.priority);
  if (pc !== 0) return pc;
  return +new Date(b.createdAt) - +new Date(a.createdAt);
}
