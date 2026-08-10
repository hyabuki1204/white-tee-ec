import { NextResponse } from "next/server";

import { getImageWorkerSecret } from "@/lib/images/env";
import { runImageTick } from "@/lib/images/jobs/runner";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Job runner entry point.
 *
 * POST /api/internal/images/tick
 * Header: Authorization: Bearer <IMAGE_WORKER_SECRET>
 *
 * Advances every job by one step and returns. Called by the GitHub Actions
 * safety net, by a webhook follow-up, and by npm run images:tick during
 * development.
 *
 * This route is outside the /api/admin middleware matcher, so the Bearer
 * secret is the whole defence. The repository is public, meaning the path
 * is public knowledge too — 401s therefore carry no body, and nothing here
 * echoes back configuration.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request, secret: string): boolean {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  return token === secret;
}

export async function POST(request: Request) {
  const secret = getImageWorkerSecret();

  if (!secret) {
    return NextResponse.json(
      { error: "IMAGE_WORKER_SECRET is not configured." },
      { status: 503 },
    );
  }

  if (!isAuthorized(request, secret)) {
    // No body: nothing to learn from probing this endpoint.
    return new NextResponse(null, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  try {
    const result = await runImageTick();

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Image tick failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
