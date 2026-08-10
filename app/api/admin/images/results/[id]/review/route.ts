import { NextResponse } from "next/server";

import { AdminAuthError, requireAdminSession } from "@/lib/admin/auth";
import { reviewResult, ReviewError } from "@/lib/images/review";
import type { AdminImageReviewDecision } from "@/types/admin-image";

/**
 * Approval gate 2.
 *
 * The one point where a generated image can become something the public
 * sees. Everything upstream — concepts, prompts, generation — happens
 * without a human; this does not.
 *
 * The agent may call this for internal_test work only, and never for
 * production (design doc §7.8). That boundary is enforced by
 * IMAGE_AGENT_AUTOPILOT having no value that permits it, and by the
 * publish step in reviewResult() checking the brief's release policy.
 */

type RouteContext = { params: Promise<{ id: string }> };

const ACTIONS = ["approve", "reject", "request_revision"] as const;

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();

    const { id } = await context.params;
    const body = (await request.json()) as Partial<AdminImageReviewDecision>;

    if (
      !body.action ||
      !ACTIONS.includes(body.action as (typeof ACTIONS)[number])
    ) {
      return NextResponse.json(
        { error: `action must be one of: ${ACTIONS.join(", ")}` },
        { status: 400 },
      );
    }

    const outcome = await reviewResult({
      resultId: id,
      decision: {
        action: body.action,
        note: body.note ?? "",
        altTextJa: body.altTextJa,
        altTextEn: body.altTextEn,
      },
      // Today this is always "admin": the panel uses one shared password,
      // so the audit trail cannot yet name a person. Moving admins onto
      // Supabase Auth is what makes this column meaningful (design §7.6).
      actor: "admin",
    });

    return NextResponse.json(outcome);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof ReviewError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message =
      error instanceof Error ? error.message : "Failed to review image.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
