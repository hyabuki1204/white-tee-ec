import "server-only";

import { mapImageResultRow } from "@/lib/db/images/mapper";
import { createDraftSignedUrl } from "@/lib/images/storage";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AdminImageReviewItem } from "@/types/admin-image";
import type { ImageReviewState } from "@/types/database";

/**
 * The review queue.
 *
 * Each entry carries the brief's intent and the concept's title alongside
 * the image, because judging a generated image in isolation is judging the
 * wrong thing: the question is whether it answers what was asked for, and a
 * reviewer cannot answer that from a picture alone.
 *
 * Signed URLs are minted per request and expire in minutes. That is the only
 * way to see anything in the drafts bucket — an unapproved image has no
 * public URL at all.
 */

export async function listReviewQueue(params: {
  reviewState?: ImageReviewState;
  briefId?: string;
  limit?: number;
} = {}): Promise<AdminImageReviewItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  const reviewState = params.reviewState ?? "pending_review";

  const { data: results, error } = await supabase
    .from("image_generation_results")
    .select("*")
    .eq("review_state", reviewState)
    .order("created_at", { ascending: true })
    .limit(params.limit ?? 60);

  if (error) {
    throw new Error(`Failed to load review queue: ${error.message}`);
  }

  if (!results || results.length === 0) {
    return [];
  }

  // Walk brief <- concept <- job in bulk rather than per row.
  const jobIds = [...new Set(results.map((row) => row.job_id))];

  const { data: jobs } = await supabase
    .from("image_generation_jobs")
    .select("id, concept_id, provider")
    .in("id", jobIds);

  const conceptIds = [...new Set((jobs ?? []).map((job) => job.concept_id))];

  const { data: concepts } = await supabase
    .from("image_concepts")
    .select("id, brief_id, title")
    .in("id", conceptIds);

  const briefIds = [...new Set((concepts ?? []).map((c) => c.brief_id))];

  const { data: briefs } = await supabase
    .from("image_briefs")
    .select("id, title, intent, purpose, subject_class, release_policy")
    .in("id", briefIds);

  const jobById = new Map((jobs ?? []).map((job) => [job.id, job]));
  const conceptById = new Map((concepts ?? []).map((c) => [c.id, c]));
  const briefById = new Map((briefs ?? []).map((b) => [b.id, b]));

  const items = await Promise.all(
    results.map(async (row) => {
      const job = jobById.get(row.job_id);
      const concept = job ? conceptById.get(job.concept_id) : undefined;
      const brief = concept ? briefById.get(concept.brief_id) : undefined;

      if (!job || !concept || !brief) {
        return null;
      }

      const base = mapImageResultRow(row);

      return {
        ...base,
        briefId: brief.id,
        briefTitle: brief.title,
        briefIntent: brief.intent,
        purpose: brief.purpose,
        subjectClass: brief.subject_class,
        releasePolicy: brief.release_policy,
        conceptTitle: concept.title,
        provider: job.provider,
        signedUrl: row.storage_path
          ? await createDraftSignedUrl(row.storage_path)
          : null,
      } satisfies AdminImageReviewItem;
    }),
  );

  const filtered = items.filter(
    (item): item is AdminImageReviewItem => item !== null,
  );

  return params.briefId
    ? filtered.filter((item) => item.briefId === params.briefId)
    : filtered;
}

export async function countPendingReviews(): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const supabase = createSupabaseAdminClient();

  const { count, error } = await supabase
    .from("image_generation_results")
    .select("id", { count: "exact", head: true })
    .eq("review_state", "pending_review");

  if (error) {
    throw new Error(`Failed to count pending reviews: ${error.message}`);
  }

  return count ?? 0;
}
