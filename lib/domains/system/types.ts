export type V6SystemSeverity = "calm" | "attention" | "critical";

export type V6SystemIssue = {
  id: string;
  title: string;
  body: string;
  severity: V6SystemSeverity;
  source: "database" | "permissions" | "media" | "notifications" | "sync" | "ai";
};
