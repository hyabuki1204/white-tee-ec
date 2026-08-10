import { ASPECT_RATIOS } from "@/lib/images/providers/types";

/**
 * JSON schemas for the director's structured output.
 *
 * Passed as output_config.format so the API constrains generation to the
 * schema rather than asking for JSON in prose and hoping. Raw JSON Schema
 * rather than Zod, to avoid adding a runtime dependency for something used
 * on two call sites.
 *
 * Structured outputs require additionalProperties: false and an explicit
 * required list on every object.
 */

export type ConceptDraft = {
  title: string;
  rationale: string;
  subject: string;
  composition: string;
  lighting: string;
  colorPalette: string[];
  styling: string;
  environment: string;
  moodKeywords: string[];
  avoid: string[];
  aspectRatio: string;
  usageNote: string;
};

export type ConceptsOutput = {
  concepts: ConceptDraft[];
};

export const CONCEPTS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["concepts"],
  properties: {
    concepts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "rationale",
          "subject",
          "composition",
          "lighting",
          "colorPalette",
          "styling",
          "environment",
          "moodKeywords",
          "avoid",
          "aspectRatio",
          "usageNote",
        ],
        properties: {
          title: { type: "string" },
          // Why this concept answers the brief. The reviewer picks from
          // these, so it is written for a human, not for the image model.
          rationale: { type: "string" },
          subject: { type: "string" },
          composition: { type: "string" },
          lighting: { type: "string" },
          colorPalette: { type: "array", items: { type: "string" } },
          styling: { type: "string" },
          environment: { type: "string" },
          moodKeywords: { type: "array", items: { type: "string" } },
          avoid: { type: "array", items: { type: "string" } },
          aspectRatio: { type: "string", enum: [...ASPECT_RATIOS] },
          usageNote: { type: "string" },
        },
      },
    },
  },
} as const;

export type RenderSpecOutput = {
  basePrompt: string;
  negative: string[];
  aspectRatio: string;
  stylization: number;
  variation: number;
  detailLevel: "low" | "standard" | "high";
  reasoning: string;
};

/**
 * Note what is absent: no provider flags, no "--ar", no vendor vocabulary.
 * Claude emits normalized values and the adapter renders them, which is
 * what lets a stored prompt outlive the provider it was written for.
 */
export const RENDER_SPEC_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "basePrompt",
    "negative",
    "aspectRatio",
    "stylization",
    "variation",
    "detailLevel",
    "reasoning",
  ],
  properties: {
    basePrompt: {
      type: "string",
      description:
        "English description of the image. No parameters or provider flags.",
    },
    negative: { type: "array", items: { type: "string" } },
    aspectRatio: { type: "string", enum: [...ASPECT_RATIOS] },
    stylization: {
      type: "number",
      description: "0.0-1.0 normalized stylization strength.",
    },
    variation: {
      type: "number",
      description: "0.0-1.0 normalized variation between outputs.",
    },
    detailLevel: { type: "string", enum: ["low", "standard", "high"] },
    reasoning: {
      type: "string",
      description: "Why this rendering, for the human reviewer.",
    },
  },
} as const;
