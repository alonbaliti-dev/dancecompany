# Supabase Media Architecture

This document is retained for the earlier Supabase media foundation. The updated production direction is Cloudflare R2 for files and Supabase/Postgres for metadata. See `docs/CLOUDFLARE_R2_MEDIA_ARCHITECTURE.md` for the authoritative storage plan.

This document defines the metadata foundation for LK Student Space media: real photos, videos, product images, lesson timelines, event galleries, and student submissions backed by durable database metadata.

## Why Local Media Is Not Enough

The current local JSON/blob URL approach is useful for demos, but it cannot be the production source of truth:

- Blob URLs disappear when the browser session ends.
- Local JSON cannot safely store large files, thumbnails, processing state, or signed URL metadata.
- Teachers, parents, students, management, and shop pages need shared media history across devices.
- Visibility rules need to be enforceable outside React components.
- Videos need future compression, transcoding, streaming, and retryable processing workflows.

The updated production model is: files live in Cloudflare R2, durable metadata lives in Supabase Postgres, and the app keeps a clear dev-only fallback when production env is missing.

## Environment

Browser code may only use public Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Server code may use the optional service role key for backend-only writes and maintenance:

```bash
# Server only. Never prefix with NEXT_PUBLIC_.
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

If these values are missing, the new media services return an explicit `unconfigured` result and create preview-only local metadata. They do not claim the file was uploaded or persisted.

## Schema

Initial SQL for the media foundation:

```sql
create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  studio_id text not null,
  group_id text,
  class_id text,
  lesson_date date,
  lesson_time text,
  uploaded_by_user_id text not null,
  uploaded_by_name text not null,
  uploaded_by_role text not null,
  media_type text not null check (media_type in ('image', 'video')),
  title text not null,
  description text,
  tags text[] not null default '{}',
  storage_bucket text not null default 'studio-media',
  storage_path text not null unique,
  public_url text,
  signed_url_metadata jsonb,
  thumbnail_path text,
  file_name text not null,
  mime_type text not null,
  file_size bigint not null check (file_size >= 0),
  duration_seconds integer,
  visibility text not null check (visibility in ('group', 'staff', 'management', 'shop', 'private', 'public')),
  status text not null check (status in ('uploading', 'processing', 'ready', 'failed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_tags (
  id uuid primary key default gen_random_uuid(),
  studio_id text not null,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  unique (studio_id, name)
);

create table if not exists public.media_collections (
  id text primary key,
  studio_id text not null,
  group_id text,
  title text not null,
  description text,
  type text not null check (type in ('group_gallery', 'lesson_timeline', 'event_gallery', 'teacher_resource', 'shop_product')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_collection_items (
  collection_id text not null references public.media_collections(id) on delete cascade,
  media_item_id uuid not null references public.media_items(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (collection_id, media_item_id)
);

create index if not exists media_items_studio_group_idx on public.media_items (studio_id, group_id, created_at desc);
create index if not exists media_items_lesson_idx on public.media_items (studio_id, group_id, class_id, lesson_date, lesson_time);
create index if not exists media_items_uploader_idx on public.media_items (studio_id, uploaded_by_user_id, created_at desc);
create index if not exists media_items_visibility_status_idx on public.media_items (studio_id, visibility, status);
create index if not exists media_items_tags_idx on public.media_items using gin (tags);
```

RLS must be enabled before public production access:

```sql
alter table public.media_items enable row level security;
alter table public.media_tags enable row level security;
alter table public.media_collections enable row level security;
alter table public.media_collection_items enable row level security;
```

Policies should be added after the app has a durable user/studio membership table in Supabase. Until then, server-side service-role writes must stay behind trusted API routes and domain operations.

## Storage

Bucket: `studio-media`

Required object paths:

- Group/class media: `studios/{studioId}/groups/{groupId}/classes/{classId}/YYYY-MM-DD/{mediaId}-{filename}`
- Shop product media: `studios/{studioId}/shop/products/{productId}/{mediaId}-{filename}`
- Event media: `studios/{studioId}/events/{eventId}/{mediaId}-{filename}`
- Student submissions: `studios/{studioId}/students/{studentId}/submissions/{taskId}/{mediaId}-{filename}`

Filenames are sanitized by `sanitizeMediaFileName()` to remove path separators and unsafe characters. The service prepends the generated media ID so repeated filenames do not collide.

## Permissions Foundation

The current implementation enforces permissions in the repository/service shape before upload or metadata access:

- Teachers can upload only to assigned groups and view assigned group media.
- Students can upload their own submissions; submissions default to `private`.
- Parents can view only linked child/group media once parent membership is represented in metadata queries.
- Management can upload and view all studio media.
- Super Admin can access metadata and system health across studios.
- Shop media with `shop` or `public` visibility can be shown in the shop.
- Student submissions stay private by default and should not become group-visible unless a teacher/management flow explicitly promotes them.

Future RLS should mirror these same rules in Postgres and Storage policies. Do not rely only on client filtering for production.

## Upload Flows

Teacher group upload:

1. Build a teacher context with `buildTeacherMediaUploadContext()`.
2. Validate title, MIME type, file size, group ID, class ID, lesson date, and optional lesson time.
3. Confirm the teacher is assigned to the group.
4. Upload to `studio-media`.
5. Insert `media_items` metadata with `visibility = 'group'` unless staff/management visibility is explicitly chosen.

Management upload:

1. Build a management context for group, event, or product storage.
2. Management can set broader visibility.
3. Insert metadata and optionally attach to collections.

Student submission:

1. Build a student context with student ID and task ID.
2. Confirm the actor is the same student.
3. Upload under the student submission path.
4. Insert metadata with `visibility = 'private'`.

Product image upload:

1. Build a product context with `buildProductImageUploadContext()`.
2. Upload under the shop product path.
3. Insert a `media_items` row with `visibility = 'shop'`.
4. Link the media to a `shop_product` collection and return a product patch with `featuredImageMediaId` / `imageMediaIds`.

Event media upload:

1. Build an event context with event ID.
2. Upload under the event path.
3. Insert metadata and attach to an event gallery collection when the event UI is wired.

## Filtering, Search, And History

`listMediaItems()` supports filtering by:

- studio
- group
- uploader
- lesson date
- lesson time
- class/session
- tags
- image/video type
- visibility
- status

This supports lesson timelines, group galleries, teacher upload history, shop media pickers, and moderation queues. Search should eventually join the platform OS search index instead of adding per-screen filters.

## Product Image Integration

V6 products already support:

```ts
featuredImageMediaId?: string;
imageMediaIds: string[];
```

The backend foundation returns a product patch rather than rewriting shop UI. Product editors can call `uploadMedia()` with a product context, then persist the returned `featuredImageMediaId` and `imageMediaIds` through the existing shop domain operation.

## Local Fallback Behavior

When Supabase env is missing:

- Upload service returns `status: 'unconfigured'`.
- Metadata is marked `devOnly` and held in process memory only.
- `previewOnly: true` is returned to callers.
- No file is uploaded.
- No production persistence is implied.

This keeps V6 demos working while making it obvious that real media requires Supabase configuration and schema deployment.

## Future Media Pipeline

Production media should add:

- image thumbnail generation and responsive variants
- video compression/transcoding queue
- streaming-friendly video delivery
- signed URL refresh for private media
- virus/malware scanning before public visibility
- moderation status and review notes
- retryable processing jobs
- orphaned file cleanup when metadata insert fails
- audit entries and activity feed records for every sensitive write

## Production Risks

- Service role must remain server-only.
- Storage policies must not expose private student submissions.
- Public bucket URLs should only be used for shop/public media.
- Large videos should use direct-to-storage upload and background processing.
- Metadata insert failure after file upload can create orphaned storage objects until cleanup exists.
- RLS policies need a real Supabase user/studio/group membership model before enabling client-side writes.

## QA Checklist

Automated local checks:

- `npm run lint`
- `npm run typecheck`
- `npm run build`

Manual Supabase QA once a real project is configured:

- Create the schema and `studio-media` bucket.
- Confirm service role is available only on the server.
- Upload an image as management and verify `media_items` row plus Storage object.
- Upload a video as a teacher assigned to a group.
- Attempt teacher upload to an unassigned group and confirm denial.
- Upload a student submission and verify it is private.
- Upload a shop product image and verify product media IDs are returned for persistence.
- Test signed URL behavior for private media.
- Verify RLS and Storage policies with student, parent, teacher, management, and Super Admin accounts.
