import { NextResponse } from "next/server";

import { getImageWorkerSecret } from "@/lib/images/env";
import { dispatchRestockNotifications } from "@/lib/restock/notify";

/**
 * Send any back-in-stock notices that are still pending for sizes that
 * have stock — the retry path for sends that failed or were skipped when
 * the product was saved.
 *
 * POST /api/internal/restock/dispatch
 * Header: Authorization: Bearer <IMAGE_WORKER_SECRET>
 *
 * Same shared worker secret as /api/internal/outbox/dispatch.
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

  return NextResponse.json(await dispatchRestockNotifications());
}
