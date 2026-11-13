import type { Product } from "@/types";

/** On-model shot is the third image of every product: `<slug>-03.jpg`. */
const MODEL_IMAGE_PATTERN = /-03\.(jpg|jpeg|webp|png|avif)$/i;

/** Card hover image for product listing (admin-selected, else the on-model shot). */
export function getProductWearImageUrl(product: Product): string | null {
  const hoverFromFlag = product.images.find((image) => image.isCardHover);

  if (hoverFromFlag?.url && hoverFromFlag.url !== product.imageUrl) {
    return hoverFromFlag.url;
  }

  const sorted = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);

  const fromGallery =
    sorted.find((image) => MODEL_IMAGE_PATTERN.test(image.url))?.url ??
    sorted.find((image) => image.sortOrder === 2)?.url ??
    null;

  // No gallery rows at all (bare catalog entry): fall back to the naming convention.
  const candidate =
    fromGallery ??
    (sorted.length === 0 ? `/products/${product.slug}-03.jpg` : null);

  if (!candidate || candidate === product.imageUrl) {
    return null;
  }

  return candidate;
}
