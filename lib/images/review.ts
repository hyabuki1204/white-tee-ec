import "server-only";

import { getImageProvider } from "@/lib/images/providers/registry";
import { publishApprovedImage } from "@/lib/images/storage";
import { canPublish } from "@/lib/images/release-policy";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AdminImageReviewDecision } from "@/types/admin-image";
import type {
  ImagePurpose,
  ImageReleasePolicy,
  ImageReviewState,
  ImageSubjectClass,
} from "@/types/database";

/**
 * Approval gate 2, where a generated image either becomes a usable asset
 * or does not.
 *
 * This is the application half of a three-layer guard. The database refuses
 * an internal_test row in image_assets outright, and the review UI marks
 * test-only work; this module is what decides whether the publish step runs
 * at all. Any one of the three failing still leaves the other two.
 *
 * See docs/image-generation-workflow.md §7.
 */

const PUBLIC_BUCKET_BY_PURPOSE: Record<ImagePurpose, string> = {
  instagram_teaser: "site-images",
  ec_hero: "site-images",
  product_lp: "product-images",
  journal: "site-images",
  fabric: "site-images",
};

export class ReviewError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ReviewError";
    this.status = status;
  }
}

type ReviewContext = {
  resultId: string;
  reviewState: ImageReviewState;
  storagePath: string | null;
  contentType: string | null;
  downloadError: string | null;
  provider: string;
  purpose: ImagePurpose;
  subjectClass: ImageSubjectClass;
  releasePolicy: ImageReleasePolicy;
};

/**
 * Load the result together with the brief that governs it.
 *
 * The release policy lives on the brief, three hops away, and the approval
 * decision cannot be made without it — so it is fetched here rather than
 * trusted from the caller.
 */
async function loadReviewContext(resultId: string): Promise<ReviewContext> {
  const supabase = createSupabaseAdminClient();

  const { data: result, error } = await supabase
    .from("image_generation_results")
    .select("id, review_state, storage_path, content_type, download_error, job_id")
    .eq("id", resultId)
    .maybeSingle();

  if (error) {
    throw new ReviewError(`Failed to load result: ${error.message}`, 500);
  }

  if (!result) {
    throw new ReviewError("Result not found.", 404);
  }

  const { data: job } = await supabase
    .from("image_generation_jobs")
    .select("provider, concept_id")
    .eq("id", result.job_id)
    .maybeSingle();

  if (!job) {
    throw new ReviewError("Job not found for this result.", 404);
  }

  const { data: concept } = await supabase
    .from("image_concepts")
    .select("brief_id")
    .eq("id", job.concept_id)
    .maybeSingle();

  if (!concept) {
    throw new ReviewError("Concept not found for this result.", 404);
  }

  const { data: brief } = await supabase
    .from("image_briefs")
    .select("purpose, subject_class, release_policy")
    .eq("id", concept.brief_id)
    .maybeSingle();

  if (!brief) {
    throw new ReviewError("Brief not found for this result.", 404);
  }

  return {
    resultId: result.id,
    reviewState: result.review_state,
    storagePath: result.storage_path,
    contentType: result.content_type,
    downloadError: result.download_error,
    provider: job.provider,
    purpose: brief.purpose,
    subjectClass: brief.subject_class,
    releasePolicy: brief.release_policy,
  };
}

async function recordReviewEvent(params: {
  resultId: string;
  action: "approve" | "reject" | "request_revision";
  fromState: ImageReviewState;
  toState: ImageReviewState;
  actor: string;
  note: string;
}): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("image_review_events").insert({
    result_id: params.resultId,
    action: params.action,
    from_state: params.fromState,
    to_state: params.toState,
    actor: params.actor,
    note: params.note,
  });

  if (error) {
    throw new ReviewError(`Failed to record review event: ${error.message}`, 500);
  }
}

export type ReviewOutcome = {
  reviewState: ImageReviewState;
  /** Set only when the image was copied to a public bucket. */
  assetId: string | null;
  publicUrl: string | null;
  /** True when approval was recorded but publishing was withheld by policy. */
  heldForTestPolicy: boolean;
};

