import type { ProductSize, SizeGuideMeasurement } from "@/types";

export const DEFAULT_CARE =
  "MACHINE WASH COLD WITH LIKE COLORS. DO NOT BLEACH. TUMBLE DRY LOW. COOL IRON IF NEEDED.";

export const DEFAULT_MATERIAL = "COTTON 100%";

export const STANDARD_SIZE_GUIDE: SizeGuideMeasurement[] = [
  { size: "S", length: 68, shoulder: 44, chest: 52, sleeve: 20 },
  { size: "M", length: 70, shoulder: 46, chest: 54, sleeve: 21 },
  { size: "L", length: 72, shoulder: 48, chest: 56, sleeve: 22 },
  { size: "XL", length: 74, shoulder: 50, chest: 58, sleeve: 23 },
];

export const PRODUCT_SIZES: ProductSize[] = ["S", "M", "L", "XL"];

export function createDefaultSizeGuide(): SizeGuideMeasurement[] {
  return STANDARD_SIZE_GUIDE.map((row) => ({ ...row }));
}

export function createDefaultVariants(): Array<{
  size: ProductSize;
  sku: string | null;
  stockQuantity: number;
  enabled: boolean;
}> {
  return PRODUCT_SIZES.map((size) => ({
    size,
    sku: null,
    stockQuantity: 0,
    enabled: true,
  }));
}

export function parseSizeGuide(value: unknown): SizeGuideMeasurement[] {
  if (!Array.isArray(value)) {
    return createDefaultSizeGuide();
  }

  const parsed: SizeGuideMeasurement[] = [];

  for (const row of value) {
    if (
      typeof row === "object" &&
      row !== null &&
      "size" in row &&
      typeof row.size === "string" &&
      PRODUCT_SIZES.includes(row.size as ProductSize)
    ) {
      parsed.push({
        size: row.size as ProductSize,
        length: Number(row.length) || 0,
        shoulder: Number(row.shoulder) || 0,
        chest: Number(row.chest) || 0,
        sleeve: Number(row.sleeve) || 0,
      });
    }
  }

  return parsed.length > 0 ? parsed : createDefaultSizeGuide();
}

export function slugifyProductName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidProductSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
