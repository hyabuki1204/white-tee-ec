import { ProductDetailPanel } from "@/components/product/ProductDetailPanel";
import { toProductDetailContent } from "@/lib/db/products/mapper";
import { formatPrice } from "@/lib/utils/format-price";
import type { Product } from "@/types";

type ProductInfoProps = {
  product: Product;
};

export function ProductInfo({ product }: ProductInfoProps) {
  const detail = toProductDetailContent(product);

  return (
    <aside
      className="flex flex-col px-6 py-12 md:px-10 md:py-16 lg:sticky lg:top-[var(--header-height)] lg:z-10 lg:max-h-[calc(100vh-var(--header-height))] lg:overflow-y-auto lg:px-12 lg:py-14 xl:px-14 xl:py-16"
    >
      <header className="shrink-0">
        <div className="flex items-start justify-between gap-8 lg:gap-12">
          <h1 className="max-w-[12rem] text-sm font-light uppercase leading-[1.65] tracking-[0.08em] text-neutral-900 sm:max-w-[14rem] md:max-w-[16rem] md:text-[15px] lg:max-w-[11rem] xl:max-w-[13rem]">
            {product.name}
          </h1>
          <p className="shrink-0 text-right text-sm font-light tracking-wide text-neutral-600">
            {formatPrice(product.price)}
            <span className="mt-1 block text-[10px] tracking-[0.08em] text-neutral-400">
              tax in
            </span>
          </p>
        </div>
      </header>

      <div className="mt-12 flex flex-col lg:mt-16 lg:gap-14 xl:mt-20 xl:gap-16">
        <ProductDetailPanel product={product} detail={detail} />
      </div>
    </aside>
  );
}
