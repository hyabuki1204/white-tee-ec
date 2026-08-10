import { KANEMASA_COPY } from "@/lib/brand/kanemasa";
import type { FabricCharacter } from "@/lib/fabric/character";
import type { Fabric } from "@/lib/fabric/content";
import type { ImagePurpose, ImageSubjectClass } from "@/types/database";

/**
 * The brand context block prepended to every director prompt.
 *
 * Built from live product and fabric data rather than hardcoded prose, so
 * the brief Claude works from stays in step with the catalogue instead of
 * drifting out of date in a string literal.
 *
 * The block is long and stable, which makes it the natural prompt-cache
 * breakpoint. Note the reason: at this volume caching saves on the order of
 * 100 JPY a month, which is nothing — it is worth doing for latency in the
 * admin UI, not for cost (design doc §12.4).
 */

const CHARACTER_LABELS: Record<keyof FabricCharacter, string> = {
  thickness: "thickness",
  softness: "softness",
  structure: "body / structure",
  sheerness: "sheerness",
  surface: "surface texture",
};

/**
 * Translate the 1-5 fabric axes into photographic direction.
 *
 * The numbers mean something to the shop UI but nothing to an image model.
 * What matters for a photograph is how the cloth behaves under light, so
 * the axes are turned into lighting and drape notes.
 */
function describeFabricCharacter(character: FabricCharacter): string[] {
  const notes: string[] = [];

  notes.push(
    `Thickness ${character.thickness}/5, softness ${character.softness}/5, ` +
      `body ${character.structure}/5, sheerness ${character.sheerness}/5, ` +
      `surface ${character.surface}/5.`,
  );

  notes.push(
    character.surface >= 4
      ? "The surface has visible texture; raking light reveals it."
      : "The surface is smooth; it absorbs light rather than catching it.",
  );

  notes.push(
    character.structure >= 4
      ? "It holds its shape, so folds are architectural rather than fluid."
      : "It falls softly, so folds are relaxed and rounded.",
  );

  notes.push(
    character.sheerness >= 4
      ? "It is light enough to glow when backlit."
      : "It is opaque; backlighting reads as a silhouette, not a glow.",
  );

  return notes;
}

export type BrandContextInput = {
  fabric?: Fabric | null;
  product?: {
    name: string;
    material: string;
    fitType: string;
    sleeveType: string;
    fitNote?: string | null;
  } | null;
};

/**
 * The stable half of the system prompt. Cached.
 *
 * Deliberately states what NOT to depict as well as the tone: text baked
 * into the image cannot be edited later, and invented logos on a garment
 * are worse than useless for a brand that does not put logos on garments.
 */
export function buildBrandContext(input: BrandContextInput): string {
  const sections: string[] = [];

  sections.push(
    [
      "<brand>",
      "WHITE TEE is a white T-shirt label. The cloth is knitted at the",
      `Kanemasa factory in Wakayama, Japan, on machines the company has run`,
      "for decades.",
      "",
      `In the brand's own words: "${KANEMASA_COPY.knittedInWakayama}"`,
      `"${KANEMASA_COPY.onOurMachines}"`,
      "",
      "Tone: quiet, unhurried, plenty of empty space. It does not explain",
      "itself, exaggerate, or perform. Closer to a still life than an",
      "advertisement.",
      "",
      "Never depict: invented logos or brand marks, real brands, recognisable",
      "real people, loud saturated colour, cluttered backgrounds, or any",
      "lettering or typography rendered inside the image (copy is laid over",
      "afterwards, and text burnt into a generated image cannot be corrected).",
      "</brand>",
    ].join("\n"),
  );

  if (input.fabric) {
    sections.push(
      [
        `<fabric name="${input.fabric.name}">`,
        input.fabric.tagline,
        ...input.fabric.descriptionLines,
        "",
        ...describeFabricCharacter(input.fabric.character),
        "</fabric>",
      ].join("\n"),
    );
  }

  if (input.product) {
    sections.push(
      [
        `<product name="${input.product.name}">`,
        `Material: ${input.product.material}`,
        `Fit: ${input.product.fitType}, ${input.product.sleeveType} sleeve`,
        ...(input.product.fitNote ? [input.product.fitNote] : []),
        "</product>",
      ].join("\n"),
    );
  }

  return sections.join("\n\n");
}

type PurposeGuidance = {
  aspectRatios: string;
  composition: string;
};

const PURPOSE_GUIDANCE: Record<ImagePurpose, PurposeGuidance> = {
  instagram_teaser: {
    aspectRatios: "4:5 or 1:1",
    composition:
      "Leave clear headroom top and bottom for overlaid copy. The frame must " +
      "hold on its own at thumbnail size.",
  },
  ec_hero: {
    aspectRatios: "16:9 or 3:2",
    composition:
      "Leave copy space on one side. The subject should sit off-centre.",
  },
  product_lp: {
    aspectRatios: "3:4",
    composition: "Closer in. Detail-leaning, but see the subject constraints.",
  },
  journal: {
    aspectRatios: "3:2",
    composition:
      "A wide establishing frame. Place, air and time of day carry it.",
  },
  fabric: {
    aspectRatios: "1:1",
    composition: "Macro. The viewer should be able to imagine the hand-feel.",
  },
};

/**
 * Per-subject-class constraints.
 *
 * This is where the release policy is enforced at the prompt level: for work
 * that will actually ship, Claude is told not to let the viewer draw
 * conclusions about how the garment looks, because a generated garment will
 * not match the real one. The database enforces the same boundary
 * independently (design doc §2.1, §7.7).
 */
const SUBJECT_CONSTRAINTS: Record<ImageSubjectClass, string> = {
  scenery_mood: [
    "The subject is light, air, place and time of day.",
    "Do not make a white T-shirt the subject of the frame. If one appears at",
    "all, keep it far enough away, or soft enough in focus, that its knit,",
    "collar rib and stitching cannot be read.",
    "Nothing in the frame should let a viewer conclude how the garment looks.",
  ].join(" "),
  styling_scene: [
    "A worn scene is fine, but do not move in close.",
    "No close-ups of the collar, shoulder seam or cuff, and no enlarged",
    "fabric surface. Let silhouette and bearing carry the image.",
  ].join(" "),
  product_depiction: [
    "Internal evaluation only; this output will not be published.",
    "You may depict the garment directly.",
  ].join(" "),
  fabric_macro: [
    "Internal evaluation only; this output will not be published.",
    "You may depict the fabric surface directly.",
  ].join(" "),
};

export function buildPurposeGuidance(
  purpose: ImagePurpose,
  subjectClass: ImageSubjectClass,
): string {
  const guidance = PURPOSE_GUIDANCE[purpose];

  return [
    `<purpose id="${purpose}">`,
    `Aspect ratio: ${guidance.aspectRatios}`,
    guidance.composition,
    "</purpose>",
    "",
    `<subject_constraints class="${subjectClass}">`,
    SUBJECT_CONSTRAINTS[subjectClass],
    "</subject_constraints>",
  ].join("\n");
}
