import "server-only";

/**
 * Fixed-window, in-memory rate limiter. A first line of defence only.
 *
 * Limits worth knowing before relying on it:
 * - State lives in this process. On serverless every instance has its own
 *   counter and a cold start resets it, so the effective limit is
 *   `limit × live instances` and a patient client can simply wait.
 * - The key is whatever the caller passes. For IPs that means trusting
 *   `x-forwarded-for`, which is only meaningful behind a proxy that sets it
 *   (Vercel does). Shared NATs and mobile carriers put many people behind
 *   one address.
 * - It slows scripted abuse of one endpoint from one address. It is not a
 *   substitute for a shared store (Upstash, Postgres) or a WAF rule; add one
 *   of those if the endpoint is actually attacked.
 */

type Bucket = { count: number; resetAt: number };

const MAX_BUCKETS = 5000;

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export function createMemoryRateLimiter(options: {
  limit: number;
  windowMs: number;
}) {
  const buckets = new Map<string, Bucket>();

  return function check(key: string, now = Date.now()): RateLimitResult {
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      // Keep memory bounded: sweep expired entries, then drop the oldest.
      if (buckets.size >= MAX_BUCKETS) {
        for (const [entryKey, entry] of buckets) {
          if (entry.resetAt <= now) buckets.delete(entryKey);
        }
        while (buckets.size >= MAX_BUCKETS) {
          const oldest = buckets.keys().next().value;
          if (oldest === undefined) break;
          buckets.delete(oldest);
        }
      }

      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return { allowed: true };
    }

    if (bucket.count >= options.limit) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      };
    }

    bucket.count += 1;
    return { allowed: true };
  };
}

/** Best-effort client address. See the caveats at the top of this file. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();

  return first || request.headers.get("x-real-ip")?.trim() || "unknown";
}
