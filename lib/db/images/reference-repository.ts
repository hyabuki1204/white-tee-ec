import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  AdminImageReferenceImage,
  AdminImageReferenceSet,
  AdminImageReferenceSetInput,
} from "@/types/admin-image";
import type {
  ImagePurpose,
  ImageReferenceImageRow,
  ImageReferenceSetRow,
} from "@/types/database";

/**
 * Brand reference image sets.
 *
 * Production jobs pull URLs from the default set so a feed holds one look
 * without the operator picking references per brief. Internal-test work
 * never attaches them — consistency is for publishable imagery only.
 *
 * See docs/image-generation-workflow.md §6.1.1.
 */

/** FLUX accepts at most nine reference images. */
export const MAX_REFERENCE_IMAGES = 9;

type SetWithImages = ImageReferenceSetRow & {
  image_reference_images: ImageReferenceImageRow[] | null;
};

function mapImage(row: ImageReferenceImageRow): AdminImageReferenceImage {
  return {
    id: row.id,
    setId: row.set_id,
    url: row.url,
    assetId: row.asset_id,
    note: row.note,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

function mapSet(row: SetWithImages): AdminImageReferenceSet {
  const images = [...(row.image_reference_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isDefault: row.is_default,
    purposes: row.purposes ?? [],
    images: images.map(mapImage),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function assertValidSetInput(input: AdminImageReferenceSetInput): void {
  if (!input.name.trim()) {
    throw new Error("参照セット名は必須です。");
  }
}

function setAppliesToPurpose(
  purposes: ImagePurpose[],
  purpose: ImagePurpose,
): boolean {
  // Empty means every purpose, matching the migration comment.
  return purposes.length === 0 || purposes.includes(purpose);
}

export async function listReferenceSets(): Promise<AdminImageReferenceSet[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("image_reference_sets")
    .select("*, image_reference_images(*)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list reference sets: ${error.message}`);
  }

  return ((data ?? []) as unknown as SetWithImages[]).map(mapSet);
}

export async function getReferenceSet(
  id: string,
): Promise<AdminImageReferenceSet | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("image_reference_sets")
    .select("*, image_reference_images(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load reference set: ${error.message}`);
  }

  return data ? mapSet(data as unknown as SetWithImages) : null;
}

export async function createReferenceSet(
  input: AdminImageReferenceSetInput,
): Promise<AdminImageReferenceSet> {
  assertValidSetInput(input);

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = createSupabaseAdminClient();

  if (input.isDefault) {
    await supabase
      .from("image_reference_sets")
      .update({ is_default: false })
      .eq("is_default", true);
  }

  const { data, error } = await supabase
    .from("image_reference_sets")
    .insert({
      name: input.name.trim(),
      description: input.description.trim(),
      is_default: input.isDefault,
      purposes: input.purposes,
    })
    .select("*, image_reference_images(*)")
    .single();

  if (error) {
    throw new Error(`Failed to create reference set: ${error.message}`);
  }

  return mapSet(data as unknown as SetWithImages);
}

export async function updateReferenceSet(
  id: string,
  input: AdminImageReferenceSetInput,
): Promise<AdminImageReferenceSet> {
  assertValidSetInput(input);

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = createSupabaseAdminClient();

  if (input.isDefault) {
    await supabase
      .from("image_reference_sets")
      .update({ is_default: false })
      .eq("is_default", true)
      .neq("id", id);
  }

  const { data, error } = await supabase
    .from("image_reference_sets")
    .update({
      name: input.name.trim(),
      description: input.description.trim(),
      is_default: input.isDefault,
      purposes: input.purposes,
    })
    .eq("id", id)
    .select("*, image_reference_images(*)")
    .single();

  if (error) {
    throw new Error(`Failed to update reference set: ${error.message}`);
  }

  return mapSet(data as unknown as SetWithImages);
}

export async function deleteReferenceSet(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("image_reference_sets")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete reference set: ${error.message}`);
  }
}

export async function addReferenceImage(params: {
  setId: string;
  url: string;
  assetId?: string | null;
  note?: string;
}): Promise<AdminImageReferenceImage> {
  const url = params.url.trim();

  if (!url.startsWith("https://")) {
    throw new Error("参照画像 URL は https:// で始まる公開 URL である必要があります。");
  }

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const set = await getReferenceSet(params.setId);

  if (!set) {
    throw new Error("参照セットが見つかりません。");
  }

  if (set.images.length >= MAX_REFERENCE_IMAGES) {
    throw new Error(
      `参照画像は最大 ${MAX_REFERENCE_IMAGES} 枚までです（FLUX の上限）。`,
    );
  }

  const supabase = createSupabaseAdminClient();
  const nextOrder =
    set.images.reduce((max, image) => Math.max(max, image.sortOrder), -1) + 1;

  const { data, error } = await supabase
    .from("image_reference_images")
    .insert({
      set_id: params.setId,
      url,
      asset_id: params.assetId ?? null,
      note: params.note?.trim() ?? "",
      sort_order: nextOrder,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to add reference image: ${error.message}`);
  }

  return mapImage(data as ImageReferenceImageRow);
}

export async function removeReferenceImage(imageId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("image_reference_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    throw new Error(`Failed to remove reference image: ${error.message}`);
  }
}

/**
 * URLs to attach to a production job for this purpose.
 *
 * Returns [] when there is no default set, or the default set does not
 * cover this purpose. Callers decide whether to attach anything at all
 * (internal_test work must not).
 */
export async function resolveReferenceImageUrls(
  purpose: ImagePurpose,
): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("image_reference_sets")
    .select("*, image_reference_images(*)")
    .eq("is_default", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve reference set: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  const set = mapSet(data as unknown as SetWithImages);

  if (!setAppliesToPurpose(set.purposes, purpose)) {
    return [];
  }

  return set.images
    .map((image) => image.url)
    .filter((url) => url.startsWith("https://"))
    .slice(0, MAX_REFERENCE_IMAGES);
}

/** Approved assets the admin can pick as references. */
export async function listReferenceCandidateAssets(limit = 40): Promise<
  Array<{ id: string; publicUrl: string; altTextJa: string; purpose: ImagePurpose }>
> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("image_assets")
    .select("id, public_url, alt_text_ja, purpose")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to list reference candidates: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    publicUrl: row.public_url,
    altTextJa: row.alt_text_ja,
    purpose: row.purpose,
  }));
}
