import type { Metadata } from "next";
import Link from "next/link";
import { StoriesGrid } from "@/components/stories/StoriesGrid";
import { StoriesIntro } from "@/components/stories/StoriesIntro";
import { Container } from "@/components/layout/Container";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { getSiteContent } from "@/lib/content/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Stories",
  description: "Material, structure, air, and process — how WHITE TEE is made.",
  path: "/stories",
});

export default async function StoriesPage() {
  const stories = await getSiteContent("stories");
  const { fabric: copy } = SITE_UI_COPY;

  return (
    <Container as="section" className="py-16 sm:py-20 md:py-32 lg:py-40">
      <div className="mx-auto max-w-2xl">
        <StoriesIntro
          pageTitle={stories.pageTitle}
          introLines={stories.introLines}
        />
        <StoriesGrid stories={stories.entries} />

        <div className="mt-20 text-center md:mt-28">
          <Link
            href="/fabric"
            className="text-[11px] font-light tracking-[0.08em] text-neutral-400 transition-opacity duration-300 hover:opacity-60"
          >
            {copy.exploreFabric}
          </Link>
        </div>
      </div>
    </Container>
  );
}
