"use client";

import Link from "next/link";
import { JaHelperText } from "@/components/ui/JaHelperText";
import { FabricCharacterDisplay } from "@/components/fabric/FabricCharacterDisplay";
import { ProductModelFitInfo } from "@/components/product/ProductModelFitInfo";
import { SizeRecommendationTool } from "@/components/product/SizeRecommendationTool";
import { PRODUCT_SIZE_GUIDE_JA } from "@/lib/i18n/ja-helpers";
import { GRAPHPAPER_STORE_COPY } from "@/lib/store-ui/graphpaper-copy";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import type { Fabric } from "@/lib/fabric/content";
import type { ProductDetailContent, ProductSize } from "@/types";
import type { ProductFitProfile } from "@/types/product-fit";

type ProductDetailsInlineProps = {
  detail: ProductDetailContent;
  fabric?: Fabric | null;
  fitProfile: ProductFitProfile;
  availableSizes: ProductSize[];
  hideFitTools?: boolean;
};

const copy = GRAPHPAPER_STORE_COPY.pdp;
const { product: productCopy } = SITE_UI_COPY;

export function ProductDetailsInline({
  detail,
  fabric,
  fitProfile,
  availableSizes,
  hideFitTools = false,
}: ProductDetailsInlineProps) {
  return (
    <div className="mt-12 space-y-10 border-t border-neutral-200/60 pt-10 sm:mt-14 sm:pt-12 lg:mt-16">
      <section aria-label={copy.description} className="space-y-4">
        <h2 className="text-[10px] font-light uppercase tracking-[0.16em] text-neutral-400">
          {copy.description}
        </h2>
        <p className="text-[11px] font-light leading-[2] tracking-[0.03em] text-neutral-500">
          {detail.description}
        </p>
        {detail.fitNote ? (
          <p className="text-[11px] font-light leading-[1.9] tracking-[0.04em] text-neutral-400">
            {detail.fitNote}
          </p>
        ) : null}
      </section>

      <section aria-label={copy.material} className="space-y-3">
        <h2 className="text-[10px] font-light uppercase tracking-[0.16em] text-neutral-400">
          {copy.material}
        </h2>
        <p className="text-[11px] font-light leading-[2] tracking-[0.04em] text-neutral-500">
          {detail.material}
        </p>
      </section>

      <section aria-label={copy.care} className="space-y-3">
        <h2 className="text-[10px] font-light uppercase tracking-[0.16em] text-neutral-400">
          {copy.care}
        </h2>
        <p className="text-[11px] font-light leading-[2.05] tracking-[0.03em] text-neutral-500">
          {detail.care}
        </p>
      </section>

      {hideFitTools ? null : (
        <ProductModelFitInfo fitProfile={fitProfile} collapsible />
      )}

      <section id="size-guide" aria-label={copy.sizeGuide} className="space-y-4">
        <h2 className="text-[10px] font-light uppercase tracking-[0.16em] text-neutral-400">
          {copy.sizeGuide}
        </h2>
        <p className="text-[11px] font-light tracking-[0.1em] text-neutral-400">
          {productCopy.measurementsLabel}
        </p>
        <div className="relative">
          <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="min-w-[20rem] w-full text-left">
              <caption className="sr-only">
                Size guide measurements in centimeters
              </caption>
              <thead>
                <tr>
                  {["Size", "Length", "Shoulder", "Chest", "Sleeve"].map(
                    (label) => (
                      <th
                        key={label}
                        scope="col"
                        className="pb-3 pr-3 text-[11px] font-light tracking-[0.08em] text-neutral-400"
                      >
                        {label}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {detail.sizeGuide.map((row) => (
                  <tr key={row.size}>
                    <th
                      scope="row"
                      className="py-2 pr-3 text-left text-[11px] font-light text-neutral-600"
                    >
                      {row.size}
                    </th>
                    <td className="py-2 pr-3 text-[11px] font-light text-neutral-500">
                      {row.length}
                    </td>
                    <td className="py-2 pr-3 text-[11px] font-light text-neutral-500">
                      {row.shoulder}
                    </td>
                    <td className="py-2 pr-3 text-[11px] font-light text-neutral-500">
                      {row.chest}
                    </td>
                    <td className="py-2 text-[11px] font-light text-neutral-500">
                      {row.sleeve}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] font-light tracking-[0.06em] text-neutral-300 md:hidden">
            {productCopy.scrollHint}
          </p>
        </div>
        <p className="text-[11px] font-light leading-[1.9] tracking-[0.04em] text-neutral-400">
          Length from back collar to hem. Shoulder tip to tip. Chest measured
          flat.
        </p>
        <JaHelperText spacing="tight" className="max-w-sm">
          {PRODUCT_SIZE_GUIDE_JA}
        </JaHelperText>
      </section>

      {hideFitTools ? null : (
        <SizeRecommendationTool
          fitProfile={fitProfile}
          availableSizes={availableSizes}
          collapsible
        />
      )}

      {fabric ? (
        <details className="group border-t border-neutral-200/50 pt-8">
          <summary className="cursor-pointer list-none text-[10px] font-light uppercase tracking-[0.14em] text-neutral-400 [&::-webkit-details-marker]:hidden">
            <span className="group-open:opacity-60">{fabric.name}</span>
          </summary>
          <div className="space-y-4 pt-5">
            {fabric.tagline ? (
              <p className="text-[11px] font-light leading-[1.85] tracking-[0.03em] text-neutral-400">
                {fabric.tagline}
              </p>
            ) : null}
            <FabricCharacterDisplay
              character={fabric.character}
              variant="pdp"
              className="!mt-0"
            />
            <Link
              href={`/fabric/${fabric.slug}`}
              className="inline-block text-[11px] font-light tracking-[0.06em] text-neutral-500 transition-opacity hover:opacity-60"
            >
              {copy.aboutFabric(fabric.name)}
            </Link>
          </div>
        </details>
      ) : null}
    </div>
  );
}
