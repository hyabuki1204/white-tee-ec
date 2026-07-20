import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { getShippingContent } from "@/lib/legal/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  STORE_GUIDE_PAGE,
  STORE_GUIDE_SECTIONS,
} from "@/lib/store-ui/store-guide";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: STORE_GUIDE_PAGE.title,
    description: STORE_GUIDE_PAGE.intro,
    path: "/store-guide",
  });
}

export default async function StoreGuidePage() {
  const shipping = await getShippingContent();

  return (
    <Container as="section" className="py-20 sm:py-24 md:py-32 lg:py-36">
      <div className="mx-auto max-w-2xl">
        <header className="text-center">
          <h1 className="text-[14px] font-normal tracking-[0.28em] text-neutral-800 md:text-[14px]">
            {STORE_GUIDE_PAGE.title}
          </h1>
          <p className="mx-auto mt-6 max-w-md text-[14px] font-normal leading-[1.95] tracking-[0.02em] text-neutral-600 md:mt-8 md:text-[14px] md:leading-[2.1] md:tracking-[0.03em] md:text-neutral-600">
            {STORE_GUIDE_PAGE.intro}
          </p>
        </header>

        <div className="mt-16 space-y-12 md:mt-20">
          {STORE_GUIDE_SECTIONS.map((section) => (
            <section key={section.id} className="space-y-3">
              <h2 className="type-label text-neutral-600">
                {section.title}
              </h2>
              <p className="text-[14px] font-normal leading-[2] tracking-[0.03em] text-neutral-600">
                {section.summary}
              </p>
              {section.href && section.linkLabel ? (
                <Link
                  href={section.href}
                  className="inline-block text-[12px] font-normal tracking-[0.06em] text-neutral-600 transition-opacity hover:opacity-60"
                >
                  {section.linkLabel}
                </Link>
              ) : null}
            </section>
          ))}

          {shipping.sections.map((section) => (
            <section key={section.title} className="space-y-3 border-t border-neutral-200/60 pt-10">
              <h2 className="type-label text-neutral-600">
                {section.title}
              </h2>
              <p className="text-[14px] font-normal leading-[2] tracking-[0.03em] text-neutral-600">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}
