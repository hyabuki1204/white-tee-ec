import type { Locale } from "@/lib/i18n/config";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/site";
import { localizedUrl, resolveImageUrl } from "@/lib/seo/metadata";
import type { Product } from "@/types";

export type BreadcrumbItem = {
  name: string;
  /** Locale-free path. */
  path: string;
};

export function buildOrganizationSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: localizedUrl("/", locale),
    description: SITE_DESCRIPTION,
  };
}

/** WebSite node carrying the language of this storefront rendering. */
export function buildWebSiteSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: localizedUrl("/", locale),
    inLanguage: locale,
  };
}

export function buildBreadcrumbSchema(
  items: BreadcrumbItem[],
  locale: Locale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    inLanguage: locale,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: localizedUrl(item.path, locale),
    })),
  };
}

export function buildProductSchema(
  product: Product,
  locale: Locale,
) {
  const url = localizedUrl(`/products/${product.slug}`, locale);
  const inStock = product.variants.some(
    (variant) => variant.stockQuantity > 0,
  );

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    inLanguage: locale,
    image: resolveImageUrl(product.imageUrl),
    url,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url,
      // Always charged in yen, whatever the page language.
      priceCurrency: "JPY",
      price: product.price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      eligibleRegion: { "@type": "Country", name: "JP" },
    },
  };
}
