import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { CartPageContent } from "@/components/cart/CartPageContent";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { getFabrics } from "@/lib/fabric/queries";
import { getGraphpaperDisplayName } from "@/lib/products/display-name";
import { getProducts } from "@/lib/products/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { pageGutterClass } from "@/lib/store-ui/ui-classes";

const { cart: copy } = GRAPHPAPER_STORE_COPY;

export const metadata: Metadata = buildPageMetadata({
  title: copy.title,
  description: copy.title,
  path: "/cart",
  noIndex: true,
});

export default async function CartPage() {
  const [products, fabrics] = await Promise.all([getProducts(), getFabrics()]);
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
      <PageHeader label="Cart" title={copy.title} lead={copy.lead} />
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
