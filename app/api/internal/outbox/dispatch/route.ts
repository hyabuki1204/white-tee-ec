import { NextResponse } from "next/server";

import { getImageWorkerSecret } from "@/lib/images/env";
import { dispatchOutbox } from "@/lib/images/outbox";

/**
 * Deliver queued integration events.
 *
 * POST /api/internal/outbox/dispatch
 * Header: Authorization: Bearer <IMAGE_WORKER_SECRET>
 *
 * Separate from the image tick on purpose: a wedged n8n endpoint should
 * slow down notifications, not image generation.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = getImageWorkerSecret();

  if (!secret) {
    return NextResponse.json(
      { error: "IMAGE_WORKER_SECRET is not configured." },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (token !== secret) {
    return new NextResponse(null, { status: 401 });
  }

  try {
    return NextResponse.json(await dispatchOutbox());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Outbox dispatch failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
