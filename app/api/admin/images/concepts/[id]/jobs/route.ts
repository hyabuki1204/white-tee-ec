import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { AdminAuthError, requireAdminSession } from "@/lib/admin/auth";
import {
  getAdminImageBrief,
  saveConceptRenderSpec,
} from "@/lib/db/images/admin-repository";
import { getImageConcept } from "@/lib/db/images/repository";
import { buildBriefContext } from "@/lib/images/director/brief-context";
import { isClaudeConfigured } from "@/lib/images/director/client";
import {
  buildRenderSpec,
  toGenerationRequest,
} from "@/lib/images/director/render-spec";
import type { ConceptDraft } from "@/lib/images/director/schemas";
import {
  BudgetExceededError,
  enqueueGenerationJob,
} from "@/lib/images/jobs/enqueue";
import { attemptIdempotencyKey } from "@/lib/images/jobs/generation-request";
import { getImageProvider } from "@/lib/images/providers/registry";

/**
 * Stage 2 of the director, plus the job that follows it: turn a concept
 * into a provider request and queue it.
 *
 * The render spec is stored on the concept before the job is created, so a
 * failure to enqueue does not throw away a Claude call that was already
 * billed — a retry reuses the stored spec instead of paying for a new one.
 *
 * Queuing does not generate anything by itself. The runner picks the job
 * up on the next tick, which is what actually spends money with the image
 * provider.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

type JobRequestBody = {
  variantCount?: number;
  seed?: number;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();

    const { id } = await params;
    const concept = await getImageConcept(id);

    if (!concept) {
      return NextResponse.json({ error: "Concept not found." }, { status: 404 });
    }

    const brief = await getAdminImageBrief(concept.briefId);

    if (!brief) {
      return NextResponse.json({ error: "Brief not found." }, { status: 404 });
    }

    const provider = getImageProvider();
    const body = (await request.json().catch(() => ({}))) as JobRequestBody;
    const variantCount = Math.min(
      Math.max(body.variantCount ?? brief.desiredVariantCount, 1),
      provider.capabilities.maxVariants,
    );

    // An override set by hand wins over anything Claude produced; a spec
    // stored by an earlier attempt is reused rather than regenerated.
    let spec = (concept.renderSpecOverride ??
      concept.renderSpec) as Record<string, unknown> | null;

    if (!spec) {
      if (!isClaudeConfigured()) {
        return NextResponse.json(
          { error: "ANTHROPIC_API_KEY is not configured." },
          { status: 503 },
        );
      }

      const context = await buildBriefContext(brief);
      const built = await buildRenderSpec({
        concept: concept.concept as unknown as ConceptDraft,
        context,
        capabilities: provider.capabilities,
      });

      spec = built.spec as unknown as Record<string, unknown>;
      await saveConceptRenderSpec(concept.id, spec);
    }

    const generationRequest = toGenerationRequest({
      spec: spec as unknown as Parameters<
        typeof toGenerationRequest
      >[0]["spec"],
      capabilities: provider.capabilities,
      variantCount,
      idempotencyKey: attemptIdempotencyKey(randomUUID(), 0),
      seed: body.seed,
    });

    const job = await enqueueGenerationJob({
      conceptId: concept.id,
      request: generationRequest,
    });

    return NextResponse.json({ job, prompt: generationRequest.basePrompt });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof BudgetExceededError) {
      return NextResponse.json({ error: error.message }, { status: 402 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to queue the job.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
