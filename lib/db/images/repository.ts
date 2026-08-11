import "server-only";

import {
  mapImageConceptRow,
  mapImageJobRow,
  mapImageResultRow,
} from "@/lib/db/images/mapper";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  AdminImageConcept,
  AdminImageJob,
  AdminImageResult,
} from "@/types/admin-image";
import type { ImageJobStatus } from "@/types/database";

/**
 * Read paths shared by the admin UI and the job worker.
 * Write paths for admin operations live in admin-repository.ts.
 */

export async function listImageConcepts(
  briefId: string,
): Promise<AdminImageConcept[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("image_concepts")
    .select("*")
    .eq("brief_id", briefId)
    .order("revision", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to list image concepts: ${error.message}`);
  }

  return (data ?? []).map(mapImageConceptRow);
}

export async function getImageConcept(
  id: string,
): Promise<AdminImageConcept | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("image_concepts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch image concept: ${error.message}`);
  }

  return data ? mapImageConceptRow(data) : null;
}

export async function listImageJobs(
  conceptId: string,
): Promise<AdminImageJob[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("image_generation_jobs")
    .select("*")
    .eq("concept_id", conceptId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to list image jobs: ${error.message}`);
  }

  return (data ?? []).map(mapImageJobRow);
}

export async function getImageJob(id: string): Promise<AdminImageJob | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("image_generation_jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch image job: ${error.message}`);
  }

  return data ? mapImageJobRow(data) : null;
}

export async function listImageResults(
  jobId: string,
): Promise<AdminImageResult[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("image_generation_results")
    .select("*")
    .eq("job_id", jobId)
    .order("variant_index", { ascending: true });

  if (error) {
    throw new Error(`Failed to list image results: ${error.message}`);
  }

  return (data ?? []).map(mapImageResultRow);
}

/**
 * Lease jobs for a worker.
 *
 * Wraps the claim_image_jobs() Postgres function, which does the work under
 * SELECT ... FOR UPDATE SKIP LOCKED. The Supabase client cannot express row
 * locking directly, so overlapping cron runs would otherwise double-process
 * the same job.
 *
 * The caller owns the lease until leaseSeconds elapses; a worker that dies
 * mid-job simply lets the lease expire and another picks the job back up.
 */
export async function claimImageJobs(
  workerId: string,
  statuses: ImageJobStatus[],
  limit = 5,
  leaseSeconds = 120,
): Promise<AdminImageJob[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.rpc("claim_image_jobs", {
    p_worker_id: workerId,
    p_statuses: statuses,
    p_limit: limit,
    p_lease_seconds: leaseSeconds,
  });

  if (error) {
    throw new Error(`Failed to claim image jobs: ${error.message}`);
  }

  return (data ?? []).map(mapImageJobRow);
}

/**
 * Month-to-date spend used by the budget circuit breaker.
 * Counts both Claude calls and image provider calls.
 */
export async function getMonthlyImageSpendJpy(
  now: Date = new Date(),
): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("image_cost_ledger")
    .select("amount_jpy")
    .gte("occurred_at", monthStart.toISOString());

  if (error) {
    throw new Error(`Failed to read image cost ledger: ${error.message}`);
  }

  return (data ?? []).reduce(
    (total, row) => total + Number(row.amount_jpy),
    0,
  );
}
