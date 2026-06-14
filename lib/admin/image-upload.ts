import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const ADMIN_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const ADMIN_IMAGE_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const ADMIN_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif";

export function validateAdminImageFile(
  file: File,
): { ok: true } | { ok: false; error: string } {
  if (!ADMIN_IMAGE_ALLOWED_TYPES.has(file.type)) {
    return {
      ok: false,
      error: "Only JPEG, PNG, WebP, and GIF images are allowed.",
    };
  }

  if (file.size > ADMIN_IMAGE_MAX_BYTES) {
    return { ok: false, error: "Image must be 5 MB or smaller." };
  }

  return { ok: true };
}

export async function uploadAdminImageToStorage(
  bucket: string,
  file: File,
  pathPrefix = "",
): Promise<string> {
  const validation = validateAdminImageFile(file);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const extension = file.type.split("/")[1] ?? "jpg";
  const filename = `${randomUUID()}.${extension}`;
  const path = pathPrefix ? `${pathPrefix}/${filename}` : filename;
  const buffer = Buffer.from(await file.arrayBuffer());
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}
