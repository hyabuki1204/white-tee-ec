import type { Metadata } from "next";
import { AboutContent } from "@/components/about/AboutContent";
import { getSiteContent } from "@/lib/content/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Mill",
  description: "和歌山で1964年から編み続けてきた工場が作る、白いTシャツ。糸、ゲージ、人の手。",
  path: "/about",
  image: "/mill/needle.jpg",
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
