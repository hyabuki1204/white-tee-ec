import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { CartPageContent } from "@/components/cart/CartPageContent";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { getFabrics } from "@/lib/fabric/queries";
import { getProducts } from "@/lib/products/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

const { cart: copy } = SITE_UI_COPY;

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
    products.map((product) => [
      product.id,
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        variants: Object.fromEntries(
          product.variants.map((variant) => [
            variant.size,
            { stockQuantity: variant.stockQuantity },
          ]),
        ),
      },
    ]),
  );

  return (
    <Container as="section" className="py-12 sm:py-16 md:py-24 lg:py-28">
      <header className="mb-10 sm:mb-12 md:mb-16">
        <p className="text-[13px] tracking-[0.24em] text-neutral-600 md:text-xs md:tracking-[0.3em] md:text-neutral-500">
          {copy.title}
        </p>
      </header>

      <CartPageContent
        productLookup={productLookup}
        allProducts={products}
        fabricNameBySlug={fabricNameBySlug}
      />

      <p className="mt-12 text-center md:mt-16">
        <Link
          href="/shipping"
          className="text-[11px] font-light tracking-[0.06em] text-neutral-400 transition-opacity duration-300 hover:opacity-60"
        >
          Shipping & Returns
        </Link>
      </p>
    </Container>
  );
}
