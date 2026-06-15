import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { FabricGrid } from "@/components/fabric/FabricGrid";
import { FabricIntro } from "@/components/fabric/FabricIntro";
import { Container } from "@/components/layout/Container";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { getFabrics } from "@/lib/fabric/queries";
import { getProducts } from "@/lib/products/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Fabric",
  description:
    "Cotton jersey we knit ourselves — weight, hand, and how quietly white holds light.",
  path: "/fabric",
});

export default async function FabricPage() {
  const [fabrics, products] = await Promise.all([
    getFabrics(),
    getProducts(),
  ]);

  const productCountBySlug = products.reduce<Record<string, number>>(
    (counts, product) => {
      if (product.fabricSlug) {
        counts[product.fabricSlug] = (counts[product.fabricSlug] ?? 0) + 1;
      }
      return counts;
    },
    {},
  );

  const { breadcrumbs: bc } = SITE_UI_COPY;

  return (
    <Container as="section" className="py-16 sm:py-20 md:py-28 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs
          items={[
            { label: bc.home, href: "/" },
            { label: bc.fabric },
          ]}
        />
        <FabricIntro />
        <div className="mt-28 md:mt-36 lg:mt-44">
          <FabricGrid
            fabrics={fabrics}
            productCountBySlug={productCountBySlug}
          />
        </div>
      </div>
    </Container>
  );
}
