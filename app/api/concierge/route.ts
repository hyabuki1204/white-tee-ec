import { NextResponse } from "next/server";
import { parseConciergeInput } from "@/lib/concierge/input";
import { CONCIERGE_LIMITS } from "@/lib/concierge/limits";
import {
  clientKeyFromHeaders,
  createTokenBucketLimiter,
} from "@/lib/concierge/rate-limit";
import { answerConcierge } from "@/lib/concierge/respond";
import type {
  ConciergeErrorCode,
  ConciergeErrorResponse,
} from "@/lib/concierge/types";
import { getProducts } from "@/lib/products/queries";

/**
 * POST /api/concierge — the Gauge Concierge.
 *
 * Public and unauthenticated, and with an API key configured it spends
 * money, so requests are rejected as early and as cheaply as possible:
 *
 *   1. cross-origin browsers            → 403
 *   2. per-IP token bucket              → 429   (rate-limit.ts)
 *   3. body size, shape, length caps    → 400   (input.ts)
 *   4. daily budget for model calls     → rules path answers (budget.ts)
 *
 * Nothing about a conversation is stored, and message text is never logged.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// One model attempt plus one retry, each bounded by modelTimeoutMs.
export const maxDuration = 30;

// Module scope: one limiter per server process. See rate-limit.ts for what
// that does and does not protect against.
const limiter = createTokenBucketLimiter({
  burst: CONCIERGE_LIMITS.rateBurst,
  refillMs: CONCIERGE_LIMITS.rateRefillMs,
  maxKeys: CONCIERGE_LIMITS.rateMaxKeys,
});

function fail(
  error: ConciergeErrorCode,
  status: number,
  extra: Partial<ConciergeErrorResponse> = {},
  headers: Record<string, string> = {},
) {
  return NextResponse.json<ConciergeErrorResponse>(
    { ok: false, error, ...extra },
    { status, headers: { "Cache-Control": "no-store", ...headers } },
  );
}

/**
 * A browser on another site sends its own Origin; refuse those so the
 * endpoint cannot be embedded elsewhere at this store's expense. Requests
 * without an Origin header (non-browser clients) are not stopped by this —
 * the rate limit and the daily budget are what bound them.
 */
function isCrossOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

export async function POST(request: Request) {
  if (isCrossOrigin(request)) {
    return fail("forbidden", 403);
  }

  const decision = limiter.take(clientKeyFromHeaders(request.headers));

  if (!decision.allowed) {
    return fail(
      "rate_limited",
      429,
      { retryAfterSeconds: decision.retryAfterSeconds },
      { "Retry-After": String(decision.retryAfterSeconds) },
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return fail("invalid_request", 415);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);

  if (declaredLength > CONCIERGE_LIMITS.maxBodyBytes) {
    return fail("message_too_long", 413);
  }

  let body: unknown;

  try {
    const text = await request.text();

    // Content-Length can be absent or wrong; check what actually arrived.
    if (Buffer.byteLength(text, "utf8") > CONCIERGE_LIMITS.maxBodyBytes) {
      return fail("message_too_long", 413);
    }

    body = JSON.parse(text);
  } catch {
    return fail("invalid_request", 400);
  }

  const input = parseConciergeInput(body);

  if (!input.ok) {
    return fail(input.error, 400);
  }

  try {
    const products = await getProducts();
    const answer = await answerConcierge({
      messages: input.messages,
      contextSlug: input.contextSlug,
      products,
    });

    return NextResponse.json(answer, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(
      "concierge: request failed",
      error instanceof Error ? error.name : "unknown",
    );

    return fail("unavailable", 503);
  }
}
