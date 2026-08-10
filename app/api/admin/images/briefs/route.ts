import { NextResponse } from "next/server";

import { AdminAuthError, requireAdminSession } from "@/lib/admin/auth";
import {
  createAdminImageBrief,
  listAdminImageBriefs,
} from "@/lib/db/images/admin-repository";
import { findUnreleasedInfoWarnings } from "@/lib/images/director/guardrails";
import type { AdminImageBriefInput } from "@/types/admin-image";
import type { ImagePurpose, ImageSubjectClass } from "@/types/database";

/**
 * Image briefs.
 *
 * Covered by the /api/admin middleware matcher; requireAdminSession() is
 * repeated here as defence in depth, matching the other admin routes.
 *
 * Note what this endpoint does NOT accept: release_policy. It is derived
 * from subject_class server-side, so no request can promote a product
 * depiction into publishable work.
 */

const PURPOSES: readonly ImagePurpose[] = [
  "instagram_teaser",
  "ec_hero",
  "product_lp",
  "journal",
  "fabric",
];

const SUBJECT_CLASSES: readonly ImageSubjectClass[] = [
  "scenery_mood",
  "styling_scene",
  "product_depiction",
  "fabric_macro",
];

type BriefRequestBody = Partial<AdminImageBriefInput>;

function parseBriefBody(body: BriefRequestBody): AdminImageBriefInput {
  if (typeof body.title !== "string" || !body.title.trim()) {
    throw new Error("title is required.");
  }

  if (!body.purpose || !PURPOSES.includes(body.purpose)) {
    throw new Error(`purpose must be one of: ${PURPOSES.join(", ")}`);
  }

  if (!body.subjectClass || !SUBJECT_CLASSES.includes(body.subjectClass)) {
    throw new Error(
      `subjectClass must be one of: ${SUBJECT_CLASSES.join(", ")}`,
    );
  }

  return {
    title: body.title.trim(),
    purpose: body.purpose,
    subjectClass: body.subjectClass,
    intent: typeof body.intent === "string" ? body.intent : "",
    productId: body.productId ?? null,
    fabricSlug: body.fabricSlug ?? null,
    desiredVariantCount: body.desiredVariantCount ?? 4,
    constraints: body.constraints ?? {},
    dueDate: body.dueDate ?? null,
  };
}

export async function GET() {
  try {
    await requireAdminSession();

    return NextResponse.json({ briefs: await listAdminImageBriefs() });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to list briefs.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();

    const body = (await request.json()) as BriefRequestBody;
    const input = parseBriefBody(body);
    const brief = await createAdminImageBrief(input);

    return NextResponse.json({
      brief,
      // Advisory, not blocking: a launch date in a brief is legitimate,
      // but it should not be forwarded to a third-party provider.
      warnings: findUnreleasedInfoWarnings(input.intent),
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to create brief.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
