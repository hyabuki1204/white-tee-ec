import { NextResponse } from "next/server";
import { createMemoryRateLimiter, getClientIp } from "@/lib/rate-limit/memory";
import { createRestockRequest } from "@/lib/restock/request";

/**
 * Back-in-stock request.
 *
 * POST /api/restock  { email, productId, size, locale?, company? }
 *
 * 200 { ok: true }                      accepted (or already registered)
 * 400 invalid_request | invalid_email
 * 404 not_found                         no such published product / size
 * 409 in_stock                          the size can be bought right now
 * 429 rate_limited
 * 503 unavailable
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 8 requests per 10 minutes per address: room for one person asking about
// several sizes, not for a script. Per-instance and in memory only — see
// lib/rate-limit/memory.ts for what this does and does not stop.
const checkRateLimit = createMemoryRateLimiter({
  limit: 8,
  windowMs: 10 * 60 * 1000,
});

type RestockRequestBody = {
  email?: unknown;
  productId?: unknown;
  size?: unknown;
  locale?: unknown;
  /** Honeypot — hidden from people, filled by naive bots. */
  company?: unknown;
};

const STATUS_BY_REASON = {
  invalid_request: 400,
  invalid_email: 400,
  not_found: 404,
  in_stock: 409,
  unavailable: 503,
} as const;

export async function POST(request: Request) {
  const limit = checkRateLimit(getClientIp(request));

  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let body: RestockRequestBody;

  try {
    body = (await request.json()) as RestockRequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_request" },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { ok: false, error: "invalid_request" },
      { status: 400 },
    );
  }

  // Pretend success to bots so they don't retry with variations.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const result = await createRestockRequest(body);

  if (result.ok) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { ok: false, error: result.reason },
    { status: STATUS_BY_REASON[result.reason] },
  );
}
