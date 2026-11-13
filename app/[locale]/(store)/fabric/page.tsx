import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { FabricCompareOverview } from "@/components/fabric/FabricCompareOverview";
import { FabricGrid } from "@/components/fabric/FabricGrid";
import { FabricIntro } from "@/components/fabric/FabricIntro";
import { Container } from "@/components/layout/Container";
import { getSiteUiCopy } from "@/lib/copy/site-ui";
import { defineCopy } from "@/lib/i18n/define-copy";
import {
  localeStaticParams,
  resolveLocale,
  type LocaleParams,
} from "@/lib/i18n/server";
import { getFabrics } from "@/lib/fabric/queries";
import { getProducts } from "@/lib/products/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

/**
 * The catalog lives in the database and changes without a deploy (admin
 * edits, and migrations that run after the build). Re-read it periodically
 * instead of freezing whatever the database held at build time.
 */
export const revalidate = 300;

const getMeta = defineCopy(
  {
    title: "Fabric",
    description:
      "Cotton jersey we knit ourselves — weight, hand, and how quietly white holds light.",
  },
  {
    title: "Gauge",
    description:
      "Three gauges of white cotton jersey, knitted in Wakayama: 28G, 36G and 46G. Gauge is needles per inch.",
  },
);

type FabricPageProps = {
  params: Promise<LocaleParams>;
};

export function generateStaticParams() {
  return localeStaticParams();
}

export async function generateMetadata({
  params,
}: FabricPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);

  return buildPageMetadata({ ...getMeta(locale), path: "/fabric", locale });
}

export default async function FabricPage({ params }: FabricPageProps) {
  const locale = await resolveLocale(params);
  const [fabrics, products] = await Promise.all([
    getFabrics(locale),
    getProducts(),
  ]);

  const productCountBySlug = products.reduce<Record<string, number>>(
    (counts, product) => {
      if (product.fabricSlug) {
        counts[product.fabricSlug] = (counts[product.fabricSlug] ?? 0) + 1;
      }
      return counts;
    },
    {},
  );

  const { breadcrumbs: bc } = getSiteUiCopy(locale);

  return (
    <Container as="section" className="py-14 md:py-20">
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs
          items={[
            { label: bc.home, href: "/" },
            { label: bc.fabric },
          ]}
        />
        <FabricIntro locale={locale} />
        <FabricCompareOverview
          locale={locale}
          fabrics={fabrics} variant="full" className="mt-16 md:mt-24" />
        <div className="mt-16 md:mt-24">
          <FabricGrid
            locale={locale}
            fabrics={fabrics}
            productCountBySlug={productCountBySlug}
          />
        </div>
      </div>
    </Container>
  );
}
