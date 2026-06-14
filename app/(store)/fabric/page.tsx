import type { Metadata } from "next";
import { FabricGrid } from "@/components/fabric/FabricGrid";
import { FabricIntro } from "@/components/fabric/FabricIntro";
import { Container } from "@/components/layout/Container";
import { getFabrics } from "@/lib/fabric/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Fabric",
  description:
    "Cotton jersey we knit ourselves — weight, hand, and how quietly white holds light.",
  path: "/fabric",
});

export default async function FabricPage() {
  const fabrics = await getFabrics();

  return (
    <Container as="section" className="py-16 sm:py-20 md:py-28 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <FabricIntro />
        <div className="mt-28 md:mt-36 lg:mt-44">
          <FabricGrid fabrics={fabrics} />
        </div>
      </div>
    </Container>
  );
}
