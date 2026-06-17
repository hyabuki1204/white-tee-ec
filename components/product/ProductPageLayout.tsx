"use client";

import { ProductGallery } from "@/components/product/ProductGallery";
import { MobilePurchaseBar } from "@/components/product/MobilePurchaseBar";
import {
  ProductPurchaseAside,
  ProductPurchasePrimary,
  ProductPurchaseSecondary,
} from "@/components/product/ProductPurchaseBox";
import { ProductPurchaseProvider } from "@/components/product/ProductPurchaseContext";
import { toProductDetailContent } from "@/lib/db/products/mapper";
import { PRODUCT_SIZES } from "@/lib/products/defaults";
import type { Fabric } from "@/lib/fabric/content";
import type { Product } from "@/types";

type ProductPageLayoutProps = {
  product: Product;
  fabric?: Fabric | null;
  fabricName?: string | null;
  displayName: string;
};

export function ProductPageLayout({
  product,
  fabric,
  fabricName,
  displayName,
}: ProductPageLayoutProps) {
  const detail = toProductDetailContent(product);
  const resolvedFabricName = fabricName ?? fabric?.name;
  const availableSizes =
    product.variants.length > 0
      ? product.variants.map((variant) => variant.size)
      : [...PRODUCT_SIZES];

  const sharedProps = {
    detail,
    fabric,
    fabricName: resolvedFabricName,
    fitProfile: product.fitProfile,
    availableSizes,
  };

  return (
    <ProductPurchaseProvider product={product}>
      <section className="flex flex-col lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,0.9fr)] lg:items-start lg:gap-x-12 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,0.85fr)] xl:gap-x-16">
        <div className="order-1 lg:order-1">
          <ProductGallery product={product} displayName={displayName} />
        </div>

        <div className="order-2 px-6 pt-8 pb-2 lg:hidden">
          <ProductPurchasePrimary fabricName={resolvedFabricName} />
        </div>

        <div className="order-3 lg:order-2">
          <ProductPurchaseAside {...sharedProps} />
        </div>

        <div className="order-4 px-6 pb-8 lg:hidden">
          <ProductPurchaseSecondary {...sharedProps} />
        </div>
      </section>

      <MobilePurchaseBar fabricName={resolvedFabricName} />
    </ProductPurchaseProvider>
  );
}
