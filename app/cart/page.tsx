import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { CartPageContent } from "@/components/cart/CartPageContent";
import { getProducts } from "@/lib/products/queries";

export const metadata: Metadata = {
  title: "Cart | WHITE TEE",
  description: "Your shopping cart",
};

export default async function CartPage() {
  const products = await getProducts();
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
    <Container as="section" className="py-16 md:py-24 lg:py-28">
      <header className="mb-12 md:mb-16">
        <p className="text-xs tracking-[0.3em] text-neutral-500">Cart</p>
      </header>

      <CartPageContent productLookup={productLookup} />
    </Container>
  );
}
