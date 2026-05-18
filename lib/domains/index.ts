export { runDomainMutation } from "./core/mutate";
export type { DomainMutationInput, DomainMutationResult, DomainActor } from "./core/types";
export type * from "./core/domain-types";
export * from "./core/domain-adapters";
export { domainGuards } from "./core/permissions";

export * as studioTasks from "./studio-tasks/operations";
export * as media from "./media/operations";
export * as events from "./events/operations";
export * as commerce from "./commerce/operations";
export * as platform from "./platform/operations";
export * as privateLessons from "./private-lessons/operations";
export * as users from "./users/operations";
export * as legacyEvents from "./legacy-events/operations";
export * as communication from "./communication/operations";
export * as editableText from "./editable-text/operations";
