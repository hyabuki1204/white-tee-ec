import { NextResponse } from "next/server";

import { AdminAuthError, requireAdminSession } from "@/lib/admin/auth";
import { runImageTick } from "@/lib/images/jobs/runner";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Advance the job queue on demand, from the admin UI.
 *
 * The same work the GitHub Actions safety net does every five minutes, but
 * reachable by a signed-in operator who is sitting in front of the screen
 * waiting for a job. Without it the shortest path from "queued" to "look at
 * the image" is a five-minute wait.
 *
 * This is authenticated by the admin session, not the worker secret: the
 * two callers are different, and giving the browser the worker secret would
 * put it somewhere a browser extension could read it.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST() {
  try {
    await requireAdminSession();

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 503 },
      );
    }

    return NextResponse.json(await runImageTick());
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Image tick failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
