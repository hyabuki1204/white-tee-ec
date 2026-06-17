import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JournalGrid } from "@/components/journal/JournalGrid";
import { JournalIntro } from "@/components/journal/JournalIntro";
import { Container } from "@/components/layout/Container";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { JOURNAL_ARTICLES } from "@/lib/content/journal";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Journal",
  description:
    "Notes from the atelier — knitting, fabric, and the quiet work behind WHITE TEE.",
  path: "/journal",
});

export default function JournalPage() {
  const sortedArticles = [...JOURNAL_ARTICLES].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  const { breadcrumbs: bc } = SITE_UI_COPY;
  const { fabric: copy } = SITE_UI_COPY;

  return (
    <Container as="section" className="py-16 sm:py-20 md:py-28 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs
          items={[
            { label: bc.home, href: "/" },
            { label: "Journal" },
          ]}
        />
        <div className="mt-12 md:mt-16">
          <JournalIntro />
        </div>
        <div className="mt-16 md:mt-24">
          <JournalGrid articles={sortedArticles} />
        </div>

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
