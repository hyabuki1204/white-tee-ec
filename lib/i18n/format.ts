import type { Locale } from "@/lib/i18n/config";

/**
 * Join short spec fragments on one line: "40/2 コーマ糸・240g/m²" in
 * Japanese, "40/2 combed cotton · 240g/m²" in English.
 */
export function joinSpec(
  locale: Locale,
  ...parts: Array<string | null | undefined>
): string {
  return parts.filter(Boolean).join(locale === "en" ? " · " : "・");
}

/** Centimetres as inches, rounded to the nearest quarter: 54 → "21¼". */
export function cmToInches(cm: number): string {
  const quarters = Math.round((cm / 2.54) * 4);
  const whole = Math.floor(quarters / 4);
  const fraction = ["", "¼", "½", "¾"][quarters % 4]!;
  return `${whole}${fraction}`;
}
