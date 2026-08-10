import "server-only";

import { recordCost } from "@/lib/db/images/job-repository";
import { isClaudeConfigured } from "@/lib/images/director/client";
import { reviewGeneratedImage } from "@/lib/images/director/qa";
import { IMAGE_DRAFTS_BUCKET } from "@/lib/images/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Json } from "@/types/database";

/**
 * Runs stage 3 over stored images that have not been evaluated yet.
 *
 * Failures here never fail the job. A missing AI evaluation costs the
 * reviewer a hint; a job failed over one costs the images. So anything that
 * goes wrong is logged and the image still reaches the queue, just without
 * a verdict — which the review UI renders as an absent badge.
 */

const BATCH_SIZE = 8;

export type QaTickResult = {
  evaluated: number;
  skipped: number;
  failed: number;
};

export async function runImageQaTick(): Promise<QaTickResult> {
  const result: QaTickResult = { evaluated: 0, skipped: 0, failed: 0 };

  if (!isSupabaseConfigured() || !isClaudeConfigured()) {
    return result;
  }

  const supabase = createSupabaseAdminClient();

  const { data: pending, error } = await supabase
    .from("image_generation_results")
    .select("id, storage_path, content_type, job_id")
    .eq("review_state", "pending_review")
    .is("qa_verdict", null)
    .is("download_error", null)
    .not("storage_path", "is", null)
    .limit(BATCH_SIZE);

  if (error) {
    throw new Error(`Failed to load images for QA: ${error.message}`);
  }

  for (const row of pending ?? []) {
    if (!row.storage_path) {
      result.skipped += 1;
      continue;
    }

    try {
      const { data: file, error: downloadError } = await supabase.storage
        .from(IMAGE_DRAFTS_BUCKET)
        .download(row.storage_path);

      if (downloadError || !file) {
        result.skipped += 1;
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      const { data: job } = await supabase
        .from("image_generation_jobs")
        .select("concept_id")
        .eq("id", row.job_id)
        .maybeSingle();

      const { data: concept } = job
        ? await supabase
            .from("image_concepts")
            .select("title, brief_id")
            .eq("id", job.concept_id)
            .maybeSingle()
        : { data: null };

      const { data: brief } = concept
        ? await supabase
            .from("image_briefs")
            .select("intent, subject_class")
            .eq("id", concept.brief_id)
            .maybeSingle()
        : { data: null };

      const { qa, usage } = await reviewGeneratedImage({
        imageBase64: buffer.toString("base64"),
        mediaType:
          row.content_type === "image/jpeg"
            ? "image/jpeg"
            : row.content_type === "image/webp"
              ? "image/webp"
              : "image/png",
        briefIntent: brief?.intent ?? "",
        conceptTitle: concept?.title ?? "",
        subjectClass: brief?.subject_class ?? "scenery_mood",
        context: {},
      });

      await supabase
        .from("image_generation_results")
        .update({
          qa_verdict: qa.verdict,
          qa_scores: qa.scores as unknown as Json,
          qa_issues: qa.issues as unknown as Json,
          // Pre-filled for the reviewer, who edits before approving.
          // Approval still requires Japanese alt text to be present.
          alt_text_ja: qa.altTextJa,
          alt_text_en: qa.altTextEn,
          caption_draft: qa.captionDraft,
        })
        .eq("id", row.id);

      // Sonnet 5 introductory rates: $2/$10 per million, at 150 JPY/USD.
      const costJpy =
        (usage.inputTokens / 1_000_000) * 2 * 150 +
        (usage.outputTokens / 1_000_000) * 10 * 150;

      await recordCost({
        jobId: row.job_id,
        kind: "claude",
        provider: "anthropic",
        amountJpy: Number(costJpy.toFixed(2)),
        detail: { stage: "qa", ...usage },
      });

      result.evaluated += 1;
    } catch {
      // Deliberately swallowed: the image still reaches the reviewer.
      result.failed += 1;
    }
  }

  return result;
}
