# Cloudflare R2 Media Architecture

Cloudflare R2 is the official long-term media storage direction for LK Student Space. Local blobs, JSON and git are not production media storage.

Production model:

- Next.js/Vercel serves the app and trusted API routes.
- Supabase Postgres stores media metadata, permissions, moderation state and search fields.
- Cloudflare R2 stores original files, thumbnails and archive assets.
- Private media uses signed URLs.
- Public URLs are only for approved public, shop, event, competition, annual-show or legacy media.

## Bucket

Bucket:

```text
academy-media
```

Required key structure:

```text
academy-media/
  academies/{academyId}/
    groups/{groupId}/lessons/{classId}/{YYYY-MM-DD}/
    events/{eventId}/
    competitions/{competitionId}/
    annual-shows/{showId}/
    shop/products/{productId}/
    students/{studentId}/submissions/{taskId}/
    legacy/
    thumbnails/
```

The local helper `buildR2MediaKey()` in `lib/r2/media-storage.ts` and the Phase 2 helper `buildR2ObjectKey()` in `lib/r2/signed-upload.ts` prepare keys in this shape. New upload flows should use `/api/media/create-upload-url`, `/api/media/complete-upload` and `/api/media/list`. The older `app/api/media/r2/signed-upload/route.ts` remains as a compatibility placeholder.

Phase 10 adds inert multi-academy media contracts in `lib/platform/multi-academy.ts`. Future gallery listing, signed-download and archive tools should verify object keys with the active academy prefix before returning URLs or metadata:

```text
academies/{academyId}/...
```

No user-driven request should list or infer media outside the active academy prefix. Super Admin repair/export tools may inspect another academy only after explicit academy selection and audit.

## Metadata

Supabase/Postgres media metadata must store:

- `academyId`
- `groupId`
- `classId`
- `eventId`
- `competitionId`
- `productId`
- `studentId`
- `uploadedByUserId`
- `uploaderName`
- `lessonDate`
- `lessonTime`
- `tags`
- `visibility`
- `r2Bucket`
- `r2Key`
- `thumbnailKey`
- `fileName`
- `mimeType`
- `fileSize`
- `mediaType`
- `createdAt`

Phase 2 `media_items` also stores `product_id`, `uploaded_by_name`, `status`, `updated_at` and the production visibility enum: `group`, `group_parents`, `teacher_only`, `staff_only`, `management_only`, `shop_public`, `event_public`, `legacy_public`.

Search and filtering must support academy, group, age group, dance style, teacher/uploader, lesson date/time, event, competition, annual show, tag, media type and upload history.

## Required Views

The media foundation must support:

- group gallery
- lesson timeline
- teacher upload history
- event gallery
- annual show memories
- competition memories
- shop product media
- student submissions
- studio legacy
- choreography and teacher resources

## Upload Flow

Allowed upload flow:

1. User selects a file.
2. App validates role, academy scope and target context.
3. App requests a signed upload URL from the server.
4. Server validates user, academy, visibility and storage key.
5. File uploads to R2.
6. Server/app creates media metadata in Supabase.
7. Media appears in the right gallery, shop product, event, lesson or archive view.
8. Audit log is written.
9. Notification or activity is created when relevant.

Unauthorized direct public uploads are never allowed.

## Visibility

Default private:

- student submissions
- lesson media
- group-only memories
- teacher resources

Potentially public after approval:

- shop product images
- public event media
- competition highlights
- annual show highlights
- legacy/public archive moments

Signed URLs should be short-lived for private media. Public base URLs should only be used for assets explicitly approved for public display.

## Environment

```bash
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=academy-media
CLOUDFLARE_R2_PUBLIC_BASE_URL=
```

`CLOUDFLARE_R2_ACCESS_KEY_ID` and `CLOUDFLARE_R2_SECRET_ACCESS_KEY` are server-only and must never be exposed to browser code.

## Current Local Foundation

This task does not fully migrate the backend. The Phase 2 routes validate request shape and academy scope, generate the intended R2 key and return:

- `local_demo` when R2 env vars are missing
- a short-lived signed `PUT` URL when server-only R2 env vars are configured
- metadata-only completion through the repository layer when Supabase is unavailable

This keeps the local MVP safe while documenting the exact next backend integration point.

## Production Work Remaining

- Harden production permission checks around every upload context.
- Review Supabase media metadata RLS against real academy memberships.
- Add academy membership and media visibility policies.
- Add upload completion confirmation and orphan cleanup.
- Add thumbnail generation and video processing.
- Add moderation, audit and activity feed integration.
- Add signed URL refresh for private media.
- Add R2 lifecycle/archive and backup rules.
