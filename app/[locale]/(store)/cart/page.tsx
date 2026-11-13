import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { CartPageContent } from "@/components/cart/CartPageContent";
import { getStoreCopy } from "@/lib/store-ui/graphpaper-copy";
import { localizeProducts } from "@/lib/i18n/content-en";
import {
  localeStaticParams,
  resolveLocale,
  type LocaleParams,
} from "@/lib/i18n/server";
import { getFabrics } from "@/lib/fabric/queries";
import { getGraphpaperDisplayName } from "@/lib/products/display-name";
import { getProducts } from "@/lib/products/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { pageGutterClass } from "@/lib/store-ui/ui-classes";

type CartPageProps = {
  params: Promise<LocaleParams>;
};

export function generateStaticParams() {
  return localeStaticParams();
}

export async function generateMetadata({
  params,
}: CartPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { cart: copy } = getStoreCopy(locale);

  return buildPageMetadata({
    title: copy.title,
    description: copy.title,
    path: "/cart",
    locale,
    noIndex: true,
  });
}

export default async function CartPage({ params }: CartPageProps) {
  const locale = await resolveLocale(params);
  const { cart: copy } = getStoreCopy(locale);
  const [storedProducts, fabrics] = await Promise.all([
    getProducts(),
    getFabrics(locale),
  ]);
  const products = localizeProducts(storedProducts, locale);
  const fabricNameBySlug = Object.fromEntries(
    fabrics.map((fabric) => [fabric.slug, fabric.name]),
  );
  const productLookup = Object.fromEntries(
    products.map((product) => {
      const fabricName = product.fabricSlug
        ? fabricNameBySlug[product.fabricSlug]
        : null;

      return [
        product.id,
        {
          id: product.id,
          slug: product.slug,
          name: getGraphpaperDisplayName(product, fabricName),
          price: product.price,
          imageUrl: product.imageUrl,
          variants: Object.fromEntries(
            product.variants.map((variant) => [
              variant.size,
              { stockQuantity: variant.stockQuantity },
            ]),
          ),
        },
      ];
    }),
  );

  return (
    <>
      <PageHeader label={copy.label} title={copy.title} lead={copy.lead} />
      <section
        aria-label={copy.title}
        className={`${pageGutterClass} py-[var(--space-4)] md:py-[var(--space-5)]`}
      >
        <CartPageContent
          productLookup={productLookup}
          allProducts={products}
          fabricNameBySlug={fabricNameBySlug}
        />
      </section>
    </>
  );
}
