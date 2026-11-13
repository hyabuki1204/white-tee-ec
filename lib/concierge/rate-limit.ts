/**
 * In-memory token bucket, keyed by client IP.
 *
 * Limits of this approach — it is a first line, not the whole defence:
 * - State lives in one server process. On serverless hosting each warm
 *   instance has its own buckets and a cold start forgets them, so the
 *   effective per-IP rate is (instances × burst). It holds well for a
 *   single-region, low-concurrency store and not beyond that.
 * - The key is the IP from x-forwarded-for, which is only trustworthy behind
 *   a proxy that overwrites it (Vercel does). Many customers behind one NAT
 *   share a bucket; a caller with many IPs has many buckets.
 * The spend ceiling that does not depend on any of this is the daily budget
 * in budget.ts, which is why both exist.
 */

export type RateLimitDecision =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

export type TokenBucketOptions = {
  /** Maximum tokens, and the size of an initial burst. */
  burst: number;
  /** Milliseconds to earn one token back. */
  refillMs: number;
  /** Keys kept before the least recently used are evicted. */
  maxKeys: number;
  now?: () => number;
};

type Bucket = {
  tokens: number;
  updatedAt: number;
};

export type TokenBucketLimiter = {
  take: (key: string) => RateLimitDecision;
  size: () => number;
};

export function createTokenBucketLimiter(
  options: TokenBucketOptions,
): TokenBucketLimiter {
  const { burst, refillMs, maxKeys } = options;
  const now = options.now ?? Date.now;
  // Map preserves insertion order; re-inserting on use makes it an LRU.
  const buckets = new Map<string, Bucket>();

  function evict() {
    while (buckets.size > maxKeys) {
      const oldest = buckets.keys().next().value;
      if (oldest === undefined) return;
      buckets.delete(oldest);
    }
  }

  return {
    take(key) {
      const time = now();
      const existing = buckets.get(key);
      const bucket: Bucket = existing
        ? {
            tokens: Math.min(
              burst,
              existing.tokens + Math.max(0, time - existing.updatedAt) / refillMs,
            ),
            updatedAt: time,
          }
        : { tokens: burst, updatedAt: time };

      buckets.delete(key);

      if (bucket.tokens < 1) {
        buckets.set(key, bucket);
        evict();

        return {
          allowed: false,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil(((1 - bucket.tokens) * refillMs) / 1000),
          ),
        };
      }

      bucket.tokens -= 1;
      buckets.set(key, bucket);
      evict();

      return { allowed: true, remaining: Math.floor(bucket.tokens) };
    },
    size: () => buckets.size,
  };
}

/**
 * Client IP for rate limiting. Never logged, never stored beyond the
 * in-memory bucket map.
 */
export function clientKeyFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const candidate = forwarded || headers.get("x-real-ip")?.trim() || "";

  // Bound the key so a forged header cannot bloat the map.
  return candidate && candidate.length <= 64 ? candidate : "unknown";
}
