import { getGaugeNumber } from "@/lib/fabric/gauge";
import {
  buildProductsFilterHref,
  FIT_TYPE_LABELS,
  STOREFRONT_FIT_TYPES,
} from "@/lib/products/silhouette";
import type { Fabric } from "@/lib/fabric/content";
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

/** "28G" for gauge fabrics, otherwise the fabric name. */
export function getGaugeLabel(fabric: Pick<Fabric, "slug" | "name">): string {
  const gauge = getGaugeNumber(fabric.slug);
  return gauge ? `${gauge}G` : fabric.name;
}

export function buildStoreNavMenu(
  fabrics: Fabric[],
  products: Product[],
): StoreNavMenu {
  const fabricLinks = fabrics.map((fabric) => ({
    label: fabric.name,
    href: `/fabric/${fabric.slug}`,
  }));

  const gaugeLinks = fabrics
    .filter((fabric) =>
      products.some((product) => product.fabricSlug === fabric.slug),
    )
    .map((fabric) => ({
      label: getGaugeLabel(fabric),
      href: buildProductsFilterHref({ fabric: fabric.slug }),
    }));

  const silhouetteLinks = STOREFRONT_FIT_TYPES.filter((fit) =>
    products.some((product) => product.fitType === fit),
  ).map((fit) => ({
    label: FIT_TYPE_LABELS[fit],
    href: buildProductsFilterHref({ fit }),
  }));

  const productGroups: StoreNavGroup[] = [
    { label: "Gauge", links: gaugeLinks },
    { label: "Silhouette", links: silhouetteLinks },
  ].filter((group) => group.links.length > 0);

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
