/** Shared crop box for all fabric thumbnails and inline fabric images. */
export const FABRIC_IMAGE_ASPECT = "aspect-[4/3]";

export type FabricPresentation = {
  heroImagePosition: string;
  taglineTracking: string;
};

const DEFAULT_PRESENTATION: FabricPresentation = {
  heroImagePosition: "object-center",
  taglineTracking: "tracking-[0.03em]",
};

/** Per-fabric typography and hero crop only — card size stays uniform. */
export const FABRIC_PRESENTATION_BY_SLUG: Record<
  string,
  Partial<FabricPresentation>
> = {
  "heavyweight-jersey": {
    heroImagePosition: "object-[center_40%]",
    taglineTracking: "tracking-[0.05em]",
  },
  "lightweight-jersey": {
    heroImagePosition: "object-[center_26%]",
    taglineTracking: "tracking-[0.07em]",
  },
  "relaxed-jersey": {
    heroImagePosition: "object-[center_35%]",
    taglineTracking: "tracking-[0.04em]",
  },
  "compact-jersey": {
    heroImagePosition: "object-[center_45%]",
    taglineTracking: "tracking-[0.06em]",
  },
  "essential-jersey": {
    taglineTracking: "tracking-[0.03em]",
  },
  "box-jersey": {
    heroImagePosition: "object-[center_48%]",
    taglineTracking: "tracking-[0.05em]",
  },
};

export function getFabricPresentation(slug: string): FabricPresentation {
  return {
    ...DEFAULT_PRESENTATION,
    ...FABRIC_PRESENTATION_BY_SLUG[slug],
  };
}
