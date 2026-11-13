import type { Metadata } from "next";
import Link from "next/link";
import { Concierge } from "@/components/concierge/Concierge";
import { isValidProductSlug } from "@/lib/products/defaults";
import { getProductBySlug } from "@/lib/products/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

const PAGE = {
  title: "サイズとゲージの相談",
  description:
    "身長と着方から、28G・36G・46Gのどのゲージを、どのシルエットとサイズで着るかをご案内します。",
} as const;

export const dynamic = "force-dynamic";

type ConciergePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: PAGE.title,
    description: PAGE.description,
    path: "/concierge",
  });
}

export default async function ConciergePage({ searchParams }: ConciergePageProps) {
  const { from } = await searchParams;
  const slug = Array.isArray(from) ? from[0] : from;
  // ?from=<slug> is set by the link on a product page.
  const product =
    slug && slug.length <= 80 && isValidProductSlug(slug)
      ? await getProductBySlug(slug)
      : null;

  return (
    <section className="bg-[var(--color-ground)] pb-[var(--space-6)] pt-[var(--space-5)] md:pb-[var(--space-7)] md:pt-[var(--space-6)]">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <div className="md:grid md:grid-cols-12">
          <header className="md:col-span-4">
            <p className="type-label !text-[var(--color-navy)]">Concierge</p>
            <h1 className="type-h2 mt-3">どのゲージを、どのサイズで。</h1>
            <p className="type-body mt-4 max-w-[30em] text-[var(--color-ink-soft)]">
              3つのゲージ、2つのシルエット、3つのサイズ。身長と着方から、18通りのうちの一枚をご案内します。
            </p>
            {product ? (
              <Link
                href={`/products/${product.slug}`}
                className="type-label mt-6 inline-flex min-h-11 items-center border-b border-[var(--color-ink)] !text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] hover:opacity-60"
              >
                <span aria-hidden className="font-en mr-2">
                  ←
                </span>
                {product.name} に戻る
              </Link>
            ) : null}
          </header>

          <div className="mt-[var(--space-4)] md:col-span-7 md:col-start-6 md:mt-0">
            <Concierge
              contextSlug={product?.slug ?? null}
              contextName={product?.name ?? null}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
