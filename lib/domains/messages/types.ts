export type V6MessageChannel = "announcements" | "group" | "direct" | "staff" | "urgent";

export type V6MessageBoundary = {
  channel: V6MessageChannel;
  requiresApproval: boolean;
  urgent: boolean;
};
