import type { Metadata } from "next";
import { FabricGrid } from "@/components/fabric/FabricGrid";
import { FabricIntro } from "@/components/fabric/FabricIntro";
import { Container } from "@/components/layout/Container";
import { getFabrics } from "@/lib/fabric/queries";

export const metadata: Metadata = {
  title: "Fabric | WHITE TEE",
  description:
    "Cotton jersey we knit ourselves — weight, hand, and how quietly white holds light.",
};

export default async function FabricPage() {
  const fabrics = await getFabrics();

  return (
    <Container as="section" className="py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-5xl">
        <FabricIntro />
        <div className="mt-24 md:mt-32 lg:mt-40">
          <FabricGrid fabrics={fabrics} />
        </div>
      </div>
    </Container>
  );
}
