import type { Product } from "@/types";

const MODEL_IMAGE_PATTERN = /-0[45]\.(jpg|jpeg|webp|png|svg)$/i;

/** Card hover image for product listing (admin-selected or legacy fallback). */
export function getProductWearImageUrl(product: Product): string | null {
  const hoverFromFlag = product.images.find((image) => image.isCardHover);

  if (hoverFromFlag?.url && hoverFromFlag.url !== product.imageUrl) {
    return hoverFromFlag.url;
  }

  const sorted = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);

  const fromGallery =
    sorted.find(
      (image) =>
        image.sortOrder >= 3 || MODEL_IMAGE_PATTERN.test(image.url),
    )?.url ?? null;

  const candidate = fromGallery ?? `/products/${product.slug}-04.jpg`;

  if (!candidate || candidate === product.imageUrl) {
    return null;
  }

  return candidate;
}
