import "server-only";

import {
  DIRECTOR_MODEL,
  extractStructuredOutput,
  extractUsage,
  FALLBACK_BETA,
  getClaudeClient,
  type ClaudeMessagesClient,
  type ClaudeUsage,
} from "@/lib/images/director/client";
import {
  buildBrandContext,
  buildPurposeGuidance,
  type BrandContextInput,
} from "@/lib/images/director/context";
import {
  assertNoBannedTerms,
  findUnreleasedInfoWarnings,
} from "@/lib/images/director/guardrails";
import {
  CONCEPTS_SCHEMA,
  type ConceptDraft,
  type ConceptsOutput,
} from "@/lib/images/director/schemas";
import type { AdminImageBriefDetail } from "@/types/admin-image";

/**
 * Stage 1: brief to concepts.
 *
 * The creative step, and the only one on Opus. It runs before any image is
 * generated, which is the point: rejecting a concept here costs a few yen,
 * rejecting a rendered image costs the generation too.
 *
 * See docs/image-generation-workflow.md §5.3.
 */

const MAX_TOKENS = 8000;

const DIRECTOR_INSTRUCTIONS = [
  "You are the creative director for WHITE TEE.",
  "",
  "Propose distinct visual concepts for one brief. Distinct means they",
  "differ in idea, not in wording: a different time of day, a different",
  "distance, a different subject. Two concepts that would produce similar",
  "photographs count as one.",
  "",
  "Write each concept as direction for a photographer, in concrete visual",
  "terms. 'Low winter sun through a north window' is direction; 'a beautiful",
  "atmospheric scene' is not.",
  "",
  "The rationale field is read by a human choosing between your concepts.",
  "Say what this one does for the brief that the others do not.",
  "",
  "Obey the subject constraints exactly. They decide whether the image can",
  "be published at all, and are enforced elsewhere regardless of what you",
  "return.",
].join("\n");

export type GenerateConceptsParams = {
  brief: AdminImageBriefDetail;
  context: BrandContextInput;
  count?: number;
  /** Reviewer feedback, when regenerating after a rejection. */
  revisionNotes?: string;
  client?: ClaudeMessagesClient;
};

export type GenerateConceptsResult = {
  concepts: ConceptDraft[];
  usage: ClaudeUsage;
  warnings: string[];
};

export async function generateConcepts(
  params: GenerateConceptsParams,
): Promise<GenerateConceptsResult> {
  const { brief, context, count = 4, revisionNotes } = params;

  assertNoBannedTerms(brief.intent, "brief");
  assertNoBannedTerms(brief.title, "brief");

  const warnings = findUnreleasedInfoWarnings(brief.intent);
  const client = params.client ?? getClaudeClient();

  const brandContext = buildBrandContext(context);
  const purposeGuidance = buildPurposeGuidance(
    brief.purpose,
    brief.subjectClass,
  );

  const userParts = [
    `<brief title="${brief.title}">`,
    brief.intent,
    "</brief>",
    "",
    purposeGuidance,
    "",
    `Propose exactly ${count} concepts.`,
  ];

  if (revisionNotes) {
    userParts.push(
      "",
      "<revision_notes>",
      "A previous round was rejected for the reasons below. Address them;",
      "do not simply reword the earlier concepts.",
      revisionNotes,
      "</revision_notes>",
    );
  }

  const message = await client.beta.messages.create({
    model: DIRECTOR_MODEL,
    max_tokens: MAX_TOKENS,
    betas: [FALLBACK_BETA],
    fallbacks: "default",
    system: [
      {
        type: "text",
        text: `${DIRECTOR_INSTRUCTIONS}\n\n${brandContext}`,
        // Stable across every brief for a given fabric, so it is the
        // cache breakpoint. Everything varying sits after it, in the user
        // turn, where it cannot invalidate the prefix.
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userParts.join("\n") }],
    output_config: {
      effort: "high",
      format: { type: "json_schema", schema: CONCEPTS_SCHEMA },
    },
  });

  const output = extractStructuredOutput<ConceptsOutput>(message);

  // Structured outputs constrain the shape, not the content: a concept
  // could still name something the guardrails forbid.
  for (const concept of output.concepts) {
    assertNoBannedTerms(
      [concept.subject, concept.styling, concept.environment].join(" "),
      "prompt",
    );
  }

  return {
    concepts: output.concepts,
    usage: extractUsage(message),
    warnings,
  };
}