export async function reviewResult(params: {
  resultId: string;
  decision: AdminImageReviewDecision;
  actor: string;
}): Promise<ReviewOutcome> {
  if (!isSupabaseConfigured()) {
    throw new ReviewError("Supabase is not configured.", 503);
  }

  const { decision, actor } = params;
  const context = await loadReviewContext(params.resultId);

  if (context.reviewState === "approved") {
    throw new ReviewError("This image has already been approved.", 409);
  }

  if (decision.action !== "approve" && !decision.note.trim()) {
    // A rejection with no reason teaches nobody anything, and the revision
    // loop feeds this text straight back to Claude.
    throw new ReviewError(
      "A reason is required when rejecting or requesting a revision.",
    );
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  if (decision.action !== "approve") {
    const toState: ImageReviewState =
      decision.action === "reject" ? "rejected" : "needs_revision";

    const { error } = await supabase
      .from("image_generation_results")
      .update({
        review_state: toState,
        reviewed_by: actor,
        reviewed_at: now,
        review_note: decision.note,
      })
      .eq("id", context.resultId);

    if (error) {
      throw new ReviewError(`Failed to record review: ${error.message}`, 500);
    }

    await recordReviewEvent({
      resultId: context.resultId,
      action: decision.action,
      fromState: context.reviewState,
      toState,
      actor,
      note: decision.note,
    });

    return {
      reviewState: toState,
      assetId: null,
      publicUrl: null,
      heldForTestPolicy: false,
    };
  }

  // --- approve ---

  if (context.downloadError || !context.storagePath) {
    throw new ReviewError(
      "This variant was never stored, so there is nothing to approve.",
    );
  }

  const altTextJa = decision.altTextJa?.trim() ?? "";
  const altTextEn = decision.altTextEn?.trim() ?? "";

  if (!altTextJa) {
    // Enforced here rather than left to the UI: an approved asset with no
    // alt text will otherwise be published as one.
    throw new ReviewError("Japanese alt text is required before approval.");
  }

  const { error: updateError } = await supabase
    .from("image_generation_results")
    .update({
      review_state: "approved",
      reviewed_by: actor,
      reviewed_at: now,
      review_note: decision.note,
      alt_text_ja: altTextJa,
      alt_text_en: altTextEn,
    })
    .eq("id", context.resultId);

  if (updateError) {
    throw new ReviewError(`Failed to record approval: ${updateError.message}`, 500);
  }

  await recordReviewEvent({
    resultId: context.resultId,
    action: "approve",
    fromState: context.reviewState,
    toState: "approved",
    actor,
    note: decision.note,
  });

  // Test-only work stops here: approved as a record that the output was
  // sound, but never copied out of the private bucket.
  if (!canPublish(context.subjectClass) || context.releasePolicy !== "production") {
    return {
      reviewState: "approved",
      assetId: null,
      publicUrl: null,
      heldForTestPolicy: true,
    };
  }

  const targetBucket = PUBLIC_BUCKET_BY_PURPOSE[context.purpose];
  const targetPath = `ai/${context.resultId}.${
    context.contentType === "image/jpeg" ? "jpg" : "png"
  }`;

  const publicUrl = await publishApprovedImage({
    sourcePath: context.storagePath,
    targetBucket,
    targetPath,
    contentType: context.contentType ?? "image/png",
  });

  const capabilities = getImageProvider().capabilities;
  const licenseNote = `${context.provider} / ${
    capabilities.commercialUseGranted
      ? "commercial use granted"
      : "commercial rights not assigned to us"
  }`;

  const { data: asset, error: assetError } = await supabase
    .from("image_assets")
    .insert({
      result_id: context.resultId,
      purpose: context.purpose,
      subject_class: context.subjectClass,
      public_bucket: targetBucket,
      public_path: targetPath,
      public_url: publicUrl,
      alt_text_ja: altTextJa,
      alt_text_en: altTextEn,
      generation_provider: context.provider,
      license_note: licenseNote,
      created_by: actor,
    })
    .select("id")
    .single();

  if (assetError) {
    throw new ReviewError(`Failed to create asset: ${assetError.message}`, 500);
  }

  return {
    reviewState: "approved",
    assetId: asset.id,
    publicUrl,
    heldForTestPolicy: false,
  };
}
