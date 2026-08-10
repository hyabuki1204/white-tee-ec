import type {
  AdminImageAsset,
  AdminImageBriefDetail,
  AdminImageConcept,
  AdminImageJob,
  AdminImageResult,
} from "@/types/admin-image";
import type {
  ImageAssetRow,
  ImageBriefRow,
  ImageConceptRow,
  ImageGenerationJobRow,
  ImageGenerationResultRow,
  Json,
} from "@/types/database";

/** Narrow a jsonb column to a plain object, tolerating null and non-objects. */
function toRecord(value: Json | null): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function toNullableRecord(value: Json | null): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function toQaIssues(
  value: Json | null,
): Array<{ severity: string; description: string }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return [];
    }

    const record = entry as Record<string, unknown>;
    const severity = record.severity;
    const description = record.description;

    if (typeof severity !== "string" || typeof description !== "string") {
      return [];
    }

    return [{ severity, description }];
  });
}

export function mapImageBriefRow(row: ImageBriefRow): AdminImageBriefDetail {
  return {
    id: row.id,
    title: row.title,
    purpose: row.purpose,
    subjectClass: row.subject_class,
    releasePolicy: row.release_policy,
    intent: row.intent,
    productId: row.product_id,
    fabricSlug: row.fabric_slug,
    desiredVariantCount: row.desired_variant_count,
    constraints: toRecord(row.constraints),
    dueDate: row.due_date,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapImageConceptRow(row: ImageConceptRow): AdminImageConcept {
  return {
    id: row.id,
    briefId: row.brief_id,
    parentConceptId: row.parent_concept_id,
    revision: row.revision,
    status: row.status,
    title: row.title,
    concept: toRecord(row.concept),
    renderSpec: toNullableRecord(row.render_spec),
    renderSpecOverride: toNullableRecord(row.render_spec_override),
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    createdAt: row.created_at,
  };
}

export function mapImageJobRow(row: ImageGenerationJobRow): AdminImageJob {
  return {
    id: row.id,
    conceptId: row.concept_id,
    status: row.status,
    provider: row.provider,
    providerJobId: row.provider_job_id,
    requestedVariantCount: row.requested_variant_count,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts,
    nextAttemptAt: row.next_attempt_at,
    errorCategory: row.error_category,
    errorMessage: row.error_message,
    // numeric columns arrive as strings over PostgREST
    estimatedCostJpy: Number(row.estimated_cost_jpy),
    actualCostJpy:
      row.actual_cost_jpy === null ? null : Number(row.actual_cost_jpy),
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapImageResultRow(
  row: ImageGenerationResultRow,
): AdminImageResult {
  return {
    id: row.id,
    jobId: row.job_id,
    variantIndex: row.variant_index,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    width: row.width,
    height: row.height,
    downloadError: row.download_error,
    qaVerdict: row.qa_verdict,
    qaIssues: toQaIssues(row.qa_issues),
    altTextJa: row.alt_text_ja,
    altTextEn: row.alt_text_en,
    captionDraft: row.caption_draft,
    reviewState: row.review_state,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    reviewNote: row.review_note,
    createdAt: row.created_at,
  };
}

export function mapImageAssetRow(row: ImageAssetRow): AdminImageAsset {
  return {
    id: row.id,
    resultId: row.result_id,
    purpose: row.purpose,
    subjectClass: row.subject_class,
    publicUrl: row.public_url,
    altTextJa: row.alt_text_ja,
    altTextEn: row.alt_text_en,
    isAiGenerated: row.is_ai_generated,
    generationProvider: row.generation_provider,
    licenseNote: row.license_note,
    attachedProductId: row.attached_product_id,
    attachedFabricSlug: row.attached_fabric_slug,
    attachedContentKey: row.attached_content_key,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}
