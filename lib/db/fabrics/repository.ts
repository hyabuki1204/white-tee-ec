import "server-only";

import { FABRICS } from "@/lib/fabric/content";
import { mapFabricRow, mapFabricRows } from "@/lib/db/fabrics/mapper";
import { createSupabaseStaticClient } from "@/lib/supabase/static";
import { getDataSource, isSupabaseConfigured } from "@/lib/supabase/env";
import type { Fabric } from "@/lib/fabric/content";

function getDefaultFabrics(): Fabric[] {
  return [...FABRICS].sort((a, b) => a.sortOrder - b.sortOrder);
}

function isMissingFabricsTableError(message: string): boolean {
  return message.includes("fabrics") || message.includes("schema cache");
}

async function getFabricsFromSupabase(): Promise<Fabric[]> {
  try {
    const supabase = createSupabaseStaticClient();

    const { data, error } = await supabase
      .from("fabrics")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      if (isMissingFabricsTableError(error.message)) {
        return getDefaultFabrics();
      }

      throw new Error(`Failed to fetch fabrics: ${error.message}`);
    }

    return mapFabricRows(data ?? []);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (isMissingFabricsTableError(message)) {
      return getDefaultFabrics();
    }

    throw error;
  }
}

async function getFabricBySlugFromSupabase(slug: string): Promise<Fabric | null> {
  try {
    const supabase = createSupabaseStaticClient();

    const { data, error } = await supabase
      .from("fabrics")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      if (isMissingFabricsTableError(error.message)) {
        return FABRICS.find((fabric) => fabric.slug === slug) ?? null;
      }

      throw new Error(`Failed to fetch fabric: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return mapFabricRow(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (isMissingFabricsTableError(message)) {
      return FABRICS.find((fabric) => fabric.slug === slug) ?? null;
    }

    throw error;
  }
}

export async function listFabrics(): Promise<Fabric[]> {
  if (getDataSource() !== "supabase" || !isSupabaseConfigured()) {
    return getDefaultFabrics();
  }

  return getFabricsFromSupabase();
}

export async function getFabricBySlugFromDb(
  slug: string,
): Promise<Fabric | null> {
  if (getDataSource() !== "supabase" || !isSupabaseConfigured()) {
    return FABRICS.find((fabric) => fabric.slug === slug) ?? null;
  }

  return getFabricBySlugFromSupabase(slug);
}

export async function listFabricOptions(): Promise<
  Array<{ slug: string; name: string }>
> {
  const fabrics = await listFabrics();
  return fabrics.map(({ slug, name }) => ({ slug, name }));
}
