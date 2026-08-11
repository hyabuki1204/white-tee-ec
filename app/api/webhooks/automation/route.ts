import { NextResponse } from "next/server";

import { createAdminImageBrief } from "@/lib/db/images/admin-repository";
import { getSigningSecret, verifySignature } from "@/lib/images/outbox";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AdminImageBriefInput } from "@/types/admin-image";
import type { ImagePurpose, ImageSubjectClass } from "@/types/database";

/**
 * Inbound automation webhook (n8n / Make).
 *
 * The only allowed action today is create_brief. Creating a brief does not
 * call Claude and does not enqueue a generation job — an external system
 * must never be able to spend money. A human still gates concepts.
 *
 * Signature header: X-WhiteTee-Signature: sha256=<hmac>
 * Secret: N8N_SIGNING_SECRET (shared with the outbound outbox).
 *
 * See docs/image-generation-workflow.md §9.3.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

type AutomationBody = {
  action?: string;
  payload?: Record<string, unknown>;
};

function parseCreateBriefPayload(
  payload: Record<string, unknown>,
): AdminImageBriefInput {
  const title = payload.title;
  const purpose = payload.purpose;
  const subjectClass = payload.subjectClass ?? payload.subject_class;
  const intent = payload.intent;

  if (typeof title !== "string" || !title.trim()) {
    throw new Error("payload.title is required.");
  }

  if (typeof purpose !== "string" || !PURPOSES.includes(purpose as ImagePurpose)) {
    throw new Error(`payload.purpose must be one of: ${PURPOSES.join(", ")}`);
  }

  if (
    typeof subjectClass !== "string" ||
    !SUBJECT_CLASSES.includes(subjectClass as ImageSubjectClass)
  ) {
    throw new Error(
      `payload.subjectClass must be one of: ${SUBJECT_CLASSES.join(", ")}`,
    );
  }

  const desiredVariantCount =
    typeof payload.desiredVariantCount === "number"
      ? payload.desiredVariantCount
      : typeof payload.desired_variant_count === "number"
        ? payload.desired_variant_count
        : 4;

  return {
    title: title.trim(),
    purpose: purpose as ImagePurpose,
    subjectClass: subjectClass as ImageSubjectClass,
    intent: typeof intent === "string" ? intent : "",
    productId:
      typeof payload.productId === "string"
        ? payload.productId
        : typeof payload.product_id === "string"
          ? payload.product_id
          : null,
    fabricSlug:
      typeof payload.fabricSlug === "string"
        ? payload.fabricSlug
        : typeof payload.fabric_slug === "string"
          ? payload.fabric_slug
          : null,
    desiredVariantCount,
    constraints:
      payload.constraints &&
      typeof payload.constraints === "object" &&
      !Array.isArray(payload.constraints)
        ? (payload.constraints as Record<string, unknown>)
        : {},
    dueDate:
      typeof payload.dueDate === "string"
        ? payload.dueDate
        : typeof payload.due_date === "string"
          ? payload.due_date
          : null,
  };
}

export async function POST(request: Request) {
  const secret = getSigningSecret();

  if (!secret) {
    return NextResponse.json(
      { error: "N8N_SIGNING_SECRET is not configured." },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get(["x-white", "tee-signature"].join(""));

  if (!verifySignature(rawBody, signature, secret)) {
    return new NextResponse(null, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  let body: AutomationBody;

  try {
    body = JSON.parse(rawBody) as AutomationBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (body.action !== "create_brief") {
    return NextResponse.json(
      { error: "Unsupported action. Allowed: create_brief." },
      { status: 400 },
    );
  }

  try {
    const input = parseCreateBriefPayload(body.payload ?? {});
    const brief = await createAdminImageBrief(input);

    return NextResponse.json({
      ok: true,
      action: "create_brief",
      brief: { id: brief.id, title: brief.title },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Automation webhook failed.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
