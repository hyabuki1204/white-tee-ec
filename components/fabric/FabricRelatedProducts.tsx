import { Link } from "@/components/i18n/Link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getSiteUiCopy } from "@/lib/copy/site-ui";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/types";

const DISPLAY_LIMIT = 6;

type FabricRelatedProductsProps = {
  locale: Locale;
  products: Product[];
  fabricSlug: string;
  fabricNameBySlug?: Record<string, string>;
};

export function FabricRelatedProducts({
  locale,
  products,
  fabricSlug,
  fabricNameBySlug,
}: FabricRelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  const displayed = products.slice(0, DISPLAY_LIMIT);
  const { fabric: copy } = getSiteUiCopy(locale);

  return (
    <section className="w-full" aria-label={copy.inThisFabric}>
      <p className="mb-16 text-center text-[12px] font-normal tracking-[0.12em] text-neutral-600 md:mb-20 md:text-[12px]">
        {copy.inThisFabric}
      </p>

      <ProductGrid
        products={displayed}
        fabricNameBySlug={fabricNameBySlug}
      />

      <div className="mt-24 text-center md:mt-28">
        <Link
          href={`/products?fabric=${fabricSlug}`}
          className="text-[12px] font-normal tracking-[0.08em] text-neutral-600 transition-opacity duration-[var(--duration-quiet)] hover:opacity-50 md:text-[12px]"
        >
          {copy.viewAll}
        </Link>
      </div>
    </section>
  );
}
