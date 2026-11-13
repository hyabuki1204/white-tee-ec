/**
 * Detecting Japanese in text that is meant to be English.
 *
 * Used by the unit tests (English dictionaries) and by
 * `scripts/check-english-routes.mts` (rendered English pages).
 */

/**
 * Hiragana, Katakana (incl. the middle dot ・ and the long-vowel mark),
 * CJK ideographs, CJK punctuation (、。「」〜 …) and full-width forms
 * (（）：！ …). The ideographic space and the yen sign are not included.
 */
const JAPANESE =
  /[、-〿぀-ゟ゠-ヿ㐀-䶿一-鿿！-ﾟ]/;

const JAPANESE_RUN =
  /[、-〿぀-ゟ゠-ヿ㐀-䶿一-鿿！-ﾟ][　-〿぀-ゟ゠-ヿ㐀-䶿一-鿿！-ﾟ\w\d\s%.,:/+-]*/g;

/**
 * Strings that may appear in Japanese on an English page: the mill's
 * registered name (beside its romanisation) and its postal address
 * (beside the English version).
 */
export const ALLOWED_JAPANESE = [
  "カネマサ莫大小株式会社",
  "〒641-0007 和歌山県和歌山市小雑賀129",
] as const;

export function containsJapanese(text: string): boolean {
  return JAPANESE.test(text);
}

/**
 * Every run of Japanese in `text`, after removing the allow-listed strings.
 * Each allow-listed string is forgiven at most `maxAllowed` times: a second
 * occurrence is reported.
 */
export function findJapanese(
  text: string,
  options: { allow?: readonly string[]; maxAllowed?: number } = {},
): string[] {
  const { allow = ALLOWED_JAPANESE, maxAllowed = 1 } = options;
  let remaining = text;

  for (const phrase of allow) {
    for (let count = 0; count < maxAllowed; count += 1) {
      const index = remaining.indexOf(phrase);
      if (index === -1) break;
      remaining =
        remaining.slice(0, index) + " " + remaining.slice(index + phrase.length);
    }
  }

  return [...remaining.matchAll(JAPANESE_RUN)].map((match) => match[0].trim());
}

/**
 * Every string reachable from a dictionary value. Functions are called with
 * sample arguments (a number for numeric parameters would also do: the
 * templates only interpolate them).
 */
export function collectStrings(value: unknown, samples: unknown[] = ["M", 2]): string[] {
  if (typeof value === "string") return [value];

  if (typeof value === "function") {
    const results: string[] = [];

    for (const sample of samples) {
      try {
        const args = Array.from({ length: Math.max(value.length, 1) }, () => sample);
        results.push(...collectStrings((value as (...a: unknown[]) => unknown)(...args), samples));
      } catch {
        // A template that cannot take this sample is covered by the other.
      }
    }

    return results;
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectStrings(item, samples));
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap((item) => collectStrings(item, samples));
  }

  return [];
}
