import {
  buildProductsFilterHref,
  FIT_TYPE_LABELS,
  FIT_TYPES,
  SLEEVE_TYPE_LABELS,
  SLEEVE_TYPES,
} from "@/lib/products/silhouette";
import type { Fabric } from "@/lib/fabric/content";
import type { FitType, SleeveType } from "@/types/product-fit";
import type { Product } from "@/types";

export type StoreNavLink = {
  label: string;
  href: string;
};

export type StoreNavGroup = {
  label: string;
  href?: string;
  links: StoreNavLink[];
};

export type StoreNavMenu = {
  fabric: {
    href: string;
    allLabel: string;
    links: StoreNavLink[];
  };
  products: {
    href: string;
    allLabel: string;
    groups: StoreNavGroup[];
  };
};

function uniqueFitTypesForSleeve(
  products: Product[],
  sleeve: SleeveType,
): FitType[] {
  const fits = new Set<FitType>();

  for (const product of products) {
    if (product.sleeveType === sleeve) {
      fits.add(product.fitType);
    }
  }

  return FIT_TYPES.filter((fit) => fits.has(fit));
}

export function buildStoreNavMenu(
  fabrics: Fabric[],
  products: Product[],
): StoreNavMenu {
  const fabricLinks = fabrics.map((fabric) => ({
    label: fabric.name,
    href: `/fabric/${fabric.slug}`,
  }));

  const productGroups: StoreNavGroup[] = SLEEVE_TYPES.map((sleeve) => {
    const fits = uniqueFitTypesForSleeve(products, sleeve);

    return {
      label: SLEEVE_TYPE_LABELS[sleeve],
      href: buildProductsFilterHref({ sleeve }),
      links: fits.map((fit) => ({
        label: FIT_TYPE_LABELS[fit],
        href: buildProductsFilterHref({ sleeve, fit }),
      })),
    };
  }).filter((group) => group.links.length > 0);

  return {
    fabric: {
      href: "/fabric",
      allLabel: "All fabrics",
      links: fabricLinks,
    },
    products: {
      href: "/products",
      allLabel: "All pieces",
      groups: productGroups,
    },
  };
}
