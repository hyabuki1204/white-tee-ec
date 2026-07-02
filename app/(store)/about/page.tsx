import type { Metadata } from "next";
import { AboutContent } from "@/components/about/AboutContent";
import { getSiteContent } from "@/lib/content/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "About",
  description: "WHITE TEE — white T-shirts, quietly refined.",
  path: "/about",
  image: "/store/about/about-hero.jpg",
});

export default async function AboutPage() {
  const about = await getSiteContent("about");

  return (
    <section aria-label="About WHITE TEE">
      <AboutContent
        headline={about.headline}
        headlineJa={about.headlineJa}
        bodyParagraphs={about.bodyParagraphs}
        bodyParagraphsJa={about.bodyParagraphsJa}
        helperJa={about.helperJa}
      />
    </section>
  );
}
