import type {
  ImageConceptStatus,
  ImageErrorCategory,
  ImageJobStatus,
  ImagePurpose,
  ImageQaVerdict,
  ImageReleasePolicy,
  ImageReviewAction,
  ImageReviewState,
  ImageSubjectClass,
} from "@/types/database";

/**
 * Admin-facing shapes for the image generation pipeline.
 * See docs/image-generation-workflow.md.
 */

/** Payload for creating or editing a brief. */
export type AdminImageBriefInput = {
  title: string;
  purpose: ImagePurpose;
  subjectClass: ImageSubjectClass;
  intent: string;
  productId: string | null;
  fabricSlug: string | null;
  desiredVariantCount: number;
  constraints: Record<string, unknown>;
  dueDate: string | null;
};

/** Brief row for the list view. */
export type AdminImageBriefListItem = {
  id: string;
  title: string;
  purpose: ImagePurpose;
  subjectClass: ImageSubjectClass;
  releasePolicy: ImageReleasePolicy;
  conceptCount: number;
  pendingReviewCount: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Full brief for the detail view. */
export type AdminImageBriefDetail = AdminImageBriefInput & {
  id: string;
  releasePolicy: ImageReleasePolicy;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminImageConcept = {
  id: string;
  briefId: string;
  parentConceptId: string | null;
  revision: number;
  status: ImageConceptStatus;
  title: string;
  concept: Record<string, unknown>;
  renderSpec: Record<string, unknown> | null;
  renderSpecOverride: Record<string, unknown> | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
};

export type AdminImageJob = {
  id: string;
  conceptId: string;
  status: ImageJobStatus;
  provider: string;
  providerJobId: string | null;
  requestedVariantCount: number;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt: string;
  errorCategory: ImageErrorCategory | null;
  errorMessage: string | null;
  estimatedCostJpy: number;
  actualCostJpy: number | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

/** One generated image awaiting or past review. */
export type AdminImageResult = {
  id: string;
  jobId: string;
  variantIndex: number;
  storageBucket: string | null;
  storagePath: string | null;
  width: number | null;
  height: number | null;
  downloadError: string | null;
  qaVerdict: ImageQaVerdict | null;
  qaIssues: Array<{ severity: string; description: string }>;
  altTextJa: string | null;
  altTextEn: string | null;
  captionDraft: string | null;
  reviewState: ImageReviewState;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
};

/**
 * A review queue entry: the image plus the intent it was meant to serve,
 * so the reviewer can judge against the brief rather than in isolation.
 */
export type AdminImageReviewItem = AdminImageResult & {
  briefId: string;
  briefTitle: string;
  briefIntent: string;
  purpose: ImagePurpose;
  subjectClass: ImageSubjectClass;
  releasePolicy: ImageReleasePolicy;
  conceptTitle: string;
  provider: string;
  /** Short-lived signed URL. Unapproved images have no public URL. */
  signedUrl: string | null;
};

export type AdminImageReviewDecision = {
  action: Extract<
    ImageReviewAction,
    "approve" | "reject" | "request_revision"
  >;
  /** Required for reject and request_revision. */
  note: string;
  altTextJa?: string;
  altTextEn?: string;
};

export type AdminImageAsset = {
  id: string;
  resultId: string;
  purpose: ImagePurpose;
  subjectClass: ImageSubjectClass;
  publicUrl: string;
  altTextJa: string;
  altTextEn: string;
  isAiGenerated: boolean;
  generationProvider: string;
  licenseNote: string;
  attachedProductId: string | null;
  attachedFabricSlug: string | null;
  attachedContentKey: string | null;
  createdBy: string;
  createdAt: string;
};

/** Monthly budget state for the admin warning banner. */
export type AdminImageBudgetStatus = {
  monthlyLimitJpy: number;
  spentJpy: number;
  ratio: number;
  state: "ok" | "warning" | "exceeded";
};
