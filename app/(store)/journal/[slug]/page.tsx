import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JournalArticleBody } from "@/components/journal/JournalArticleBody";
import { Container } from "@/components/layout/Container";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import {
  getJournalArticleBySlug,
  getJournalSlugs,
} from "@/lib/content/journal";
import { buildPageMetadata } from "@/lib/seo/metadata";

type JournalArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getJournalSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: JournalArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getJournalArticleBySlug(slug);

  if (!article) {
    return { title: "Not Found" };
  }

  return buildPageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/journal/${article.slug}`,
    image: article.heroImageUrl,
    type: "article",
  });
}

export default async function JournalArticlePage({
  params,
}: JournalArticlePageProps) {
  const { slug } = await params;
  const article = getJournalArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const { breadcrumbs: bc } = SITE_UI_COPY;

  return (
    <Container as="section" className="py-16 sm:py-20 md:py-28 lg:py-36">
      <div className="mx-auto max-w-4xl">
        <Breadcrumbs
          items={[
            { label: bc.home, href: "/" },
            { label: "Journal", href: "/journal" },
            { label: article.title },
          ]}
        />

        <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-[#f4f4f2] md:mt-14">
          <Image
            src={article.heroImageUrl}
            alt={article.heroImageAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 896px"
            className="object-cover brightness-[0.97] contrast-[0.98]"
          />
        </div>

        <div className="mt-12 md:mt-16">
          <JournalArticleBody article={article} />
        </div>

        <div className="mt-16 text-center md:mt-24">
          <Link
            href="/journal"
            className="text-[12px] font-light tracking-[0.08em] text-neutral-600 transition-opacity duration-300 hover:opacity-60"
          >
            All journal entries
          </Link>
        </div>
      </div>
    </Container>
  );
}
