import { FIT_TYPE_GLOSSARY } from "@/lib/products/fit-glossary";
import { SITE_UI_COPY } from "@/lib/copy/site-ui";
import type { ProductFitProfile } from "@/types/product-fit";

type ProductModelFitInfoProps = {
  fitProfile: ProductFitProfile;
  /** When true, wrap in collapsible details. */
  collapsible?: boolean;
  /** Collapsible on mobile only; expanded section on desktop. */
  collapsibleOnlyMobile?: boolean;
};

function ModelFitContent({ fitProfile }: Pick<ProductModelFitInfoProps, "fitProfile">) {
  const copy = SITE_UI_COPY.modelFit;
  const primaryModel = fitProfile.models[0];

  if (!primaryModel) {
    return null;
  }

  const fitGlossary = FIT_TYPE_GLOSSARY[fitProfile.fitType];

  return (
    <>
      <div className="space-y-2">
        <p className="text-[12px] font-light leading-[1.85] tracking-[0.04em] text-neutral-600 md:text-[12px]">
          {copy.modelLine(primaryModel.heightCm, primaryModel.weightKg)}
        </p>
        <p className="text-[12px] font-light leading-[1.85] tracking-[0.04em] text-neutral-600 md:text-[12px]">
          {copy.wearingSize(primaryModel.size)}
        </p>
        <p className="text-[12px] font-light leading-[1.85] tracking-[0.04em] text-neutral-600 md:text-[12px]">
          {copy.sizeHint}
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-[12px] font-light uppercase tracking-[0.12em] text-neutral-600 md:text-[12px]">
            {fitProfile.fitLabel}
          </p>
          <p className="text-[12px] font-light leading-[1.75] tracking-[0.03em] text-neutral-600 md:text-[12px]">
            {fitGlossary}
          </p>
        </div>

        <ul className="space-y-1.5">
          {fitProfile.sizeReference.map((band) => (
            <li
              key={band.size}
              className="flex gap-3 text-[12px] font-light tracking-[0.04em] text-neutral-600 md:text-[12px]"
            >
              <span className="w-5 shrink-0 text-neutral-600">{band.size}</span>
              <span>{band.heightLabel ?? `${band.heightMin}–${band.heightMax}cm`}</span>
            </li>
          ))}
        </ul>
      </div>

      {fitProfile.models.length > 1 ? (
        <div className="space-y-2 pt-1">
          <p className="text-[12px] font-light uppercase tracking-[0.12em] text-neutral-600 md:text-[12px]">
            {copy.moreModels}
          </p>
          <ul className="space-y-1">
            {fitProfile.models.slice(1).map((model, index) => (
              <li
                key={`${model.size}-${index}`}
                className="text-[12px] font-light tracking-[0.04em] text-neutral-600 md:text-[12px]"
              >
                {model.heightCm}cm / {model.weightKg}kg / {model.size}
                {model.label ? ` · ${model.label}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

export function ProductModelFitInfo({
  fitProfile,
  collapsible = false,
  collapsibleOnlyMobile = false,
}: ProductModelFitInfoProps) {
  const copy = SITE_UI_COPY.modelFit;
  const primaryModel = fitProfile.models[0];

  if (!primaryModel) {
    return null;
  }

  if (collapsibleOnlyMobile) {
    return (
      <>
        <div className="lg:hidden">
          <details className="group border-0 pt-6">
            <summary className="cursor-pointer list-none text-[11px] font-light uppercase tracking-[0.14em] text-neutral-600 [&::-webkit-details-marker]:hidden">
              <span className="group-open:opacity-60">{copy.sectionLabel}</span>
            </summary>
            <div className="space-y-6 pt-5">
              <ModelFitContent fitProfile={fitProfile} />
            </div>
          </details>
        </div>
        <section
          aria-label={copy.sectionLabel}
          className="hidden space-y-6 border-0 pt-10 sm:pt-12 md:pt-14 lg:block"
        >
          <ModelFitContent fitProfile={fitProfile} />
        </section>
      </>
    );
  }

  if (collapsible) {
    return (
      <details className="group border-0 pt-6">
        <summary className="cursor-pointer list-none text-[11px] font-light uppercase tracking-[0.14em] text-neutral-600 [&::-webkit-details-marker]:hidden">
          <span className="group-open:opacity-60">{copy.sectionLabel}</span>
        </summary>
        <div className="space-y-6 pt-5">
          <ModelFitContent fitProfile={fitProfile} />
        </div>
      </details>
    );
  }

  return (
    <section
      aria-label={copy.sectionLabel}
      className="space-y-6 border-0 pt-10 sm:pt-12 md:pt-14"
    >
      <ModelFitContent fitProfile={fitProfile} />
    </section>
  );
}
