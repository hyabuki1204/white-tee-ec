import type {
  AboutPageContent,
  ContactPageContent,
  HomePageContent,
  LegalBusinessContent,
  PolicyPageContent,
  SeoSettingsContent,
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

function parseTuple2(value: unknown, field: string): ParseResult<[string, string]> {
  const parsed = parseStringArray(value, field);
  if (!parsed.ok) return parsed;

  if (parsed.data.length !== 2) {
    return { ok: false, error: `${field} must contain exactly 2 lines.` };
  }

  return { ok: true, data: [parsed.data[0], parsed.data[1]] };
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

  const conceptLines = parseTuple2(input.conceptLines, "Concept lines");
  if (!conceptLines.ok) return conceptLines;

  const fabricIntroLines = parseTuple2(input.fabricIntroLines, "Fabric intro lines");
  if (!fabricIntroLines.ok) return fabricIntroLines;

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

  const fabricPreviewCount = Number(input.fabricPreviewCount);

  if (
    !Number.isInteger(fabricPreviewCount) ||
    fabricPreviewCount < 1 ||
    fabricPreviewCount > 12
  ) {
    return {
      ok: false,
      error: "Fabric preview count must be between 1 and 12.",
    };
  }

  const featuredProductSlugs = Array.isArray(input.featuredProductSlugs)
    ? input.featuredProductSlugs.filter(
        (slug): slug is string => typeof slug === "string" && slug.trim().length > 0,
      )
    : [];

  return {
    ok: true,
    data: {
      heroImage: heroImage.data,
      heroCopy: heroCopy.data,
      conceptLines: conceptLines.data,
      featuredProductCount,
      fabricPreviewCount,
      fabricIntroLines: fabricIntroLines.data,
      featuredProductSlugs,
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

  const introLines = parseTuple2(input.introLines, "Intro lines");
  if (!introLines.ok) return introLines;

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
      introLines: introLines.data,
      entries,
    },
  };
}

function parsePolicyContentInput(
  value: unknown,
  label: string,
): ParseResult<PolicyPageContent> {
  if (!value || typeof value !== "object") {
    return { ok: false, error: `Invalid ${label} content payload.` };
  }

  const input = value as Record<string, unknown>;
  const pageTitle = requireString(input.pageTitle, "Page title");
  if (!pageTitle.ok) return pageTitle;

  if (!Array.isArray(input.sections) || input.sections.length === 0) {
    return { ok: false, error: "Sections are required." };
  }

  const sections: PolicyPageContent["sections"] = [];

  for (const section of input.sections) {
    if (!section || typeof section !== "object") {
      return { ok: false, error: "Each section must be an object." };
    }

    const row = section as Record<string, unknown>;
    const title = requireString(row.title, "Section title");
    if (!title.ok) return title;

    const body = requireString(row.body, "Section body");
    if (!body.ok) return body;

    sections.push({ title: title.data, body: body.data });
  }

  return {
    ok: true,
    data: {
      pageTitle: pageTitle.data,
      sections,
    },
  };
}

export function parseLegalContentInput(
  value: unknown,
): ParseResult<LegalBusinessContent> {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Invalid legal content payload." };
  }

  const input = value as Record<string, unknown>;
  const operator = requireString(input.operator, "Operator");
  if (!operator.ok) return operator;

  const address = requireString(input.address, "Address");
  if (!address.ok) return address;

  const email = requireString(input.email, "Email");
  if (!email.ok) return email;

  const phone = requireString(input.phone, "Phone");
  if (!phone.ok) return phone;

  return {
    ok: true,
    data: {
      operator: operator.data,
      address: address.data,
      email: email.data,
      phone: phone.data,
    },
  };
}

export function parseContactContentInput(
  value: unknown,
): ParseResult<ContactPageContent> {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Invalid contact content payload." };
  }

  const input = value as Record<string, unknown>;
  const introLines = parseTuple2(input.introLines, "Intro lines");
  if (!introLines.ok) return introLines;

  const email = requireString(input.email, "Email");
  if (!email.ok) return email;

  const hours = requireString(input.hours, "Hours");
  if (!hours.ok) return hours;

  return {
    ok: true,
    data: {
      introLines: introLines.data,
      email: email.data,
      hours: hours.data,
    },
  };
}

export function parseShippingContentInput(value: unknown) {
  return parsePolicyContentInput(value, "shipping");
}

export function parsePrivacyContentInput(value: unknown) {
  return parsePolicyContentInput(value, "privacy");
}

export function parseTermsContentInput(value: unknown) {
  return parsePolicyContentInput(value, "terms");
}

export function parseSeoContentInput(
  value: unknown,
): ParseResult<SeoSettingsContent> {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Invalid SEO content payload." };
  }

  const input = value as Record<string, unknown>;
  const siteName = requireString(input.siteName, "Site name");
  if (!siteName.ok) return siteName;

  const siteDescription = requireString(input.siteDescription, "Site description");
  if (!siteDescription.ok) return siteDescription;

  const defaultOgpImage = requireString(input.defaultOgpImage, "Default OGP image");
  if (!defaultOgpImage.ok) return defaultOgpImage;

  const twitterHandle =
    input.twitterHandle === null || input.twitterHandle === undefined
      ? null
      : typeof input.twitterHandle === "string"
        ? input.twitterHandle.trim() || null
        : null;

  return {
    ok: true,
    data: {
      siteName: siteName.data,
      siteDescription: siteDescription.data,
      defaultOgpImage: defaultOgpImage.data,
      twitterHandle,
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
    case "legal":
      return parseLegalContentInput(value);
    case "contact":
      return parseContactContentInput(value);
    case "shipping":
      return parseShippingContentInput(value);
    case "privacy":
      return parsePrivacyContentInput(value);
    case "terms":
      return parseTermsContentInput(value);
    case "seo":
      return parseSeoContentInput(value);
    default:
      return { ok: false, error: "Unknown content key." };
  }
}
