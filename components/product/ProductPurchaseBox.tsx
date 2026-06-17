"use client";

import { AddToCartButton } from "@/components/product/AddToCartButton";
import { PdpStoreGuide } from "@/components/product/PdpStoreGuide";
import { ProductDetailsInline } from "@/components/product/ProductDetailsInline";
import { useProductPurchase } from "@/components/product/ProductPurchaseContext";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { VariantSelector } from "@/components/product/VariantSelector";
import {
  getGraphpaperDisplayName,
  STORE_BRAND_LINE,
} from "@/lib/products/display-name";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { formatPrice } from "@/lib/utils/format-price";
import type { Fabric } from "@/lib/fabric/content";
import type { ProductDetailContent, ProductSize } from "@/types";
import type { ProductFitProfile } from "@/types/product-fit";

type ProductPurchaseSectionsProps = {
  detail: ProductDetailContent;
  fabric?: Fabric | null;
  fabricName?: string | null;
  fitProfile: ProductFitProfile;
  availableSizes: ProductSize[];
};

const pdpCopy = GRAPHPAPER_STORE_COPY.pdp;
const { product: productCopy } = SITE_UI_COPY;

const boxClassName =
  "mx-auto flex w-full max-w-[18rem] flex-col sm:max-w-[16rem] lg:max-w-[13rem] xl:max-w-[14rem]";

function PurchaseStatus() {
  const { selectedSize, isOutOfStock, maxQuantity, inCartQuantity } =
    useProductPurchase();

  if (!selectedSize) {
    return (
      <p className="min-h-[1rem] text-[11px] font-light leading-[1.8] tracking-[0.05em] text-neutral-400">
        {productCopy.chooseSize}
      </p>
    );
  }

  if (isOutOfStock) {
    return (
      <p className="min-h-[1rem] text-[11px] font-light leading-[1.8] tracking-[0.05em] text-neutral-400">
        {productCopy.unavailable}
      </p>
    );
  }

  if (maxQuantity < 1) {
    return (
      <p className="min-h-[1rem] text-[11px] font-light leading-[1.8] tracking-[0.05em] text-neutral-400">
        {productCopy.allInBag}
      </p>
    );
  }

  if (inCartQuantity > 0) {
    return (
      <p className="min-h-[1rem] text-[11px] font-light leading-[1.8] tracking-[0.05em] text-neutral-400">
        {productCopy.inBagMore(inCartQuantity, maxQuantity)}
      </p>
    );
  }

  if (maxQuantity <= 5) {
    return (
      <p className="min-h-[1rem] text-[11px] font-light leading-[1.8] tracking-[0.05em] text-neutral-400">
        {productCopy.qtyLeft(maxQuantity)}
      </p>
    );
  }

  return <div className="min-h-[1rem]" aria-hidden />;
}

type ProductPurchasePrimaryProps = {
  fabricName?: string | null;
};

export function ProductPurchasePrimary({
  fabricName,
}: ProductPurchasePrimaryProps) {
  const {
    product,
    selectedSize,
    quantity,
    setQuantity,
    maxQuantity,
    canAdd,
    buttonLabel,
    handleAddToCart,
    isAdded,
    purchaseCtaRef,
  } = useProductPurchase();

  const displayName = getGraphpaperDisplayName(product, fabricName);
  const selectedVariant = product.variants.find(
    (variant) => variant.size === selectedSize,
  );

  return (
    <div className={boxClassName}>
      <header className="shrink-0 space-y-5">
        <p className="text-[10px] font-light tracking-[0.2em] text-neutral-400">
          {STORE_BRAND_LINE}
        </p>
        <h1 className="text-[13px] font-light leading-[1.65] tracking-[0.04em] text-neutral-800">
          {displayName}
        </h1>
        <div>
          <p className="text-[13px] font-light tracking-[0.05em] text-neutral-600">
            {formatPrice(product.price)}
          </p>
          <p className="mt-2 text-[10px] font-light leading-[1.7] tracking-[0.04em] text-neutral-400">
            {pdpCopy.dutiesNote}
          </p>
        </div>
      </header>

      <section
        aria-label="Purchase options"
        className="mt-8 space-y-8"
      >
        <VariantSelector variants={product.variants} />

        <div className="space-y-4">
          <PurchaseStatus />

          {selectedSize ? (
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              max={maxQuantity}
              disabled={!canAdd}
            />
          ) : null}

          <div ref={purchaseCtaRef}>
            <AddToCartButton
              disabled={!canAdd}
              onAdd={handleAddToCart}
              label={buttonLabel}
            />
          </div>

          <div aria-live="polite" className="min-h-[1.25rem]">
            {isAdded && selectedSize ? (
              <p className="text-[11px] font-light leading-[1.8] tracking-[0.05em] text-neutral-400">
                {productCopy.added(
                  selectedSize,
                  quantity > 1 ? quantity : undefined,
                )}
                .
              </p>
            ) : null}
          </div>

          {selectedVariant?.sku ? (
            <p className="text-[10px] font-light tracking-[0.08em] text-neutral-400">
              {pdpCopy.sku} {selectedVariant.sku}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function ProductPurchaseSecondary({
  detail,
  fabric,
  fitProfile,
  availableSizes,
}: ProductPurchaseSectionsProps) {
  return (
    <div className={boxClassName}>
      <ProductDetailsInline
        detail={detail}
        fabric={fabric}
        fitProfile={fitProfile}
        availableSizes={availableSizes}
      />
      <PdpStoreGuide />
    </div>
  );
}

export function ProductPurchaseAside({
  detail,
  fabric,
  fabricName,
  fitProfile,
  availableSizes,
}: ProductPurchaseSectionsProps) {
  return (
    <aside className="hidden px-6 py-10 sm:py-12 md:px-10 md:py-16 lg:sticky lg:top-[var(--header-height)] lg:z-10 lg:block lg:max-h-[calc(100vh-var(--header-height))] lg:overflow-y-auto lg:px-10 lg:py-16 xl:px-12">
      <div className={boxClassName}>
        <ProductPurchasePrimary fabricName={fabricName} />
        <ProductPurchaseSecondary
          detail={detail}
          fabric={fabric}
          fitProfile={fitProfile}
          availableSizes={availableSizes}
        />
      </div>
    </aside>
  );
}

/** @deprecated Use ProductPageLayout instead. */
export function ProductPurchaseBox(props: ProductPurchaseSectionsProps) {
  return (
    <div className={boxClassName}>
      <ProductPurchasePrimary fabricName={props.fabricName} />
      <ProductPurchaseSecondary {...props} />
    </div>
  );
}
