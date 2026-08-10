import "server-only";

import { mapImageJobRow } from "@/lib/db/images/mapper";
import { allowedSourceStatuses } from "@/lib/images/jobs/state-machine";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AdminImageJob } from "@/types/admin-image";
import type {
  ImageErrorCategory,
  ImageGenerationJobRow,
  ImageGenerationResultInsert,
  ImageJobStatus,
  ImageProviderEventSource,
  Json,
} from "@/types/database";

/**
 * Write paths for the job state machine.
 *
 * Every status change goes through transitionJob(), which puts the legal
 * source states into the WHERE clause. A read-then-write would leave a
 * window for a concurrent worker or a redelivered webhook to slip between
 * the check and the update; this way the database decides, and a rejected
 * transition simply matches no rows.
 */

export type TransitionResult =
  | { applied: true; job: AdminImageJob }
  | { applied: false; reason: "guard_rejected" };

type JobPatch = Partial<
  Pick<
    ImageGenerationJobRow,
    | "provider_job_id"
    | "submitted_prompt"
    | "submitted_params"
    | "attempt_count"
    | "next_attempt_at"
    | "claimed_by"
    | "claimed_at"
    | "lease_expires_at"
    | "error_category"
    | "error_code"
    | "error_message"
    | "estimated_cost_jpy"
    | "actual_cost_jpy"
    | "submitted_at"
    | "completed_at"
  >
>;

export async function transitionJob(
  jobId: string,
  to: ImageJobStatus,
  patch: JobPatch = {},
): Promise<TransitionResult> {
  if (!isSupabaseConfigured()) {
    throw new Error("Cannot transition job: Supabase is not configured.");
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("image_generation_jobs")
    .update({ status: to, ...patch })
    .eq("id", jobId)
    // The guard. A late webhook targeting a terminal job matches nothing.
    .in("status", [...allowedSourceStatuses(to)])
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to transition job to ${to}: ${error.message}`);
  }

  if (!data) {
    return { applied: false, reason: "guard_rejected" };
  }

  return { applied: true, job: mapImageJobRow(data) };
}

/** Release a lease without changing status, so another worker can pick it up. */
export async function releaseJobLease(jobId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("image_generation_jobs")
    .update({ claimed_by: null, claimed_at: null, lease_expires_at: null })
    .eq("id", jobId);

  if (error) {
    throw new Error(`Failed to release job lease: ${error.message}`);
  }
}

/**
 * Reclaim leases held by workers that died mid-job.
 * Returns how many were freed.
 */
export async function releaseExpiredLeases(now = new Date()): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("image_generation_jobs")
    .update({ claimed_by: null, claimed_at: null, lease_expires_at: null })
    .lt("lease_expires_at", now.toISOString())
    .not("status", "in", "(stored,failed,cancelled,expired)")
    .select("id");

  if (error) {
    throw new Error(`Failed to release expired leases: ${error.message}`);
  }

  return (data ?? []).length;
}

/**
 * Retire jobs that outlived expires_at.
 * A provider that never answers would otherwise leave a job leased,
 * re-leased and polled forever.
 */
export async function expireStaleJobs(now = new Date()): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("image_generation_jobs")
    .update({
      status: "expired",
      completed_at: now.toISOString(),
      error_category: "transient" satisfies ImageErrorCategory,
      error_code: "expired",
      error_message: "Job exceeded its maximum lifetime.",
      claimed_by: null,
      claimed_at: null,
      lease_expires_at: null,
    })
    .lt("expires_at", now.toISOString())
    .not("status", "in", "(stored,failed,cancelled,expired)")
    .select("id");

  if (error) {
    throw new Error(`Failed to expire stale jobs: ${error.message}`);
  }

  return (data ?? []).length;
}

export async function insertImageResults(
  rows: ImageGenerationResultInsert[],
): Promise<void> {
  if (rows.length === 0) {
    return;
  }

  if (!isSupabaseConfigured()) {
    throw new Error("Cannot insert image results: Supabase is not configured.");
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("image_generation_results")
    .upsert(rows, { onConflict: "job_id,variant_index" });

  if (error) {
    throw new Error(`Failed to insert image results: ${error.message}`);
  }
}

/**
 * Append a raw provider payload.
 *
 * Doubles as webhook dedupe: a redelivery collides on the
 * (provider, provider_event_id) unique index and returns false, so the
 * caller can no-op instead of processing the same event twice.
 */
export async function recordProviderEvent(params: {
  jobId: string | null;
  provider: string;
  providerEventId?: string | null;
  source: ImageProviderEventSource;
  payload: unknown;
}): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return true;
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("image_provider_events").insert({
    job_id: params.jobId,
    provider: params.provider,
    provider_event_id: params.providerEventId ?? null,
    source: params.source,
    payload: (params.payload ?? {}) as Json,
  });

  if (!error) {
    return true;
  }

  // 23505 = unique_violation: this event has already been recorded.
  if (error.code === "23505") {
    return false;
  }

  throw new Error(`Failed to record provider event: ${error.message}`);
}

export async function recordCost(params: {
  jobId: string | null;
  kind: "claude" | "image_provider";
  provider: string;
  amountJpy: number;
  detail?: Record<string, unknown>;
}): Promise<void> {
  if (!isSupabaseConfigured() || params.amountJpy === 0) {
    return;
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("image_cost_ledger").insert({
    job_id: params.jobId,
    kind: params.kind,
    provider: params.provider,
    amount_jpy: params.amountJpy,
    detail: (params.detail ?? {}) as Json,
  });

  if (error) {
    throw new Error(`Failed to record cost: ${error.message}`);
  }
}

export async function findJobByProviderJobId(
  provider: string,
  providerJobId: string,
): Promise<AdminImageJob | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("image_generation_jobs")
    .select("*")
    .eq("provider", provider)
    .eq("provider_job_id", providerJobId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to look up job: ${error.message}`);
  }

  return data ? mapImageJobRow(data) : null;
}
