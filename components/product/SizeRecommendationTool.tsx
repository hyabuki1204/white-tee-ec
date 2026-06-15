"use client";

import { useMemo, useState } from "react";
import { JaHelperText } from "@/components/ui/JaHelperText";
import { useProductPurchase } from "@/components/product/ProductPurchaseContext";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import { recommendSize } from "@/lib/products/size-recommendation";
import type { FitPreference, ProductFitProfile } from "@/types/product-fit";
import type { ProductSize } from "@/types";

type SizeRecommendationToolProps = {
  fitProfile: ProductFitProfile;
  availableSizes: ProductSize[];
  collapsible?: boolean;
  collapsibleOnlyMobile?: boolean;
};

const PREFERENCES: { value: FitPreference; label: string }[] = [
  { value: "just-fit", label: "Just fit" },
  { value: "relaxed", label: "Relaxed" },
  { value: "oversized", label: "Oversized" },
];

function SizeRecommendationContent({
  fitProfile,
  availableSizes,
}: Omit<SizeRecommendationToolProps, "collapsible">) {
  const copy = SITE_UI_COPY.sizeRecommendation;
  const { product: productCopy } = SITE_UI_COPY;
  const { setSelectedSize, setRecommendedSize, openSizeTab } = useProductPurchase();
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [preference, setPreference] = useState<FitPreference>("just-fit");
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    if (!submitted) return null;

    const height = Number(heightCm);
    const weight = Number(weightKg);

    if (
      !Number.isFinite(height) ||
      height < 130 ||
      height > 220 ||
      !Number.isFinite(weight) ||
      weight < 30 ||
      weight > 150
    ) {
      return null;
    }

    return recommendSize(
      { heightCm: height, weightKg: weight, preference },
      fitProfile,
      availableSizes,
    );
  }, [submitted, heightCm, weightKg, preference, fitProfile, availableSizes]);

  const showInvalid =
    submitted &&
    result === null &&
    (heightCm !== "" || weightKg !== "");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);

    const height = Number(heightCm);
    const weight = Number(weightKg);

    if (
      !Number.isFinite(height) ||
      height < 130 ||
      height > 220 ||
      !Number.isFinite(weight) ||
      weight < 30 ||
      weight > 150
    ) {
      return;
    }

    const recommendation = recommendSize(
      { heightCm: height, weightKg: weight, preference },
      fitProfile,
      availableSizes,
    );

    if (recommendation) {
      setRecommendedSize(recommendation.recommended);
      setSelectedSize(recommendation.recommended);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1.5">
            <span className="text-[11px] font-light tracking-[0.06em] text-neutral-500 md:text-[10px]">
              {copy.height}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={130}
              max={220}
              placeholder="170"
              value={heightCm}
              onChange={(event) => {
                setHeightCm(event.target.value);
                setSubmitted(false);
              }}
              className="w-full border-0 border-b border-neutral-200 bg-transparent py-1.5 text-xs font-light tracking-[0.04em] text-neutral-700 outline-none placeholder:text-neutral-300 focus:border-neutral-400"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-light tracking-[0.06em] text-neutral-500 md:text-[10px]">
              {copy.weight}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={30}
              max={150}
              placeholder="65"
              value={weightKg}
              onChange={(event) => {
                setWeightKg(event.target.value);
                setSubmitted(false);
              }}
              className="w-full border-0 border-b border-neutral-200 bg-transparent py-1.5 text-xs font-light tracking-[0.04em] text-neutral-700 outline-none placeholder:text-neutral-300 focus:border-neutral-400"
            />
          </label>
        </div>

        <fieldset className="space-y-2 border-0 p-0">
          <legend className="text-[11px] font-light tracking-[0.06em] text-neutral-500 md:text-[10px]">
            {copy.preference}
          </legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {PREFERENCES.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 text-[11px] font-light tracking-[0.04em] text-neutral-600"
              >
                <input
                  type="radio"
                  name="fit-preference"
                  value={option.value}
                  checked={preference === option.value}
                  onChange={() => {
                    setPreference(option.value);
                    setSubmitted(false);
                  }}
                  className="h-3 w-3 border-neutral-300 text-neutral-600 focus:ring-0 focus:ring-offset-0"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          className="text-[11px] font-light uppercase tracking-[0.12em] text-neutral-500 underline-offset-4 hover:text-neutral-700 hover:underline md:text-[10px]"
        >
          {copy.submit}
        </button>
      </form>

      {result ? (
        <div className="space-y-1.5 pt-1">
          <p className="text-xs font-light tracking-[0.04em] text-neutral-700">
            {result.primaryLine}
          </p>
          {result.secondaryLine ? (
            <p className="text-[11px] font-light leading-[1.75] tracking-[0.03em] text-neutral-500">
              {result.secondaryLine}
            </p>
          ) : null}
          {result.helperJa ? (
            <JaHelperText spacing="tight">{result.helperJa}</JaHelperText>
          ) : null}
          <p className="pt-2 text-[11px] font-light leading-[1.7] tracking-[0.04em] text-neutral-400 md:text-[10px]">
            {copy.disclaimer}{" "}
            <button
              type="button"
              onClick={openSizeTab}
              className="text-neutral-500 underline-offset-4 hover:text-neutral-700 hover:underline"
            >
              {productCopy.sizeGuide}
            </button>
          </p>
        </div>
      ) : null}

      {showInvalid ? (
        <p className="text-[11px] font-light tracking-[0.04em] text-neutral-400 md:text-[10px]">
          {copy.invalidInput}
        </p>
      ) : null}
    </>
  );
}

export function SizeRecommendationTool({
  fitProfile,
  availableSizes,
  collapsible = false,
  collapsibleOnlyMobile = false,
}: SizeRecommendationToolProps) {
  const copy = SITE_UI_COPY.sizeRecommendation;

  const inner = (
    <SizeRecommendationContent
      fitProfile={fitProfile}
      availableSizes={availableSizes}
    />
  );

  if (collapsibleOnlyMobile) {
    return (
      <>
        <div className="lg:hidden">
          <details className="group border-0 pt-6">
            <summary className="cursor-pointer list-none text-[10px] font-light uppercase tracking-[0.14em] text-neutral-400 [&::-webkit-details-marker]:hidden">
              <span className="group-open:opacity-60">{copy.heading}</span>
            </summary>
            <div className="space-y-5 pt-5">{inner}</div>
          </details>
        </div>
        <section
          aria-label={copy.sectionLabel}
          className="hidden space-y-5 border-0 pt-10 sm:pt-12 md:pt-14 lg:block"
        >
          <h2 className="text-[11px] font-light uppercase tracking-[0.14em] text-neutral-400 md:text-[10px]">
            {copy.heading}
          </h2>
          {inner}
        </section>
      </>
    );
  }

  if (collapsible) {
    return (
      <details className="group border-0 pt-6">
        <summary className="cursor-pointer list-none text-[10px] font-light uppercase tracking-[0.14em] text-neutral-400 [&::-webkit-details-marker]:hidden">
          <span className="group-open:opacity-60">{copy.heading}</span>
        </summary>
        <div className="space-y-5 pt-5">{inner}</div>
      </details>
    );
  }

  return (
    <section
      aria-label={copy.sectionLabel}
      className="space-y-5 border-0 pt-10 sm:pt-12 md:pt-14"
    >
      <h2 className="text-[11px] font-light uppercase tracking-[0.14em] text-neutral-400 md:text-[10px]">
        {copy.heading}
      </h2>
      {inner}
    </section>
  );
}
