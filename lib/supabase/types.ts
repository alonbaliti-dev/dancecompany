export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AcademyStatus = "active" | "inactive" | "archived";
export type RecordStatus = "active" | "inactive" | "pending" | "paused" | "archived" | "draft" | "published" | "completed" | "cancelled" | "hidden";
export type UserRole = "student" | "parent" | "teacher" | "management" | "super_admin";
export type PlatformRole = "super_admin";
export type MediaVisibility = "group" | "group_parents" | "teacher_only" | "staff_only" | "management_only" | "shop_public" | "event_public" | "legacy_public";
export type MediaStatus = "pending_upload" | "uploaded" | "processing" | "ready" | "needs_review" | "approved" | "hidden" | "archived" | "failed";

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type AcademyRow = {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  country: string;
  timezone: string;
  status: AcademyStatus;
  created_at: string;
  updated_at: string;
};

export type AcademyBrandingRow = {
  id: string;
  academy_id: string;
  display_name: string;
  logo_url: string | null;
  background_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  highlight_color: string | null;
  tagline: string | null;
  metadata: Json;
  status: RecordStatus;
  created_at: string;
  updated_at: string;
};

export type UserProfileRow = {
  id: string;
  academy_id: string | null;
  auth_user_id: string | null;
  full_name: string;
  full_name_he: string | null;
  email: string | null;
  phone: string | null;
  platform_role: PlatformRole | null;
  active_academy_id: string | null;
  status: RecordStatus;
  metadata: Json;
  created_at: string;
  updated_at: string;
};

export type UserRoleRow = {
  id: string;
  academy_id: string;
  user_id: string;
  role: UserRole;
  status: RecordStatus;
  created_at: string;
  updated_at: string;
};

export type AuthCredentialRow = {
  id: string;
  academy_id: string;
  user_profile_id: string;
  phone_normalized: string;
  password_hash: string;
  temporary_password_flag: boolean;
  must_change_password: boolean;
  status: RecordStatus;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MediaItemRow = {
  id: string;
  academy_id: string;
  group_id: string | null;
  class_id: string | null;
  event_id: string | null;
  product_id: string | null;
  student_id: string | null;
  uploaded_by_user_id: string | null;
  uploaded_by_name: string | null;
  lesson_date: string | null;
  lesson_time: string | null;
  tags: string[];
  visibility: MediaVisibility;
  r2_bucket: string;
  r2_key: string;
  thumbnail_key: string | null;
  file_name: string;
  mime_type: string;
  file_size: number;
  media_type: string;
  status: MediaStatus;
  metadata: Json;
  created_at: string;
  updated_at: string;
};

export type ShopProductRow = {
  id: string;
  academy_id: string;
  title: string;
  description: string | null;
  category: string | null;
  product_type: string | null;
  price: number;
  price_mode: string;
  inventory_status: string;
  visibility: string;
  image_media_ids: string[];
  featured_image_media_id: string | null;
  status: RecordStatus;
  metadata: Json;
  created_at: string;
  updated_at: string;
};

export type AttendanceRecordRow = {
  id: string;
  academy_id: string;
  class_id: string | null;
  group_id: string | null;
  student_id: string | null;
  status: string;
  note: string | null;
  marked_by_user_id: string | null;
  class_date: string | null;
  saved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      academies: Table<AcademyRow, Partial<AcademyRow> & Pick<AcademyRow, "id" | "name" | "slug">>;
      academy_branding: Table<AcademyBrandingRow, Partial<AcademyBrandingRow> & Pick<AcademyBrandingRow, "academy_id" | "display_name">>;
      users_profile: Table<UserProfileRow, Partial<UserProfileRow> & Pick<UserProfileRow, "id" | "full_name">>;
      user_roles: Table<UserRoleRow, Partial<UserRoleRow> & Pick<UserRoleRow, "academy_id" | "user_id" | "role">>;
      auth_credentials: Table<AuthCredentialRow, Partial<AuthCredentialRow> & Pick<AuthCredentialRow, "academy_id" | "user_profile_id" | "phone_normalized" | "password_hash">>;
      age_groups: Table<Record<string, Json>>;
      dance_styles: Table<Record<string, Json>>;
      groups: Table<Record<string, Json>>;
      classes: Table<Record<string, Json>>;
      attendance_records: Table<AttendanceRecordRow, Partial<AttendanceRecordRow> & Pick<AttendanceRecordRow, "id" | "academy_id" | "status">>;
      tasks: Table<Record<string, Json>>;
      messages: Table<Record<string, Json>>;
      notifications: Table<Record<string, Json>>;
      shop_products: Table<ShopProductRow, Partial<ShopProductRow> & Pick<ShopProductRow, "id" | "academy_id" | "title">>;
      shop_orders: Table<Record<string, Json>>;
      private_lesson_requests: Table<Record<string, Json>>;
      teacher_availability: Table<Record<string, Json>>;
      media_items: Table<MediaItemRow, Partial<MediaItemRow> & Pick<MediaItemRow, "id" | "academy_id" | "r2_bucket" | "r2_key" | "file_name" | "mime_type" | "media_type">>;
      gallery_collections: Table<Record<string, Json>>;
      events: Table<Record<string, Json>>;
      achievements: Table<Record<string, Json>>;
      feature_flags: Table<Record<string, Json>>;
      audit_logs: Table<Record<string, Json>>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      academy_status: AcademyStatus;
      record_status: RecordStatus;
      user_role: UserRole;
      platform_role: PlatformRole;
      media_visibility: MediaVisibility;
      media_status: MediaStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
