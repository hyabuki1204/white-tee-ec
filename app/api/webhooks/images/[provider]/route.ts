import { NextResponse } from "next/server";

import { handleImageProviderWebhook } from "@/lib/images/jobs/webhook";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Provider completion webhooks.
 *
 * POST /api/webhooks/images/[provider]
 *
 * Outside the admin middleware matcher. Authentication is the provider
 * webhook secret checked inside the adapter's parseWebhook().
 *
 * See docs/image-generation-workflow.md §3.3 and §6.1.1.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const rawBody = await request.text();

  try {
    const result = await handleImageProviderWebhook({
      providerId: provider,
      headers: request.headers,
      rawBody,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook handling failed.";

    if (
      message.includes("signature") ||
      message.includes("WEBHOOK_SECRET") ||
      message.includes("not configured")
    ) {
      return new NextResponse(null, { status: 401 });
    }

    if (message.startsWith("Unsupported image provider")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
