import "server-only";

import {
  extractStructuredOutput,
  extractUsage,
  getClaudeClient,
  PROMPT_ENGINEER_MODEL,
  type ClaudeMessagesClient,
  type ClaudeUsage,
} from "@/lib/images/director/client";
import {
  buildBrandContext,
  type BrandContextInput,
} from "@/lib/images/director/context";
import { assertNoBannedTerms } from "@/lib/images/director/guardrails";
import {
  RENDER_SPEC_SCHEMA,
  type ConceptDraft,
  type RenderSpecOutput,
} from "@/lib/images/director/schemas";
import type {
  AspectRatio,
  GenerationRequest,
  ProviderCapabilities,
} from "@/lib/images/providers/types";

/**
 * Stage 2: concept to RenderSpec.
 *
 * The load-bearing rule is what Claude is NOT asked for. It never writes
 * provider syntax — no "--ar 4:5", no "--stylize 250" — only normalized
 * values that each adapter maps onto its own scale. That is what makes a
 * provider swap a one-file change instead of a rewrite of every stored
 * prompt, which matters here because the image-generation market turns
 * over fast.
 *
 * Runs on Sonnet: this step is format-following, not creative.
 *
 * See docs/image-generation-workflow.md §5.4.
 */

const MAX_TOKENS = 4000;

const ENGINEER_INSTRUCTIONS = [
  "You turn an approved visual concept into a rendering specification for",
  "an image generation model.",
  "",
  "Write basePrompt as a single English description of the finished",
  "photograph: subject, composition, light, setting, mood. Concrete and",
  "visual throughout.",
  "",
  "Never write provider syntax. No flags, no '--ar', no '--stylize', no",
  "vendor keywords. Aspect ratio and strength values belong in their own",
  "fields; a different provider will render them differently.",
  "",
  "stylization: 0.0 is documentary and literal, 1.0 is heavily stylised.",
  "This brand sits low — around 0.3 to 0.5.",
  "variation: how much the outputs should differ from each other. Keep it",
  "low unless the brief asks for range.",
  "",
  "negative should list what must not appear. Always include rendered text",
  "and invented logos.",
].join("\n");

export type BuildRenderSpecParams = {
  concept: ConceptDraft;
  context: BrandContextInput;
  capabilities: ProviderCapabilities;
  client?: ClaudeMessagesClient;
};

export type BuildRenderSpecResult = {
  spec: RenderSpecOutput;
  usage: ClaudeUsage;
};

export async function buildRenderSpec(
  params: BuildRenderSpecParams,
): Promise<BuildRenderSpecResult> {
  const { concept, context, capabilities } = params;
  const client = params.client ?? getClaudeClient();

  const conceptBlock = [
    "<concept>",
    `Title: ${concept.title}`,
    `Subject: ${concept.subject}`,
    `Composition: ${concept.composition}`,
    `Lighting: ${concept.lighting}`,
    `Styling: ${concept.styling}`,
    `Environment: ${concept.environment}`,
    `Palette: ${concept.colorPalette.join(", ")}`,
    `Mood: ${concept.moodKeywords.join(", ")}`,
    `Avoid: ${concept.avoid.join(", ")}`,
    `Intended aspect ratio: ${concept.aspectRatio}`,
    "</concept>",
  ].join("\n");

  // Telling Claude what the provider supports stops it choosing an aspect
  // ratio the adapter would then have to silently coerce.
  const capabilityBlock = [
    "<provider_capabilities>",
    `Supported aspect ratios: ${capabilities.supportedAspectRatios.join(", ")}`,
    `Negative prompts supported: ${capabilities.supportsNegativePrompt}`,
    `Seed supported: ${capabilities.supportsSeed}`,
    "</provider_capabilities>",
  ].join("\n");

  const message = await client.beta.messages.create({
    model: PROMPT_ENGINEER_MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      {
        type: "text",
        text: `${ENGINEER_INSTRUCTIONS}\n\n${buildBrandContext(context)}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      { role: "user", content: `${conceptBlock}\n\n${capabilityBlock}` },
    ],
    output_config: {
      // Format-following rather than open-ended: medium is enough, and
      // this stage runs once per approved concept.
      effort: "medium",
      format: { type: "json_schema", schema: RENDER_SPEC_SCHEMA },
    },
  });

  const spec = extractStructuredOutput<RenderSpecOutput>(message);

  assertNoBannedTerms(spec.basePrompt, "prompt");

  return { spec, usage: extractUsage(message) };
}

/**
 * Turn a RenderSpec into the request the job will store and submit.
 *
 * Coerces rather than trusts: an unsupported aspect ratio falls back to the
 * provider's first supported one, and strengths are clamped. Structured
 * outputs constrain the schema but the enum could still name a ratio this
 * particular provider lacks.
 */
export function toGenerationRequest(params: {
  spec: RenderSpecOutput;
  capabilities: ProviderCapabilities;
  variantCount: number;
  idempotencyKey: string;
  seed?: number;
}): GenerationRequest {
  const { spec, capabilities, variantCount, idempotencyKey, seed } = params;

  const aspectRatio = capabilities.supportedAspectRatios.includes(
    spec.aspectRatio as AspectRatio,
  )
    ? (spec.aspectRatio as AspectRatio)
    : capabilities.supportedAspectRatios[0];

  const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

  return {
    idempotencyKey,
    basePrompt: spec.basePrompt,
    negative: capabilities.supportsNegativePrompt ? spec.negative : [],
    aspectRatio,
    stylization: clamp(spec.stylization),
    variation: clamp(spec.variation),
    detailLevel: spec.detailLevel,
    variantCount: Math.min(variantCount, capabilities.maxVariants),
    ...(seed !== undefined && capabilities.supportsSeed ? { seed } : {}),
  };
}
