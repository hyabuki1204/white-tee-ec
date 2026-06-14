import type { Metadata } from "next";
import { AboutContent } from "@/components/about/AboutContent";
import { Container } from "@/components/layout/Container";
import { getSiteContent } from "@/lib/content/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "About",
  description: "WHITE TEE — white T-shirts, quietly refined.",
  path: "/about",
});

export default async function AboutPage() {
  const about = await getSiteContent("about");

  return (
    <Container as="section" className="py-16 sm:py-20 md:py-32 lg:py-40">
      <AboutContent
        headline={about.headline}
        bodyParagraphs={about.bodyParagraphs}
      />
    </Container>
  );
}
