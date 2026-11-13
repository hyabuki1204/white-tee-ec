/**
 * Per-process daily counter. The fallback for the daily budget when
 * Supabase is not configured or not reachable.
 *
 * Like the rate limiter this is per server instance, so on serverless
 * hosting the real ceiling is (instances × limit) and a cold start resets
 * it. It still bounds a single warm instance, which is what a runaway loop
 * against one deployment hits.
 */

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** Calendar day in Japan (the store's day), as YYYY-MM-DD. */
export function jstDayKey(timestampMs: number): string {
  return new Date(timestampMs + JST_OFFSET_MS).toISOString().slice(0, 10);
}

export type DailyCounter = {
  /** Count one use if the limit allows it. */
  tryConsume: (limit: number) => boolean;
  used: () => number;
};

export function createDailyCounter(now: () => number = Date.now): DailyCounter {
  let day = jstDayKey(now());
  let count = 0;

  function roll() {
    const today = jstDayKey(now());

    if (today !== day) {
      day = today;
      count = 0;
    }
  }

  return {
    tryConsume(limit) {
      roll();
      if (limit < 1 || count >= limit) return false;
      count += 1;
      return true;
    },
    used() {
      roll();
      return count;
    },
  };
}
