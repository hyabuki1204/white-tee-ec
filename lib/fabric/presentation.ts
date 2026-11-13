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
  "28g-jersey": {
    taglineTracking: "tracking-[0.05em]",
  },
  "36g-jersey": {
    taglineTracking: "tracking-[0.03em]",
  },
  "46g-jersey": {
    taglineTracking: "tracking-[0.07em]",
  },
};

export function getFabricPresentation(slug: string): FabricPresentation {
  return {
    ...DEFAULT_PRESENTATION,
    ...FABRIC_PRESENTATION_BY_SLUG[slug],
  };
}
