import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { IMAGE_DRAFTS_BUCKET } from "@/lib/images/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Storage for generated images.
 *
 * Everything lands in the private drafts bucket first. Provider CDN URLs
 * expire within hours, so an image that has not been re-hosted is an image
 * that will disappear; and because the bucket has no public-read policy, an
 * unapproved image has no URL to leak. Copying into a public bucket happens
 * only at approval, and only for production-policy work.
 */

/** Generated images run larger than the 5 MB admin uploads. */
export const GENERATED_IMAGE_MAX_BYTES = 20 * 1024 * 1024;

/** Must stay in sync with the bucket's allowed_mime_types. */
export const GENERATED_IMAGE_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Short-lived by design: a leaked review URL should die quickly. */
export const SIGNED_URL_TTL_SECONDS = 300;

export type DownloadedImage = {
  buffer: Buffer;
  contentType: string;
  bytes: number;
  checksum: string;
};

export class ImageIngestError extends Error {
  readonly category: "integrity" | "permanent";

  constructor(message: string, category: "integrity" | "permanent" = "integrity") {
    super(message);
    this.name = "ImageIngestError";
    this.category = category;
  }
}

/** Sniff the real type from magic bytes; never trust Content-Type alone. */
function detectContentType(buffer: Buffer): string | null {
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer.subarray(1, 4).toString("ascii") === "PNG"
  ) {
    return "image/png";
  }

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

/**
 * Fetch a provider image into memory.
 *
 * Failures here are integrity errors rather than job failures: one variant
 * of four going missing should not discard the three that arrived.
 */
export async function downloadProviderImage(
  url: string,
): Promise<DownloadedImage> {
  let response: Response;

  try {
    response = await fetch(url);
  } catch (error) {
    throw new ImageIngestError(
      `Failed to fetch image: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  if (!response.ok) {
    throw new ImageIngestError(
      `Failed to fetch image: HTTP ${response.status}`,
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length === 0) {
    throw new ImageIngestError("Provider returned an empty image.");
  }

  if (buffer.length > GENERATED_IMAGE_MAX_BYTES) {
    throw new ImageIngestError(
      `Image exceeds ${GENERATED_IMAGE_MAX_BYTES} bytes.`,
      "permanent",
    );
  }

  const contentType = detectContentType(buffer);

  if (!contentType) {
    throw new ImageIngestError(
      "Downloaded bytes are not a PNG, JPEG or WebP image.",
      "permanent",
    );
  }

  if (!GENERATED_IMAGE_ALLOWED_TYPES.has(contentType)) {
    throw new ImageIngestError(
      `Unsupported image type: ${contentType}`,
      "permanent",
    );
  }

  return {
    buffer,
    contentType,
    bytes: buffer.length,
    checksum: createHash("sha256").update(buffer).digest("hex"),
  };
}

export type StoredImage = {
  bucket: string;
  path: string;
  contentType: string;
  bytes: number;
  checksum: string;
};

export async function storeDraftImage(
  jobId: string,
  variantIndex: number,
  image: DownloadedImage,
): Promise<StoredImage> {
  const extension = EXTENSION_BY_TYPE[image.contentType] ?? "png";
  // Job-scoped prefix so a job's variants stay together and a retry cannot
  // silently overwrite an earlier attempt's image.
  const path = `${jobId}/${variantIndex}-${randomUUID()}.${extension}`;

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.storage
    .from(IMAGE_DRAFTS_BUCKET)
    .upload(path, image.buffer, {
      contentType: image.contentType,
      upsert: false,
    });

  if (error) {
    throw new ImageIngestError(`Failed to store image: ${error.message}`);
  }

  return {
    bucket: IMAGE_DRAFTS_BUCKET,
    path,
    contentType: image.contentType,
    bytes: image.bytes,
    checksum: image.checksum,
  };
}

/**
 * Issue a short-lived URL for an unapproved image.
 * The only way to view anything in the drafts bucket.
 */
export async function createDraftSignedUrl(
  path: string,
  expiresInSeconds: number = SIGNED_URL_TTL_SECONDS,
): Promise<string | null> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.storage
    .from(IMAGE_DRAFTS_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    return null;
  }

  return data?.signedUrl ?? null;
}

/**
 * Copy an approved image into a public bucket.
 *
 * Callers must have checked the release policy first — this function is the
 * mechanism, not the gate. The gate is the production-only CHECK on
 * image_assets and the approval handler (design doc §7.7).
 */
export async function publishApprovedImage(params: {
  sourcePath: string;
  targetBucket: string;
  targetPath: string;
  contentType: string;
}): Promise<string> {
  const supabase = createSupabaseAdminClient();

  const { data: file, error: downloadError } = await supabase.storage
    .from(IMAGE_DRAFTS_BUCKET)
    .download(params.sourcePath);

  if (downloadError || !file) {
    throw new Error(
      `Failed to read draft image: ${downloadError?.message ?? "not found"}`,
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(params.targetBucket)
    .upload(params.targetPath, buffer, {
      contentType: params.contentType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to publish image: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(params.targetBucket)
    .getPublicUrl(params.targetPath);

  return data.publicUrl;
}
