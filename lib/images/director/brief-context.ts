import "server-only";

import { getFabricBySlug } from "@/lib/fabric/queries";
import type { BrandContextInput } from "@/lib/images/director/context";
import { getProductForAdmin } from "@/lib/products/mutations";
import type { AdminImageBriefDetail } from "@/types/admin-image";

/**
 * Gather the live catalogue rows a brief points at.
 *
 * The director prompt is built from real fabric and product data rather
 * than prose typed into the brief, so the direction Claude works from stays
 * in step with the catalogue. A brief that names neither still works — it
 * just gets the brand block without the garment specifics.
 *
 * Missing rows are treated as absent rather than fatal: a fabric can be
 * renamed or unpublished between writing a brief and rendering it, and
 * losing the extra context is a far better outcome than refusing to
 * generate.
 */
export async function buildBriefContext(
  brief: AdminImageBriefDetail,
): Promise<BrandContextInput> {
  const [fabric, product] = await Promise.all([
    brief.fabricSlug ? getFabricBySlug(brief.fabricSlug) : null,
    brief.productId ? getProductForAdmin(brief.productId) : null,
  ]);

  return {
    fabric,
    product: product
      ? {
          name: product.name,
          material: product.material,
          fitType: product.fitProfile.fitType,
          sleeveType: product.sleeveType,
          fitNote: product.fitNote,
        }
      : null,
  };
}
