export type RlsAccessScope =
  | "public_login_shell"
  | "same_academy"
  | "self"
  | "linked_parent_student"
  | "assigned_group"
  | "teacher_assignment"
  | "management"
  | "super_admin"
  | "service_role_only";

export type RlsPolicyPlan = {
  table: string;
  select: RlsAccessScope[];
  insert: RlsAccessScope[];
  update: RlsAccessScope[];
  delete: RlsAccessScope[];
  notes: string;
};

export const phase6RlsPolicyPlan: readonly RlsPolicyPlan[] = [
  {
    table: "academies",
    select: ["public_login_shell", "same_academy", "super_admin"],
    insert: ["super_admin"],
    update: ["super_admin"],
    delete: ["super_admin"],
    notes: "Public reads are limited to active login shell fields; operational fields stay academy-scoped."
  },
  {
    table: "users_profile",
    select: ["self", "linked_parent_student", "teacher_assignment", "management", "super_admin"],
    insert: ["management", "super_admin"],
    update: ["self", "management", "super_admin"],
    delete: ["super_admin"],
    notes: "Roles come from app metadata/profile tables, never user-editable metadata."
  },
  {
    table: "groups",
    select: ["assigned_group", "linked_parent_student", "management", "super_admin"],
    insert: ["management", "super_admin"],
    update: ["teacher_assignment", "management", "super_admin"],
    delete: ["management", "super_admin"],
    notes: "Teacher and parent access is constrained by group/student assignment."
  },
  {
    table: "attendance_records",
    select: ["self", "linked_parent_student", "teacher_assignment", "management", "super_admin"],
    insert: ["teacher_assignment", "management", "super_admin"],
    update: ["teacher_assignment", "management", "super_admin"],
    delete: ["management", "super_admin"],
    notes: "Edits require assigned class/group or management context and always produce audit logs."
  },
  {
    table: "tasks",
    select: ["self", "assigned_group", "linked_parent_student", "management", "super_admin"],
    insert: ["teacher_assignment", "management", "super_admin"],
    update: ["teacher_assignment", "management", "super_admin"],
    delete: ["management", "super_admin"],
    notes: "Student visibility follows assigned task/group; publishing remains staff-controlled."
  },
  {
    table: "messages",
    select: ["self", "linked_parent_student", "assigned_group", "management", "super_admin"],
    insert: ["teacher_assignment", "management", "super_admin"],
    update: ["management", "super_admin"],
    delete: ["management", "super_admin"],
    notes: "Recipients see only their own targeted messages; emergency messages require management."
  },
  {
    table: "notifications",
    select: ["self", "linked_parent_student", "management", "super_admin"],
    insert: ["management", "super_admin", "service_role_only"],
    update: ["self", "management", "super_admin"],
    delete: ["management", "super_admin"],
    notes: "Users may mark their own notifications read; sending is server/management only."
  },
  {
    table: "shop_products",
    select: ["same_academy", "management", "super_admin"],
    insert: ["management", "super_admin"],
    update: ["management", "super_admin"],
    delete: ["management", "super_admin"],
    notes: "Only active/member-visible products are readable to normal users; prices are resolved server-side."
  },
  {
    table: "shop_orders",
    select: ["self", "linked_parent_student", "management", "super_admin"],
    insert: ["self", "management", "super_admin", "service_role_only"],
    update: ["management", "super_admin", "service_role_only"],
    delete: ["super_admin"],
    notes: "Payment status changes come from verified webhooks or audited management actions."
  },
  {
    table: "private_lesson_requests",
    select: ["self", "linked_parent_student", "teacher_assignment", "management", "super_admin"],
    insert: ["self", "linked_parent_student", "management", "super_admin"],
    update: ["teacher_assignment", "management", "super_admin"],
    delete: ["management", "super_admin"],
    notes: "Teacher access is limited to assigned/requested teacher."
  },
  {
    table: "media_items",
    select: ["self", "linked_parent_student", "assigned_group", "teacher_assignment", "management", "super_admin"],
    insert: ["teacher_assignment", "management", "super_admin", "service_role_only"],
    update: ["teacher_assignment", "management", "super_admin", "service_role_only"],
    delete: ["management", "super_admin", "service_role_only"],
    notes: "Visibility enum controls group, parent, staff, management, shop/event public access after moderation."
  },
  {
    table: "events",
    select: ["same_academy", "assigned_group", "management", "super_admin"],
    insert: ["management", "super_admin"],
    update: ["management", "super_admin"],
    delete: ["management", "super_admin"],
    notes: "Annual show/backstage fields need staff-only sub-policies before launch."
  },
  {
    table: "achievements",
    select: ["self", "linked_parent_student", "assigned_group", "management", "super_admin"],
    insert: ["teacher_assignment", "management", "super_admin"],
    update: ["teacher_assignment", "management", "super_admin"],
    delete: ["management", "super_admin"],
    notes: "Student and group membership determines normal-user reads."
  },
  {
    table: "audit_logs",
    select: ["management", "super_admin"],
    insert: ["service_role_only"],
    update: ["service_role_only"],
    delete: ["super_admin"],
    notes: "Audit rows are append-only from trusted server code; normal users never read them."
  }
];
