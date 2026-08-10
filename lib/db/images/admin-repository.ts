import "server-only";

import { mapImageBriefRow } from "@/lib/db/images/mapper";
import { resolveReleasePolicy } from "@/lib/images/release-policy";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  AdminImageBriefDetail,
  AdminImageBriefInput,
  AdminImageBriefListItem,
} from "@/types/admin-image";
import type { ImageBriefRow, Json } from "@/types/database";

const MIN_VARIANT_COUNT = 1;
const MAX_VARIANT_COUNT = 8;

type BriefQueryRow = ImageBriefRow & {
  image_concepts: Array<{ id: string }> | null;
};

function mapListItem(row: BriefQueryRow, pendingReviewCount: number) {
  return {
    id: row.id,
    title: row.title,
    purpose: row.purpose,
    subjectClass: row.subject_class,
    releasePolicy: row.release_policy,
    conceptCount: (row.image_concepts ?? []).length,
    pendingReviewCount,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } satisfies AdminImageBriefListItem;
}

/**
 * Validate before hitting the database so the admin UI gets a readable
 * message instead of a raw constraint violation. The DB still enforces
 * all of this independently.
 */
function assertValidBriefInput(input: AdminImageBriefInput): void {
  if (!input.title.trim()) {
    throw new Error("Brief title is required.");
  }

  if (
    !Number.isInteger(input.desiredVariantCount) ||
    input.desiredVariantCount < MIN_VARIANT_COUNT ||
    input.desiredVariantCount > MAX_VARIANT_COUNT
  ) {
    throw new Error(
      `Variant count must be between ${MIN_VARIANT_COUNT} and ${MAX_VARIANT_COUNT}.`,
    );
  }
}

export async function listAdminImageBriefs(): Promise<
  AdminImageBriefListItem[]
> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("image_briefs")
    .select("*, image_concepts(id)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list image briefs: ${error.message}`);
  }

  const rows = (data ?? []).map(
    (row) => row as unknown as BriefQueryRow,
  );

  if (rows.length === 0) {
    return [];
  }

  const pendingByBrief = await countPendingReviewsByBrief(
    rows.map((row) => row.id),
  );

  return rows.map((row) => mapListItem(row, pendingByBrief.get(row.id) ?? 0));
}

/**
 * Pending-review counts per brief.
 *
 * Results sit three hops from a brief (brief → concept → job → result).
 * Walked as three plain queries rather than a nested join: the hand-written
 * Database type declares no relationships, so PostgREST embedding does not
 * typecheck, and the row counts here are small. Revisit with a database view
 * if the review queue ever grows enough to matter.
 */
async function countPendingReviewsByBrief(
  briefIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  if (briefIds.length === 0) {
    return counts;
  }

  const supabase = createSupabaseAdminClient();

  const { data: concepts, error: conceptError } = await supabase
    .from("image_concepts")
    .select("id, brief_id")
    .in("brief_id", briefIds);

  if (conceptError) {
    throw new Error(`Failed to count pending reviews: ${conceptError.message}`);
  }

  const briefIdByConcept = new Map(
    (concepts ?? []).map((row) => [row.id, row.brief_id]),
  );

  if (briefIdByConcept.size === 0) {
    return counts;
  }

  const { data: jobs, error: jobError } = await supabase
    .from("image_generation_jobs")
    .select("id, concept_id")
    .in("concept_id", [...briefIdByConcept.keys()]);

  if (jobError) {
    throw new Error(`Failed to count pending reviews: ${jobError.message}`);
  }

  const briefIdByJob = new Map(
    (jobs ?? []).flatMap((row) => {
      const briefId = briefIdByConcept.get(row.concept_id);
      return briefId ? [[row.id, briefId] as const] : [];
    }),
  );

  if (briefIdByJob.size === 0) {
    return counts;
  }

  const { data: results, error: resultError } = await supabase
    .from("image_generation_results")
    .select("job_id")
    .eq("review_state", "pending_review")
    .in("job_id", [...briefIdByJob.keys()]);

  if (resultError) {
    throw new Error(`Failed to count pending reviews: ${resultError.message}`);
  }

  for (const row of results ?? []) {
    const briefId = briefIdByJob.get(row.job_id);

    if (briefId) {
      counts.set(briefId, (counts.get(briefId) ?? 0) + 1);
    }
  }

  return counts;
}

export async function getAdminImageBrief(
  id: string,
): Promise<AdminImageBriefDetail | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("image_briefs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch image brief: ${error.message}`);
  }

  return data ? mapImageBriefRow(data) : null;
}

export async function createAdminImageBrief(
  input: AdminImageBriefInput,
  createdBy = "admin",
): Promise<AdminImageBriefDetail> {
  if (!isSupabaseConfigured()) {
    throw new Error("Cannot create image brief: Supabase is not configured.");
  }

  assertValidBriefInput(input);

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("image_briefs")
    .insert({
      title: input.title,
      purpose: input.purpose,
      subject_class: input.subjectClass,
      // Derived, never taken from the client: a request cannot promote a
      // product depiction into a shippable image.
      release_policy: resolveReleasePolicy(input.subjectClass),
      intent: input.intent,
      product_id: input.productId,
      fabric_slug: input.fabricSlug,
      desired_variant_count: input.desiredVariantCount,
      constraints: input.constraints as Json,
      due_date: input.dueDate,
      created_by: createdBy,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create image brief: ${error.message}`);
  }

  return mapImageBriefRow(data);
}

export async function updateAdminImageBrief(
  id: string,
  input: AdminImageBriefInput,
): Promise<AdminImageBriefDetail> {
  if (!isSupabaseConfigured()) {
    throw new Error("Cannot update image brief: Supabase is not configured.");
  }

  assertValidBriefInput(input);

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("image_briefs")
    .update({
      title: input.title,
      purpose: input.purpose,
      subject_class: input.subjectClass,
      release_policy: resolveReleasePolicy(input.subjectClass),
      intent: input.intent,
      product_id: input.productId,
      fabric_slug: input.fabricSlug,
      desired_variant_count: input.desiredVariantCount,
      constraints: input.constraints as Json,
      due_date: input.dueDate,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update image brief: ${error.message}`);
  }

  return mapImageBriefRow(data);
}

export async function deleteAdminImageBrief(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Cannot delete image brief: Supabase is not configured.");
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("image_briefs").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete image brief: ${error.message}`);
  }
}
