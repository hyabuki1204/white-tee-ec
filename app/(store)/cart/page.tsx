import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { CartPageContent } from "@/components/cart/CartPageContent";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { getFabrics } from "@/lib/fabric/queries";
import { getGraphpaperDisplayName } from "@/lib/products/display-name";
import { getProducts } from "@/lib/products/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

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
    <section aria-label="Shopping bag" className="py-12 sm:py-16 md:py-20 lg:py-24">
      <Container as="div">
        <header className="mb-10 border-b border-neutral-200/70 pb-6 sm:mb-12 md:mb-14">
          <h1 className="text-[14px] font-normal tracking-[0.28em] text-neutral-800">
            {copy.title}
          </h1>
        </header>

        <CartPageContent
          productLookup={productLookup}
          allProducts={products}
          fabricNameBySlug={fabricNameBySlug}
        />

        <p className="mt-12 text-center md:mt-16">
          <Link
            href="/store-guide"
            className="text-[12px] font-normal tracking-[0.06em] text-neutral-600 transition-opacity duration-[var(--duration-fast)] hover:opacity-60"
          >
            {GRAPHPAPER_STORE_COPY.footer.storeGuide}
          </Link>
        </p>
      </Container>
    </section>
  );
}
