import { NextRequest, NextResponse } from "next/server";
import { buildR2MediaKey, getR2MediaConfig, validateR2SignedUploadRequest, type R2SignedUploadRequest } from "@/lib/r2/media-storage";

export async function POST(request: NextRequest) {
  let body: Partial<R2SignedUploadRequest>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "Invalid JSON body." }, { status: 400 });
  }

  const validationReason = validateR2SignedUploadRequest(body);
  if (validationReason) return NextResponse.json({ ok: false, reason: validationReason }, { status: 400 });

  const config = getR2MediaConfig();
  const mediaItemId = crypto.randomUUID();
  const r2Key = buildR2MediaKey(body.context!, mediaItemId, body.fileName!);

  if (!config.configured) {
    return NextResponse.json(
      {
        ok: false,
        status: "unconfigured",
        reason: config.reason,
        bucket: config.bucket,
        r2Key,
        mediaItemId,
        nextStep: "Install and wire a server-only S3-compatible signing client when production uploads are intentionally enabled."
      },
      { status: 501 }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      status: "signing_not_implemented",
      reason: "R2 credentials are present, but this route intentionally does not generate signed URLs until the production backend migration is approved.",
      bucket: config.bucket,
      r2Key,
      mediaItemId
    },
    { status: 501 }
  );
}
