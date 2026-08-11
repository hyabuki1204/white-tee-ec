import "server-only";

import { mapImageJobRow } from "@/lib/db/images/mapper";
import { recordProviderEvent } from "@/lib/db/images/job-repository";
import { runImageTick } from "@/lib/images/jobs/runner";
import { fluxImageProvider, fluxJobContainsSubId } from "@/lib/images/providers/flux";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AdminImageJob } from "@/types/admin-image";
import type { ImageGenerationJobRow, Json } from "@/types/database";

/**
 * Provider webhook intake.
 *
 * FLUX delivers one webhook per variant. We verify + record the event,
 * locate the composite job that owns that sub-id when possible, and run a
 * normal tick so poll/ingest reassemble without a second state machine.
 */

async function listActiveFluxJobs(): Promise<AdminImageJob[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("image_generation_jobs")
    .select("*")
    .eq("provider", "flux_bfl")
    .in("status", ["submitted", "running", "succeeded"])
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to list active FLUX jobs: ${error.message}`);
  }

  return ((data ?? []) as ImageGenerationJobRow[]).map(mapImageJobRow);
}

export async function handleImageProviderWebhook(params: {
  providerId: string;
  headers: Headers;
  rawBody: string;
}): Promise<{ ok: true; matched: boolean }> {
  if (params.providerId !== "flux_bfl") {
    throw new Error(`Unsupported image provider webhook: ${params.providerId}`);
  }

  const parsed = await fluxImageProvider.parseWebhook(
    params.headers,
    params.rawBody,
  );

  if (!parsed) {
    return { ok: true, matched: false };
  }

  const jobs = await listActiveFluxJobs();
  const job = jobs.find(
    (candidate) =>
      candidate.providerJobId != null &&
      fluxJobContainsSubId(candidate.providerJobId, parsed.providerJobId),
  );

  await recordProviderEvent({
    jobId: job?.id ?? null,
    provider: "flux_bfl",
    providerEventId: parsed.providerJobId,
    source: "webhook",
    payload: parsed.event.raw as Json,
  });

  // Reassemble via poll/ingest. One variant delivery is enough signal.
  await runImageTick();

  return { ok: true, matched: Boolean(job) };
}
