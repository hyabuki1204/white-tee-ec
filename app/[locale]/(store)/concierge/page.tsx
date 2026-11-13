import type { Metadata } from "next";
import { Link } from "@/components/i18n/Link";
import { Concierge } from "@/components/concierge/Concierge";
import { isValidProductSlug } from "@/lib/products/defaults";
import { getProductBySlug } from "@/lib/products/queries";
import { getConciergeCopy } from "@/lib/concierge/ui-copy";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type ConciergePageProps = {
  params: Promise<LocaleParams>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
}: ConciergePageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const copy = getConciergeCopy(locale);

  return buildPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/concierge",
    locale,
  });
}

export default async function ConciergePage({
  params,
  searchParams,
}: ConciergePageProps) {
  const locale = await resolveLocale(params);
  const copy = getConciergeCopy(locale);
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
            <p className="type-label !text-[var(--color-navy)]">{copy.label}</p>
            <h1 className="type-h2 mt-3">{copy.title}</h1>
            <p className="type-body mt-4 max-w-[30em] text-[var(--color-ink-soft)]">
              {copy.lead}
            </p>
            {product ? (
              <Link
                href={`/products/${product.slug}`}
                className="type-label mt-6 inline-flex min-h-11 items-center border-b border-[var(--color-ink)] !text-[var(--color-ink)] transition-opacity duration-[var(--duration-quiet)] hover:opacity-60"
              >
                <span aria-hidden className="font-en mr-2">
                  ←
                </span>
                {copy.backTo(product.name)}
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
