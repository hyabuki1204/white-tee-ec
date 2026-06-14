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
    <aside className="flex flex-col px-6 py-10 sm:py-12 md:px-10 md:py-16 lg:sticky lg:top-[var(--header-height)] lg:z-10 lg:max-h-[calc(100vh-var(--header-height))] lg:overflow-y-auto lg:px-10 lg:py-16 xl:px-12">
      <div className="mx-auto w-full max-w-[18rem] sm:max-w-[16rem] lg:max-w-[13rem] xl:max-w-[14rem]">
        <header className="shrink-0 space-y-6 sm:space-y-8 md:space-y-9">
          <h1 className="text-[15px] font-light uppercase leading-[1.65] tracking-[0.07em] text-neutral-800 sm:text-sm md:text-[13px] md:tracking-[0.08em]">
            {product.name}
          </h1>
          <p className="text-[13px] font-light tracking-[0.05em] text-neutral-600 md:text-xs md:text-neutral-500">
            {formatPrice(product.price)}
            <span className="mt-1.5 block text-[10px] tracking-[0.08em] text-neutral-400">
              tax in
            </span>
          </p>
        </header>

        <div className="mt-10 sm:mt-12 md:mt-16 lg:mt-20">
          <ProductDetailPanel product={product} detail={detail} />
        </div>
      </div>
    </aside>
  );
}
