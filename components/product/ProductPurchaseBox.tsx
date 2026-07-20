"use client";

import { AddToCartButton } from "@/components/product/AddToCartButton";
import { PdpStoreGuide } from "@/components/product/PdpStoreGuide";
import { ProductDetailsInline } from "@/components/product/ProductDetailsInline";
import { ProductCredibility } from "@/components/product/ProductCredibility";
import { ProductPurchaseFitGuide } from "@/components/product/ProductPurchaseFitGuide";
import { ProductPurchaseReassurance } from "@/components/product/ProductPurchaseReassurance";
import { ProductValueProposition } from "@/components/product/ProductValueProposition";
import { useProductPurchase } from "@/components/product/ProductPurchaseContext";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { VariantSelector } from "@/components/product/VariantSelector";
import { buildPdpValueContent } from "@/lib/store-ui/pdp-value";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { PURCHASE_BOX_CLASS } from "@/lib/store-ui/typography";
import type { Fabric } from "@/lib/fabric/content";
import type { ProductDetailContent, ProductSize } from "@/types";
import type { ProductFitProfile } from "@/types/product-fit";
import type { ReactNode } from "react";

type ProductPurchaseSectionsProps = {
  detail: ProductDetailContent;
  fabric?: Fabric | null;
  fabricName?: string | null;
  fitProfile: ProductFitProfile;
  availableSizes: ProductSize[];
};

const pdpCopy = GRAPHPAPER_STORE_COPY.pdp;
const { product: productCopy } = SITE_UI_COPY;

const boxClassName = PURCHASE_BOX_CLASS;

function PurchaseStatus() {
  const { selectedSize, isOutOfStock, maxQuantity, inCartQuantity } =
    useProductPurchase();

  if (!selectedSize) {
    return (
      <p className="min-h-[1rem] text-[12px] font-light leading-[1.8] tracking-[0.05em] text-neutral-600">
        {productCopy.chooseSize}
      </p>
    );
  }

  if (isOutOfStock) {
    return (
      <p className="min-h-[1rem] text-[12px] font-light leading-[1.8] tracking-[0.05em] text-neutral-600">
        {productCopy.unavailable}
      </p>
    );
  }

  if (maxQuantity < 1) {
    return (
      <p className="min-h-[1rem] text-[12px] font-light leading-[1.8] tracking-[0.05em] text-neutral-600">
        {productCopy.allInBag}
      </p>
    );
  }

  if (inCartQuantity > 0) {
    return (
      <p className="min-h-[1rem] text-[12px] font-light leading-[1.8] tracking-[0.05em] text-neutral-600">
        {productCopy.inBagMore(inCartQuantity, maxQuantity)}
      </p>
    );
  }

  if (maxQuantity <= 5) {
    return (
      <p className="min-h-[1rem] text-[12px] font-light leading-[1.8] tracking-[0.05em] text-neutral-600">
        {productCopy.qtyLeft(maxQuantity)}
      </p>
    );
  }

  return <div className="min-h-[1rem]" aria-hidden />;
}

type ProductPurchasePrimaryProps = {
  fabric?: Fabric | null;
  fabricName?: string | null;
  fitProfile: ProductFitProfile;
  availableSizes: ProductSize[];
  showFitGuide?: boolean;
};

export function ProductPurchasePrimary({
  fabric,
  fabricName,
  fitProfile,
  availableSizes,
  showFitGuide = false,
}: ProductPurchasePrimaryProps) {
  const {
    product,
    selectedSize,
    quantity,
    setQuantity,
    maxQuantity,
    canAdd,
    addError,
    buttonLabel,
    handleAddToCart,
    isAdded,
    purchaseCtaRef,
  } = useProductPurchase();

  const selectedVariant = product.variants.find(
    (variant) => variant.size === selectedSize,
  );
  const valueContent = buildPdpValueContent(product, fabric);

  return (
    <div className={boxClassName}>
      <ProductValueProposition content={valueContent} />

      <section aria-label="Purchase options" className="mt-8 space-y-8">
        <VariantSelector variants={product.variants} />

        {showFitGuide ? (
          <ProductPurchaseFitGuide
            fitProfile={fitProfile}
            availableSizes={availableSizes}
          />
        ) : null}

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
              disabled={!selectedSize}
              onAdd={handleAddToCart}
              label={buttonLabel}
            />
          </div>

          <div aria-live="polite" className="min-h-[1.25rem] space-y-1">
            {addError ? (
              <p className="text-[12px] font-light leading-[1.8] tracking-[0.05em] text-red-600/90">
                {addError}
              </p>
            ) : null}
            {isAdded && selectedSize && !addError ? (
              <p className="text-[12px] font-light leading-[1.8] tracking-[0.05em] text-neutral-600">
                {productCopy.added(
                  selectedSize,
                  quantity > 1 ? quantity : undefined,
                )}
                .
              </p>
            ) : null}
          </div>

          <ProductPurchaseReassurance />

          <ProductCredibility fabricName={fabricName} />

          {selectedVariant?.sku ? (
            <p className="text-[11px] font-light tracking-[0.08em] text-neutral-600">
              {pdpCopy.sku} {selectedVariant.sku}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

type ProductPurchaseSecondaryProps = ProductPurchaseSectionsProps & {
  hideFitTools?: boolean;
};

export function ProductPurchaseSecondary({
  detail,
  fabric,
  fitProfile,
  availableSizes,
  hideFitTools = false,
}: ProductPurchaseSecondaryProps) {
  return (
    <div className={boxClassName}>
      <ProductDetailsInline
        detail={detail}
        fabric={fabric}
        fitProfile={fitProfile}
        availableSizes={availableSizes}
        hideFitTools={hideFitTools}
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
  purchaseHeader,
}: ProductPurchaseSectionsProps & {
  purchaseHeader: ReactNode;
}) {
  return (
    <aside className="hidden px-6 py-10 sm:py-12 md:px-10 md:py-16 lg:sticky lg:top-[var(--header-height)] lg:z-10 lg:block lg:max-h-[calc(100vh-var(--header-height))] lg:overflow-y-auto lg:px-10 lg:py-16 xl:px-12">
      <div className={boxClassName}>
        {purchaseHeader}
        <div className="mt-8">
          <ProductPurchasePrimary
            fabric={fabric}
            fabricName={fabricName}
            fitProfile={fitProfile}
            availableSizes={availableSizes}
            showFitGuide
          />
        </div>
        <ProductPurchaseSecondary
          detail={detail}
          fabric={fabric}
          fabricName={fabricName}
          fitProfile={fitProfile}
          availableSizes={availableSizes}
          hideFitTools
        />
      </div>
    </aside>
  );
}

/** @deprecated Use ProductPageLayout instead. */
export function ProductPurchaseBox(props: ProductPurchaseSectionsProps) {
  return (
    <div className={boxClassName}>
      <ProductPurchasePrimary
        fabric={props.fabric}
        fabricName={props.fabricName}
        fitProfile={props.fitProfile}
        availableSizes={props.availableSizes}
        showFitGuide
      />
      <ProductPurchaseSecondary {...props} hideFitTools />
    </div>
  );
}
