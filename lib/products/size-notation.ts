import type { ProductSize } from "@/types";

const SIZE_INDEX: Record<ProductSize, number> = {
  S: 1,
  M: 2,
  L: 3,
  XL: 4,
};

/** Graphpaper-style size label with numeric index helper, e.g. "M (2)". */
export function formatGraphpaperSizeLabel(size: ProductSize): string {
  return `${size} (${SIZE_INDEX[size]})`;
}

export function getSizeIndex(size: ProductSize): number {
  return SIZE_INDEX[size];
}
