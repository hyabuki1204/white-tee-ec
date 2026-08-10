import "server-only";

import { recordCost } from "@/lib/db/images/job-repository";
import { getMonthlyImageSpendJpy } from "@/lib/db/images/repository";
import {
  BUDGET_WARNING_RATIO,
  getMonthlyBudgetJpy,
} from "@/lib/images/env";
import {
  attemptIdempotencyKey,
  serializeGenerationRequest,
} from "@/lib/images/jobs/generation-request";
import { getImageProvider } from "@/lib/images/providers/registry";
import type { GenerationRequest } from "@/lib/images/providers/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AdminImageBudgetStatus } from "@/types/admin-image";
import type { Json } from "@/types/database";

/**
 * Enqueuing generation jobs.
 *
 * The HTTP request that starts a generation only writes a row and returns.
 * Nothing waits on the provider: a Midjourney-class model takes tens of
 * seconds to minutes, which does not fit a serverless invocation and would
 * freeze the admin UI regardless.
 *
 * This is also where the budget is enforced. Checking at enqueue rather
 * than at submit means an over-budget run never creates work at all.
 */

export class BudgetExceededError extends Error {
  readonly status = 402;

  constructor(message: string) {
    super(message);
    this.name = "BudgetExceededError";
  }
}

export async function getBudgetStatus(): Promise<AdminImageBudgetStatus> {
  const monthlyLimitJpy = getMonthlyBudgetJpy();
  const spentJpy = await getMonthlyImageSpendJpy();
  const ratio = monthlyLimitJpy === 0 ? 0 : spentJpy / monthlyLimitJpy;

  return {
    monthlyLimitJpy,
    spentJpy,
    ratio,
    state:
      ratio >= 1 ? "exceeded" : ratio >= BUDGET_WARNING_RATIO ? "warning" : "ok",
  };
}

export type EnqueueJobParams = {
  conceptId: string;
  request: GenerationRequest;
  /** Overrides the provider registry. Used when replaying onto another one. */
  providerId?: string;
};

export type EnqueuedJob = {
  id: string;
  provider: string;
  idempotencyKey: string;
  estimatedCostJpy: number;
};

export async function enqueueGenerationJob(
  params: EnqueueJobParams,
): Promise<EnqueuedJob> {
  if (!isSupabaseConfigured()) {
    throw new Error("Cannot enqueue job: Supabase is not configured.");
  }

  const budget = await getBudgetStatus();

  if (budget.state === "exceeded") {
    throw new BudgetExceededError(
      `Monthly image budget of ${budget.monthlyLimitJpy} JPY is exhausted ` +
        `(${Math.round(budget.spentJpy)} JPY spent). Raise ` +
        "IMAGE_MONTHLY_BUDGET_JPY or wait for the next month.",
    );
  }

  const provider = getImageProvider();
  const built = provider.buildPrompt(params.request);
  const estimatedCostJpy = provider.estimateCostJpy(params.request);

  const supabase = createSupabaseAdminClient();

  // Attempt 0's key. Retries within an attempt reuse it; advancing the
  // attempt mints a new one (generation-request.ts).
  const { data: inserted, error } = await supabase
    .from("image_generation_jobs")
    .insert({
      concept_id: params.conceptId,
      provider: params.providerId ?? provider.id,
      submitted_prompt: built.prompt,
      submitted_params: serializeGenerationRequest(
        params.request,
      ) as unknown as Json,
      requested_variant_count: params.request.variantCount,
      seed: params.request.seed ?? null,
      idempotency_key: attemptIdempotencyKey(crypto.randomUUID(), 0),
      estimated_cost_jpy: estimatedCostJpy,
    })
    .select("id, provider, idempotency_key, estimated_cost_jpy")
    .single();

  if (error) {
    throw new Error(`Failed to enqueue generation job: ${error.message}`);
  }

  // The estimate is recorded now so the budget reflects committed work
  // rather than only what has already completed; the actual cost replaces
  // it when the provider reports one.
  await recordCost({
    jobId: inserted.id,
    kind: "image_provider",
    provider: inserted.provider,
    amountJpy: estimatedCostJpy,
    detail: { estimate: true },
  });

  return {
    id: inserted.id,
    provider: inserted.provider,
    idempotencyKey: inserted.idempotency_key,
    estimatedCostJpy: Number(inserted.estimated_cost_jpy),
  };
}
