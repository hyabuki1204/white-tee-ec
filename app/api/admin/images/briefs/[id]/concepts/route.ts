import { NextResponse } from "next/server";

import { AdminAuthError, requireAdminSession } from "@/lib/admin/auth";
import {
  createImageConcepts,
  getAdminImageBrief,
  getLatestConceptRevision,
} from "@/lib/db/images/admin-repository";
import { buildBriefContext } from "@/lib/images/director/brief-context";
import { isClaudeConfigured } from "@/lib/images/director/client";
import { generateConcepts } from "@/lib/images/director/concepts";
import type { AdminImageConcept } from "@/types/admin-image";

/**
 * Stage 1 of the director: turn a brief into concepts.
 *
 * This is the first endpoint in the pipeline that spends money, so it
 * refuses rather than degrades when Claude is not configured — a silent
 * fallback here would produce concepts nobody asked for, and the operator
 * would have no way to tell them apart from real ones.
 *
 * Generation takes tens of seconds, well past the default serverless
 * limit for a route doing nothing but waiting on an upstream call.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

type ConceptsRequestBody = {
  count?: number;
  revisionNotes?: string;
};

const MIN_COUNT = 1;
const MAX_COUNT = 6;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();

    if (!isClaudeConfigured()) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured." },
        { status: 503 },
      );
    }

    const { id } = await params;
    const brief = await getAdminImageBrief(id);

    if (!brief) {
      return NextResponse.json({ error: "Brief not found." }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as ConceptsRequestBody;
    const requested = body.count ?? brief.desiredVariantCount;
    const count = Math.min(Math.max(requested, MIN_COUNT), MAX_COUNT);

    const context = await buildBriefContext(brief);

    // Throws on banned terms in the brief itself — the guardrail runs
    // before the request is billed, not after.
    const { concepts, usage, warnings } = await generateConcepts({
      brief,
      context,
      count,
      revisionNotes: body.revisionNotes,
    });

    const revision = (await getLatestConceptRevision(id)) + 1;
    let saved: AdminImageConcept[] = [];

    try {
      saved = await createImageConcepts(id, concepts, revision);
    } catch (error) {
      // The Claude call already happened and is already billed. Say so
      // plainly rather than reporting a generic failure that invites the
      // operator to retry and pay twice.
      const message =
        error instanceof Error ? error.message : "Failed to save concepts.";

      return NextResponse.json(
        {
          error: `Concepts were generated but could not be saved: ${message}`,
          billed: true,
          usage,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ concepts: saved, revision, usage, warnings });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to generate concepts.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
