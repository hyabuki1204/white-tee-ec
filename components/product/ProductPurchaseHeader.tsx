import {
  getGraphpaperDisplayName,
  STORE_BRAND_LINE,
} from "@/lib/products/display-name";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { formatPrice } from "@/lib/utils/format-price";
import type { Product } from "@/types";

type ProductPurchaseHeaderProps = {
  product: Product;
  displayName: string;
  fabricName?: string | null;
  className?: string;
};

const pdpCopy = GRAPHPAPER_STORE_COPY.pdp;

/** Server-rendered product title and price for SEO and no-JS access. */
export function ProductPurchaseHeader({
  product,
  displayName,
  fabricName,
  className,
}: ProductPurchaseHeaderProps) {
  const resolvedName =
    displayName || getGraphpaperDisplayName(product, fabricName);

  return (
    <header className={className}>
      <p className="text-[10px] font-light tracking-[0.2em] text-neutral-400">
        {STORE_BRAND_LINE}
      </p>
      <h1 className="mt-5 text-[13px] font-light leading-[1.65] tracking-[0.04em] text-neutral-800">
        {resolvedName}
      </h1>
      <div className="mt-5">
        <p className="text-[13px] font-light tracking-[0.05em] text-neutral-600">
          {formatPrice(product.price)}
        </p>
        <p className="mt-2 text-[10px] font-light leading-[1.7] tracking-[0.04em] text-neutral-400">
          {pdpCopy.dutiesNote}
        </p>
      </div>
    </header>
  );
}
