import type { Metadata } from "next";
import { StoriesGrid } from "@/components/stories/StoriesGrid";
import { StoriesIntro } from "@/components/stories/StoriesIntro";
import { Container } from "@/components/layout/Container";
import { getSiteContent } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Stories | WHITE TEE",
  description: "Material, structure, air, and process — how WHITE TEE is made.",
};

export default async function StoriesPage() {
  const stories = await getSiteContent("stories");

  return (
    <Container as="section" className="py-24 md:py-32 lg:py-40">
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
