import "server-only";

import {
  extractStructuredOutput,
  extractUsage,
  getClaudeClient,
  QA_MODEL,
  type ClaudeMessagesClient,
  type ClaudeUsage,
} from "@/lib/images/director/client";
import {
  buildBrandContext,
  type BrandContextInput,
} from "@/lib/images/director/context";
import type { ImageSubjectClass } from "@/types/database";

/**
 * Stage 3: look at what came back.
 *
 * Sorts and annotates the review queue so the reviewer's attention lands on
 * the right images first. It does NOT decide anything: a "reject" verdict
 * can still be approved by a human and a "recommend" can still be thrown
 * out. Wiring this to auto-approval would remove the only gate in the
 * system, which is the one thing the design will not do.
 *
 * See docs/image-generation-workflow.md §5.5.
 */

const MAX_TOKENS = 2000;

/**
 * Images are downscaled before sending.
 *
 * Full-resolution images cost up to ~4,784 input tokens each; at four
 * variants per job that dominates the entire Claude bill for the pipeline.
 * Judging composition, blown highlights and obvious artefacts does not need
 * that resolution.
 */
export const QA_MAX_IMAGE_BYTES = 1_500_000;

const QA_INSTRUCTIONS = [
  "You are reviewing a generated image before a human sees it.",
  "",
  "Your job is to surface what the reviewer should look at, not to decide.",
  "A human makes the call regardless of what you return.",
  "",
  "Judge against the brand and the brief you are given, and be specific:",
  "'the highlight on the upper left is blown out' is useful, 'the lighting",
  "feels off' is not.",
  "",
  "white_reproduction matters more here than for most brands. This is a",
  "white T-shirt label: whites that have gone grey, blue, or blown out to",
  "pure paper with no gradation are a real defect, not a nitpick.",
  "",
  "Mark an issue as a blocker only if it makes the image unusable:",
  "rendered text, an invented logo, a malformed hand, an impossible seam.",
  "Everything else is minor.",
  "",
  "Write alt_text_ja as natural Japanese describing what is visible, for a",
  "reader who cannot see the image. Not marketing copy.",
].join("\n");

export type QaOutput = {
  verdict: "recommend" | "borderline" | "reject";
  scores: {
    brandFit: number;
    whiteReproduction: number;
    fabricPlausibility: number;
    artifacts: number;
    commercialUsability: number;
  };
  issues: Array<{ severity: "blocker" | "minor"; description: string }>;
  altTextJa: string;
  altTextEn: string;
  captionDraft: string;
  retouchNotes: string[];
};

const QA_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "verdict",
    "scores",
    "issues",
    "altTextJa",
    "altTextEn",
    "captionDraft",
    "retouchNotes",
  ],
  properties: {
    verdict: { type: "string", enum: ["recommend", "borderline", "reject"] },
    scores: {
      type: "object",
      additionalProperties: false,
      required: [
        "brandFit",
        "whiteReproduction",
        "fabricPlausibility",
        "artifacts",
        "commercialUsability",
      ],
      properties: {
        brandFit: { type: "integer" },
        // Low means the whites are wrong, not that there is little white.
        whiteReproduction: { type: "integer" },
        fabricPlausibility: { type: "integer" },
        // Low means visible artefacts.
        artifacts: { type: "integer" },
        commercialUsability: { type: "integer" },
      },
    },
    issues: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["severity", "description"],
        properties: {
          severity: { type: "string", enum: ["blocker", "minor"] },
          description: { type: "string" },
        },
      },
    },
    altTextJa: { type: "string" },
    altTextEn: { type: "string" },
    captionDraft: { type: "string" },
    retouchNotes: { type: "array", items: { type: "string" } },
  },
} as const;

export type ReviewImageParams = {
  imageBase64: string;
  mediaType: "image/png" | "image/jpeg" | "image/webp";
  briefIntent: string;
  conceptTitle: string;
  subjectClass: ImageSubjectClass;
  context: BrandContextInput;
  client?: ClaudeMessagesClient;
};

export type ReviewImageResult = {
  qa: QaOutput;
  usage: ClaudeUsage;
};

export async function reviewGeneratedImage(
  params: ReviewImageParams,
): Promise<ReviewImageResult> {
  const client = params.client ?? getClaudeClient();

  const message = await client.beta.messages.create({
    model: QA_MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      {
        type: "text",
        text: `${QA_INSTRUCTIONS}\n\n${buildBrandContext(params.context)}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: params.mediaType,
              data: params.imageBase64,
            },
          },
          {
            type: "text",
            text: [
              `<brief_intent>${params.briefIntent}</brief_intent>`,
              `<concept>${params.conceptTitle}</concept>`,
              `<subject_class>${params.subjectClass}</subject_class>`,
            ].join("\n"),
          },
        ],
      },
    ],
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: QA_SCHEMA },
    },
  });

  return {
    qa: extractStructuredOutput<QaOutput>(message),
    usage: extractUsage(message),
  };
}

/**
 * True when a human should look at this one first.
 * Used only for ordering the queue.
 */
export function shouldSurfaceFirst(qa: QaOutput): boolean {
  return (
    qa.verdict === "recommend" &&
    !qa.issues.some((issue) => issue.severity === "blocker")
  );
}
