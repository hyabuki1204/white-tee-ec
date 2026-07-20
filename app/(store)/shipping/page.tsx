import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { getShippingContent } from "@/lib/legal/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "配送・返品",
    description: "配送・返品について",
    path: "/shipping",
  });
}

export default async function ShippingPage() {
  const shipping = await getShippingContent();

  return (
    <Container as="section" className="py-20 sm:py-24 md:py-32 lg:py-36">
      <div className="mx-auto max-w-2xl">
        <header className="text-center">
          <p className="text-[11px] font-normal tracking-[0.16em] text-neutral-600">
            <Link href="/store-guide" className="transition-opacity hover:opacity-60">
              ご利用ガイド
            </Link>
          </p>
          <h1 className="mt-4 text-[14px] font-normal tracking-[0.28em] text-neutral-800 md:text-[14px]">
            {shipping.pageTitle}
          </h1>
        </header>
        <div className="mt-16 space-y-10 md:mt-20">
          {shipping.sections.map((section) => (
            <section key={section.title} className="space-y-3">
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
