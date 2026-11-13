import { getGaugeSpec, type GaugeSpec } from "@/lib/fabric/gauge";
import { SIZE_ORDER } from "@/lib/products/fit-profiles";
import { LOW_STOCK_THRESHOLD } from "@/lib/concierge/limits";
import type {
  ConciergeCard,
  ConciergeStockState,
} from "@/lib/concierge/types";
import type { Product, ProductSize, SizeGuideMeasurement } from "@/types";

/**
 * The concierge's view of the catalog: published products joined with their
 * gauge spec, in a stable order. Built per request from the same product
 * query the storefront uses, so stock is as live as the product page's.
 */
export type CatalogEntry = {
  product: Product;
  spec: GaugeSpec | null;
  silhouette: "Regular" | "Box";
  /** Sizes this product is sold in, smallest first. */
  sizes: ProductSize[];
};

export type ConciergeCatalog = {
  entries: CatalogEntry[];
  bySlug: Map<string, CatalogEntry>;
};

export type CatalogPick = {
  slug: string;
  size: ProductSize | null;
};

const MAX_AVAILABLE_SHOWN = 10;

export function buildCatalog(products: Product[]): ConciergeCatalog {
  const entries = products
    .filter((product) => product.isPublished && product.variants.length > 0)
    .map<CatalogEntry>((product) => ({
      product,
      spec: getGaugeSpec(product.fabricSlug),
      silhouette: product.fitType === "boxy" ? "Box" : "Regular",
      sizes: SIZE_ORDER.filter((size) =>
        product.variants.some((variant) => variant.size === size),
      ),
    }))
    // Deterministic order: the prompt built from this must be byte-stable
    // between requests or the prompt cache never hits.
    .sort(
      (a, b) =>
        (a.spec?.gauge ?? 999) - (b.spec?.gauge ?? 999) ||
        Number(a.silhouette === "Box") - Number(b.silhouette === "Box") ||
        a.product.slug.localeCompare(b.product.slug),
    );

  return {
    entries,
    bySlug: new Map(entries.map((entry) => [entry.product.slug, entry])),
  };
}

export function stockOf(entry: CatalogEntry, size: ProductSize): number {
  return Math.max(
    0,
    entry.product.variants.find((variant) => variant.size === size)
      ?.stockQuantity ?? 0,
  );
}

export function hasAnyStock(entry: CatalogEntry): boolean {
  return entry.sizes.some((size) => stockOf(entry, size) > 0);
}

export function measurementOf(
  entry: CatalogEntry,
  size: ProductSize,
): SizeGuideMeasurement | undefined {
  return entry.product.sizeGuide.find((row) => row.size === size);
}

export function findEntry(
  catalog: ConciergeCatalog,
  gauge: number,
  silhouette: "Regular" | "Box",
): CatalogEntry | undefined {
  return catalog.entries.find(
    (entry) => entry.spec?.gauge === gauge && entry.silhouette === silhouette,
  );
}

/** Same gauge, other silhouette. */
export function siblingOf(
  catalog: ConciergeCatalog,
  entry: CatalogEntry,
): CatalogEntry | undefined {
  return catalog.entries.find(
    (other) =>
      other !== entry &&
      other.spec?.gauge === entry.spec?.gauge &&
      other.silhouette !== entry.silhouette,
  );
}

/** Same silhouette, other gauges, closest gauge first. */
export function gaugeNeighboursOf(
  catalog: ConciergeCatalog,
  entry: CatalogEntry,
): CatalogEntry[] {
  const gauge = entry.spec?.gauge ?? 0;

  return catalog.entries
    .filter(
      (other) =>
        other !== entry &&
        other.silhouette === entry.silhouette &&
        other.spec !== null &&
        other.spec.gauge !== gauge,
    )
    .sort(
      (a, b) =>
        Math.abs((a.spec?.gauge ?? 0) - gauge) -
        Math.abs((b.spec?.gauge ?? 0) - gauge),
    );
}

export type StockNote =
  | { kind: "size_swapped"; slug: string; from: ProductSize; to: ProductSize }
  | {
      kind: "product_swapped";
      fromSlug: string;
      toSlug: string;
      size: ProductSize | null;
    }
  | { kind: "unavailable"; slug: string; size: ProductSize | null };

