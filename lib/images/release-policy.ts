import type {
  ImageReleasePolicy,
  ImageSubjectClass,
} from "@/types/database";

/**
 * What a generated image is allowed to become, derived from what it depicts.
 *
 * Instagram posts and EC branding visuals ship, so scenery and styling
 * scenes are production work. Images that depict the product or the fabric
 * itself stay internal: their texture and colour will not match the real
 * garment, and presenting them as the product risks misrepresentation.
 *
 * The database enforces the same rule (image_briefs_release_policy_guard,
 * and a production-only CHECK on image_assets). This module is the
 * application-side half of that, not the only guard.
 *
 * See docs/image-generation-workflow.md §2.1 and §7.7.
 */
const RELEASE_POLICY_BY_SUBJECT_CLASS: Record<
  ImageSubjectClass,
  ImageReleasePolicy
> = {
  scenery_mood: "production",
  styling_scene: "production",
  product_depiction: "internal_test",
  fabric_macro: "internal_test",
};

/** Subject classes that may never leave the private drafts bucket. */
const TEST_ONLY_SUBJECT_CLASSES: readonly ImageSubjectClass[] = [
  "product_depiction",
  "fabric_macro",
];

export function resolveReleasePolicy(
  subjectClass: ImageSubjectClass,
): ImageReleasePolicy {
  return RELEASE_POLICY_BY_SUBJECT_CLASS[subjectClass];
}

export function isTestOnlySubjectClass(
  subjectClass: ImageSubjectClass,
): boolean {
  return TEST_ONLY_SUBJECT_CLASSES.includes(subjectClass);
}

/** True when approving this image may copy it to a public bucket. */
export function canPublish(subjectClass: ImageSubjectClass): boolean {
  return resolveReleasePolicy(subjectClass) === "production";
}

/**
 * Styling scenes ship, but a worn shot is not a product shot. Carried into
 * the review UI so the reviewer sees the limit at the moment of approval.
 */
export function requiresProductShotWarning(
  subjectClass: ImageSubjectClass,
): boolean {
  return subjectClass === "styling_scene";
}
