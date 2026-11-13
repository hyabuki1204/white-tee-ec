import type { Metadata } from "next";
import { AboutContent } from "@/components/about/AboutContent";
import { getSiteContent } from "@/lib/content/queries";
import { ABOUT_EN } from "@/lib/i18n/content-en";
import { defineCopy } from "@/lib/i18n/define-copy";
import {
  localeStaticParams,
  resolveLocale,
  type LocaleParams,
} from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo/metadata";

const getMeta = defineCopy(
  {
    description:
      "和歌山で1964年から編み続けてきた工場が作る、白いTシャツ。糸、ゲージ、人の手。",
    sectionLabel: "About WHITE TEE",
  },
  {
    description:
      "White T-shirts from a mill that has been knitting in Wakayama since 1964. Yarn, gauge, and the people at the machines.",
    sectionLabel: "About WHITE TEE",
  },
);

type AboutPageProps = {
  params: Promise<LocaleParams>;
};

export function generateStaticParams() {
  return localeStaticParams();
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);

  return buildPageMetadata({
    title: "Mill",
    description: getMeta(locale).description,
    path: "/about",
    locale,
    image: "/mill/needle.jpg",
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const locale = await resolveLocale(params);
  const about = await getSiteContent("about");

  return (
    <section aria-label={getMeta(locale).sectionLabel}>
      {locale === "en" ? (
        // The stored about content has no English version of the closing
        // statement that matches the Japanese; English is static.
        <AboutContent
          locale={locale}
          headline={ABOUT_EN.headline}
          paragraphs={ABOUT_EN.bodyParagraphs}
          helper={ABOUT_EN.helperJa}
        />
      ) : (
        <AboutContent
          locale={locale}
          headline={about.headlineJa}
          paragraphs={about.bodyParagraphsJa ?? []}
          helper={about.helperJa}
        />
      )}
    </section>
  );
}
