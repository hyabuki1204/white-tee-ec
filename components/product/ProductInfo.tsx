"use client";

import { ProductDetailPanel } from "@/components/product/ProductDetailPanel";
import { ProductDetailTabs } from "@/components/product/ProductDetailTabs";
import { ProductFabricContext } from "@/components/product/ProductFabricContext";
import { ProductModelFitInfo } from "@/components/product/ProductModelFitInfo";
import { MobilePurchaseBar } from "@/components/product/MobilePurchaseBar";
import { ProductPurchaseProvider } from "@/components/product/ProductPurchaseContext";
import { SizeRecommendationTool } from "@/components/product/SizeRecommendationTool";
import { toProductDetailContent } from "@/lib/db/products/mapper";
import { PRODUCT_SIZES } from "@/lib/products/defaults";
import { formatPrice } from "@/lib/utils/format-price";
import type { Fabric } from "@/lib/fabric/content";
import type { Product } from "@/types";

type ProductInfoProps = {
  product: Product;
  fabric?: Fabric | null;
};

export function ProductInfo({ product, fabric }: ProductInfoProps) {
  const detail = toProductDetailContent(product);
  const availableSizes =
    product.variants.length > 0
      ? product.variants.map((variant) => variant.size)
      : [...PRODUCT_SIZES];

  return (
    <ProductPurchaseProvider product={product}>
      <aside className="flex flex-col px-6 py-10 pb-24 sm:py-12 sm:pb-24 md:px-10 md:py-16 md:pb-24 lg:sticky lg:top-[var(--header-height)] lg:z-10 lg:max-h-[calc(100vh-var(--header-height))] lg:overflow-y-auto lg:px-10 lg:py-16 lg:pb-16 xl:px-12">
        <div className="mx-auto flex w-full max-w-[18rem] flex-col sm:max-w-[16rem] lg:max-w-[13rem] xl:max-w-[14rem]">
          <header className="order-1 shrink-0 space-y-6 sm:space-y-8 md:space-y-9">
            <h1 className="text-[15px] font-light uppercase leading-[1.65] tracking-[0.07em] text-neutral-800 sm:text-sm md:text-[13px] md:tracking-[0.08em]">
              {product.name}
            </h1>
            {fabric ? (
              <ProductFabricContext fabric={fabric} />
            ) : null}
            <p className="text-[13px] font-light tracking-[0.05em] text-neutral-600 md:text-xs md:text-neutral-500">
              {formatPrice(product.price)}
              <span className="mt-1.5 block text-[11px] tracking-[0.08em] text-neutral-400 md:text-[10px]">
                tax in
              </span>
            </p>
          </header>

          <div className="order-2 mt-10 sm:mt-12 lg:order-4 lg:mt-20">
            <ProductDetailPanel detail={detail} includeTabs={false} />
          </div>

          <div className="order-3 lg:order-2">
            <ProductModelFitInfo
              fitProfile={product.fitProfile}
              collapsible
              collapsibleOnlyMobile
            />
          </div>

          <div className="order-4 lg:order-3">
            <SizeRecommendationTool
              fitProfile={product.fitProfile}
              availableSizes={availableSizes}
              collapsible
              collapsibleOnlyMobile
            />
          </div>

          <div className="order-5 mt-10 sm:mt-12 lg:mt-20">
            <ProductDetailTabs detail={detail} />
          </div>
        </div>
      </aside>

      <MobilePurchaseBar />
    </ProductPurchaseProvider>
  );
}
