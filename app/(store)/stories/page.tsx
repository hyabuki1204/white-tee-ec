import type { Metadata } from "next";
import { StoriesGrid } from "@/components/stories/StoriesGrid";
import { StoriesIntro } from "@/components/stories/StoriesIntro";
import { Container } from "@/components/layout/Container";
import { getSiteContent } from "@/lib/content/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Stories",
  description: "Material, structure, air, and process — how WHITE TEE is made.",
  path: "/stories",
});

export default async function StoriesPage() {
  const stories = await getSiteContent("stories");

  return (
    <Container as="section" className="py-16 sm:py-20 md:py-32 lg:py-40">
      <div className="mx-auto max-w-2xl">
        <StoriesIntro
          pageTitle={stories.pageTitle}
          introLines={stories.introLines}
        />
        <StoriesGrid stories={stories.entries} />
      </div>
    </Container>
  );
}
