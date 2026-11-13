/**
 * Hard limits for the public concierge endpoint.
 *
 * The endpoint is unauthenticated and can spend money, so every number here
 * is a ceiling on what one caller — or all callers together — can cost.
 */
export const CONCIERGE_LIMITS = {
  /** Request body, in bytes. Checked before JSON parsing. */
  maxBodyBytes: 16_000,
  /** One customer message, in characters. */
  maxMessageChars: 500,
  /** One echoed concierge line, in characters (client-supplied, so capped). */
  maxAssistantChars: 800,
  /** Turns accepted in a request; anything longer is rejected outright. */
  maxTurnsAccepted: 24,
  /** Most recent turns actually used (rules) or sent upstream (model). */
  maxTurnsKept: 12,
  /** All kept turns together, in characters. Older turns drop first. */
  maxTotalChars: 4_000,

  /** Per-IP token bucket: burst size. */
  rateBurst: 8,
  /** Per-IP token bucket: one token back every N ms (7.5 requests/minute). */
  rateRefillMs: 8_000,
  /** Buckets held in memory before the oldest are evicted. */
  rateMaxKeys: 5_000,

  /** Default for CONCIERGE_DAILY_LIMIT: model calls per day (JST). */
  defaultDailyLimit: 300,

  /** Output ceiling for one model call, thinking included. */
  maxOutputTokens: 1_024,
  /** Upstream timeout. Past this the rules path answers instead. */
  modelTimeoutMs: 12_000,

  /** Text returned to the browser, in characters. */
  maxReplyChars: 700,
  maxReasonChars: 320,
  maxFollowUpChars: 200,
} as const;

export const DEFAULT_CONCIERGE_MODEL = "claude-haiku-5-5";

/** Sizes at or below this many units are shown as low stock. */
export const LOW_STOCK_THRESHOLD = 3;
