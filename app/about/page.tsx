import type { Metadata } from "next";
import { AboutContent } from "@/components/about/AboutContent";
import { Container } from "@/components/layout/Container";
import { getSiteContent } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "About | WHITE TEE",
  description: "WHITE TEE — white T-shirts, quietly refined.",
};

export default async function AboutPage() {
  const about = await getSiteContent("about");

  return (
    <Container as="section" className="py-24 md:py-32 lg:py-40">
      <AboutContent
        headline={about.headline}
        bodyParagraphs={about.bodyParagraphs}
      />
    </Container>
  );
}
