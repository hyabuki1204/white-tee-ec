/**
 * Guardrails around what leaves this system and what reaches the provider.
 *
 * Checked on the way in (the brief a human wrote) and on the way out
 * (the prompt Claude produced), because either can introduce a name that
 * should not be sent to a third-party image API.
 *
 * See docs/image-generation-workflow.md §5.7.
 */

/**
 * Terms that must not reach an image provider.
 *
 * Two separate concerns share one list. Real brands and real people are a
 * rights and likeness problem. Logo and wordmark requests are a brand
 * problem: WHITE TEE does not put marks on its garments, so a generated
 * one is always wrong.
 */
const BANNED_TERMS: readonly string[] = [
  // Competitor and adjacent brands
  "uniqlo",
  "muji",
  "無印",
  "gu ",
  "supreme",
  "nike",
  "adidas",
  "gucci",
  "prada",
  "hermes",
  "louis vuitton",
  "comme des garcons",
  "issey miyake",
  // Marks of any kind
  "logo",
  "wordmark",
  "brand mark",
  "ロゴ",
  // Likeness
  "celebrity",
  "famous person",
  "portrait of a real",
  "芸能人",
  "有名人",
];

export type GuardrailViolation = {
  term: string;
  where: "brief" | "prompt";
};

export class GuardrailError extends Error {
  readonly violations: GuardrailViolation[];

  constructor(violations: GuardrailViolation[]) {
    super(
      `Blocked by guardrails: ${violations
        .map((v) => `"${v.term}" in ${v.where}`)
        .join(", ")}.`,
    );
    this.name = "GuardrailError";
    this.violations = violations;
  }
}

export function findBannedTerms(
  text: string,
  where: GuardrailViolation["where"],
): GuardrailViolation[] {
  const haystack = text.toLowerCase();

  return BANNED_TERMS.filter((term) => haystack.includes(term)).map((term) => ({
    term,
    where,
  }));
}

export function assertNoBannedTerms(
  text: string,
  where: GuardrailViolation["where"],
): void {
  const violations = findBannedTerms(text, where);

  if (violations.length > 0) {
    throw new GuardrailError(violations);
  }
}

/**
 * Unreleased details must not be sent to a third-party provider.
 *
 * Advisory rather than blocking: prices and dates are legitimate in a brief
 * ("shoot this for the autumn drop"), and a hard block would train people
 * to work around it. The warnings surface in the admin UI instead.
 */
const UNRELEASED_HINT_PATTERNS: readonly { pattern: RegExp; hint: string }[] = [
  {
    pattern: /[¥$]\s?\d{3,}|\d{3,}\s?円/u,
    hint: "This brief mentions a price. Prices do not affect the image and should not be sent to a third-party provider.",
  },
  {
    pattern: /\b20\d{2}[-/年]\s?\d{1,2}\s?[-/月]/u,
    hint: "This brief mentions a specific date. Consider removing it if the launch is not public yet.",
  },
  {
    pattern: /未発売|発売前|unreleased|not yet launched/iu,
    hint: "This brief refers to unreleased work. Keep unpublished product details out of the prompt.",
  },
];

export function findUnreleasedInfoWarnings(text: string): string[] {
  return UNRELEASED_HINT_PATTERNS.filter(({ pattern }) =>
    pattern.test(text),
  ).map(({ hint }) => hint);
}
