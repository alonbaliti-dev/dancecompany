import type { UserPermissions, UserProfile, UserType } from "@/lib/types";

export type UserDraft = {
  id?: string;
  studioId: string;
  type: UserType;
  name: string;
  phone: string;
  email?: string;
  status: UserProfile["status"];
  assignedGroupIds: string[];
  permissions: UserPermissions;
  linkedStudentIds: string[];
  linkedParentIds: string[];
  createLinkedParent?: boolean;
  createLinkedStudent?: boolean;
  /** Required when creating a user — stored in authCredentials only (local dev). */
  initialPassword?: string;
};
