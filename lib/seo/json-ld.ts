import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/seo/site";
import { absoluteUrl, resolveImageUrl } from "@/lib/seo/metadata";
import type { Product } from "@/types";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: SITE_DESCRIPTION,
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildProductSchema(product: Product) {
  const url = absoluteUrl(`/products/${product.slug}`);
  const inStock = product.variants.some(
    (variant) => variant.stockQuantity > 0,
  );

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: resolveImageUrl(product.imageUrl),
    url,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "JPY",
      price: product.price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}
