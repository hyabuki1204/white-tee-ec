import type {
  AboutPageContent,
  HomePageContent,
  SiteContentKey,
  SiteContentMap,
  StoriesPageContent,
} from "@/types/site-content";

type ParseResult<T> = { ok: true; data: T } | { ok: false; error: string };

function requireString(value: unknown, field: string): ParseResult<string> {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { ok: false, error: `${field} is required.` };
  }

  return { ok: true, data: value.trim() };
}

function parseStringArray(value: unknown, field: string): ParseResult<string[]> {
  if (!Array.isArray(value) || value.length === 0) {
    return { ok: false, error: `${field} must be a non-empty array.` };
  }

  const strings: string[] = [];

  for (const item of value) {
    if (typeof item !== "string" || item.trim().length === 0) {
      return { ok: false, error: `${field} must contain non-empty strings.` };
    }

    strings.push(item.trim());
  }

  return { ok: true, data: strings };
}

export function parseHomeContentInput(value: unknown): ParseResult<HomePageContent> {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Invalid home content payload." };
  }

  const input = value as Record<string, unknown>;
  const heroImage = requireString(input.heroImage, "Hero image");
  if (!heroImage.ok) return heroImage;

  const heroCopy = requireString(input.heroCopy, "Hero copy");
  if (!heroCopy.ok) return heroCopy;

  const conceptLines = parseStringArray(input.conceptLines, "Concept lines");
  if (!conceptLines.ok) return conceptLines;

  if (conceptLines.data.length !== 2) {
    return { ok: false, error: "Concept lines must contain exactly 2 lines." };
  }

  const featuredProductCount = Number(input.featuredProductCount);

  if (
    !Number.isInteger(featuredProductCount) ||
    featuredProductCount < 1 ||
    featuredProductCount > 12
  ) {
    return {
      ok: false,
      error: "Featured product count must be between 1 and 12.",
    };
  }

  return {
    ok: true,
    data: {
      heroImage: heroImage.data,
      heroCopy: heroCopy.data,
      conceptLines: [conceptLines.data[0], conceptLines.data[1]],
      featuredProductCount,
    },
  };
}

export function parseAboutContentInput(
  value: unknown,
): ParseResult<AboutPageContent> {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Invalid about content payload." };
  }

  const input = value as Record<string, unknown>;
  const headline = requireString(input.headline, "Headline");
  if (!headline.ok) return headline;

  if (!Array.isArray(input.bodyParagraphs) || input.bodyParagraphs.length === 0) {
    return { ok: false, error: "Body paragraphs are required." };
  }

  const bodyParagraphs: string[][] = [];

  for (const paragraph of input.bodyParagraphs) {
    const parsed = parseStringArray(paragraph, "Body paragraph");
    if (!parsed.ok) return parsed;
    bodyParagraphs.push(parsed.data);
  }

  return {
    ok: true,
    data: {
      headline: headline.data,
      bodyParagraphs,
    },
  };
}

export function parseStoriesContentInput(
  value: unknown,
): ParseResult<StoriesPageContent> {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Invalid stories content payload." };
  }

  const input = value as Record<string, unknown>;
  const pageTitle = requireString(input.pageTitle, "Page title");
  if (!pageTitle.ok) return pageTitle;

  const introLines = parseStringArray(input.introLines, "Intro lines");
  if (!introLines.ok) return introLines;

  if (introLines.data.length !== 2) {
    return { ok: false, error: "Intro lines must contain exactly 2 lines." };
  }

  if (!Array.isArray(input.entries) || input.entries.length === 0) {
    return { ok: false, error: "Story entries are required." };
  }

  const entries: StoriesPageContent["entries"] = [];

  for (const entry of input.entries) {
    if (!entry || typeof entry !== "object") {
      return { ok: false, error: "Each story entry must be an object." };
    }

    const row = entry as Record<string, unknown>;
    const id = requireString(row.id, "Story id");
    if (!id.ok) return id;

    const title = requireString(row.title, "Story title");
    if (!title.ok) return title;

    const lines = parseStringArray(row.lines, "Story lines");
    if (!lines.ok) return lines;

    const imageUrl = requireString(row.imageUrl, "Story image URL");
    if (!imageUrl.ok) return imageUrl;

    const imageAlt = requireString(row.imageAlt, "Story image alt");
    if (!imageAlt.ok) return imageAlt;

    entries.push({
      id: id.data,
      title: title.data,
      lines: lines.data,
      imageUrl: imageUrl.data,
      imageAlt: imageAlt.data,
    });
  }

  return {
    ok: true,
    data: {
      pageTitle: pageTitle.data,
      introLines: [introLines.data[0], introLines.data[1]],
      entries,
    },
  };
}

export function parseSiteContentInput(
  key: SiteContentKey,
  value: unknown,
): ParseResult<SiteContentMap[SiteContentKey]> {
  switch (key) {
    case "home":
      return parseHomeContentInput(value);
    case "about":
      return parseAboutContentInput(value);
    case "stories":
      return parseStoriesContentInput(value);
    default:
      return { ok: false, error: "Unknown content key." };
  }
}
