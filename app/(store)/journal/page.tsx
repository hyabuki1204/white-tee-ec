import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JournalGrid } from "@/components/journal/JournalGrid";
import { JournalIntro } from "@/components/journal/JournalIntro";
import { Container } from "@/components/layout/Container";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { getJournalArticles, getJournalPageContent } from "@/lib/content/journal";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getJournalPageContent();

  return buildPageMetadata({
    title: content.pageTitle,
    description: content.introLines.join(" "),
    path: "/journal",
  });
}

export default async function JournalPage() {
  const [content, articles] = await Promise.all([
    getJournalPageContent(),
    getJournalArticles(),
  ]);
  const sortedArticles = [...articles].sort(
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
            { label: content.pageTitle },
          ]}
        />
        <div className="mt-12 md:mt-16">
          <JournalIntro
            pageTitle={content.pageTitle}
            introLines={content.introLines}
          />
        </div>
        <div className="mt-16 md:mt-24">
          <JournalGrid articles={sortedArticles} />
        </div>

        <div className="mt-20 text-center md:mt-28">
          <Link
            href="/fabric"
            className="text-[12px] font-normal tracking-[0.08em] text-neutral-600 transition-opacity duration-[var(--duration-fast)] hover:opacity-60"
          >
            {copy.exploreFabric}
          </Link>
        </div>
      </div>
    </Container>
  );
}
