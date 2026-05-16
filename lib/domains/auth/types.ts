import type { V6Credential, V6User } from "@/lib/v6/types";

export type V6LoginAttempt = {
  phone: string;
  password: string;
};

export type V6AuthenticatedUser = {
  user: V6User;
  credential: V6Credential;
};