export type StockResolution = {
  pick: CatalogPick;
  note: StockNote | null;
};

/**
 * Turn a wanted product + size into one that can actually be bought.
 *
 * Order of preference when the wanted size is sold out: the adjacent size of
 * the same product (keeps gauge and silhouette), then the same size in the
 * other silhouette, then the same size in the nearest gauge, then any size
 * of the same product. If nothing qualifies the pick is returned unchanged
 * with an "unavailable" note so the reply can say so.
 */
export function resolveStock(
  catalog: ConciergeCatalog,
  pick: CatalogPick,
): StockResolution {
  const entry = catalog.bySlug.get(pick.slug);
  if (!entry) return { pick, note: null };

  const { size } = pick;

  if (size === null) {
    if (hasAnyStock(entry)) return { pick, note: null };

    const other = [siblingOf(catalog, entry), ...gaugeNeighboursOf(catalog, entry)]
      .filter((candidate): candidate is CatalogEntry => Boolean(candidate))
      .find(hasAnyStock);

    return other
      ? {
          pick: { slug: other.product.slug, size: null },
          note: {
            kind: "product_swapped",
            fromSlug: pick.slug,
            toSlug: other.product.slug,
            size: null,
          },
        }
      : { pick, note: { kind: "unavailable", slug: pick.slug, size: null } };
  }

  if (stockOf(entry, size) > 0) return { pick, note: null };

  const index = entry.sizes.indexOf(size);
  // Larger first on a tie: a tee one size up is wearable, one size down may not be.
  const adjacent = [entry.sizes[index + 1], entry.sizes[index - 1]].find(
    (candidate) => candidate !== undefined && stockOf(entry, candidate) > 0,
  );

  if (index !== -1 && adjacent) {
    return {
      pick: { slug: pick.slug, size: adjacent },
      note: { kind: "size_swapped", slug: pick.slug, from: size, to: adjacent },
    };
  }

  const other = [siblingOf(catalog, entry), ...gaugeNeighboursOf(catalog, entry)]
    .filter((candidate): candidate is CatalogEntry => Boolean(candidate))
    .find((candidate) => stockOf(candidate, size) > 0);

  if (other) {
    return {
      pick: { slug: other.product.slug, size },
      note: {
        kind: "product_swapped",
        fromSlug: pick.slug,
        toSlug: other.product.slug,
        size,
      },
    };
  }

  const anySize = entry.sizes.find((candidate) => stockOf(entry, candidate) > 0);

  if (anySize) {
    return {
      pick: { slug: pick.slug, size: anySize },
      note: { kind: "size_swapped", slug: pick.slug, from: size, to: anySize },
    };
  }

  return { pick, note: { kind: "unavailable", slug: pick.slug, size } };
}

function stockState(entry: CatalogEntry, size: ProductSize | null): {
  stock: ConciergeStockState;
  available: number;
} {
  if (size === null) return { stock: "unknown", available: 0 };

  const quantity = stockOf(entry, size);
  if (quantity < 1) return { stock: "out", available: 0 };

  return {
    stock: quantity <= LOW_STOCK_THRESHOLD ? "low" : "in_stock",
    available: Math.min(quantity, MAX_AVAILABLE_SHOWN),
  };
}

export function productHref(slug: string, size: ProductSize | null): string {
  const path = `/products/${encodeURIComponent(slug)}`;
  return size ? `${path}?size=${size}` : path;
}

export function toCard(
  entry: CatalogEntry,
  size: ProductSize | null,
  reason: string,
): ConciergeCard {
  const { product } = entry;
  const primaryImage =
    product.images.find((image) => image.isPrimary)?.url ?? product.imageUrl;

  return {
    productId: product.id,
    productSlug: product.slug,
    name: product.name,
    gauge: entry.spec?.gauge ?? null,
    silhouette: entry.silhouette,
    size,
    price: product.price,
    imageUrl: primaryImage,
    ...stockState(entry, size),
    href: productHref(product.slug, size),
    reason,
  };
}
