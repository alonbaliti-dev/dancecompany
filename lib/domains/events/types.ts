import type { V6Database } from "@/lib/v6/types";

export type V6Event = V6Database["events"][number];

export type V6EventReadinessStatus = "calm" | "attention" | "critical";
