import "server-only";

import { mapFabricRow } from "@/lib/db/fabrics/mapper";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  AdminFabricDetail,
  AdminFabricInput,
  AdminFabricListItem,
} from "@/types/admin-fabric";
import type { FabricRow } from "@/types/database";

function mapListItem(row: FabricRow): AdminFabricListItem {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    sortOrder: row.sort_order,
    imageUrl: row.image_url,
  };
}

function mapDetail(row: FabricRow): AdminFabricDetail {
  const fabric = mapFabricRow(row);

  return {
    slug: fabric.slug,
    name: fabric.name,
    tagline: fabric.tagline,
    descriptionLines: [...fabric.descriptionLines],
    imageUrl: fabric.imageUrl,
    imageAlt: fabric.imageAlt,
    sortOrder: fabric.sortOrder,
    character: { ...fabric.character },
  };
}

export async function listAdminFabrics(): Promise<AdminFabricListItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("fabrics")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to list fabrics: ${error.message}`);
  }

  return (data ?? []).map(mapListItem);
}

export async function getAdminFabric(
  slug: string,
): Promise<AdminFabricDetail | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("fabrics")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch fabric: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapDetail(data);
}

export async function updateAdminFabric(
  slug: string,
  input: AdminFabricInput,
): Promise<AdminFabricDetail> {
  if (!isSupabaseConfigured()) {
    throw new Error("Cannot update fabric: Supabase is not configured.");
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("fabrics")
    .update({
      name: input.name,
      tagline: input.tagline,
      description_lines: input.descriptionLines,
      image_url: input.imageUrl,
      image_alt: input.imageAlt,
      sort_order: input.sortOrder,
      character_thickness: input.character.thickness,
      character_softness: input.character.softness,
      character_structure: input.character.structure,
      character_sheerness: input.character.sheerness,
      character_surface: input.character.surface,
    })
    .eq("slug", slug)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      `Failed to update fabric: ${error?.message ?? "Unknown error"}`,
    );
  }

  return mapDetail(data);
}
