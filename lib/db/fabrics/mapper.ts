import type { FabricRow } from "@/types/database";
import { attachFabricJaHelpers } from "@/lib/fabric/i18n";
import { parseFabricCharacterFromRow } from "@/lib/fabric/character";
import type { Fabric } from "@/lib/fabric/content";

export function mapFabricRow(row: FabricRow): Fabric {
  const descriptionLines = Array.isArray(row.description_lines)
    ? row.description_lines.filter(
        (line): line is string => typeof line === "string",
      )
    : [];

  return attachFabricJaHelpers({
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    descriptionLines,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    sortOrder: row.sort_order,
    character: parseFabricCharacterFromRow(row.slug, row),
  });
}

export function mapFabricRows(rows: FabricRow[]): Fabric[] {
  return rows.map(mapFabricRow).sort((a, b) => a.sortOrder - b.sortOrder);
}
