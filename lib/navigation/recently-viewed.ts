const STORAGE_KEY = "wt_recently_viewed";
const MAX_ITEMS = 4;

export type RecentlyViewedEntry = {
  slug: string;
  viewedAt: number;
};

function readEntries(): RecentlyViewedEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (entry): entry is RecentlyViewedEntry =>
          typeof entry === "object" &&
          entry !== null &&
          typeof (entry as RecentlyViewedEntry).slug === "string" &&
          typeof (entry as RecentlyViewedEntry).viewedAt === "number",
      )
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function writeEntries(entries: RecentlyViewedEntry[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ITEMS)));
  } catch {
    // ignore quota / private mode
  }
}

/** Record a product view (most recent first, max 4 unique slugs). */
export function recordRecentlyViewedProduct(slug: string): void {
  const trimmed = slug.trim();

  if (!trimmed) {
    return;
  }

  const withoutCurrent = readEntries().filter((entry) => entry.slug !== trimmed);
  writeEntries([{ slug: trimmed, viewedAt: Date.now() }, ...withoutCurrent]);
}

/** Slugs for recently viewed products, excluding the current PDP slug. */
export function getRecentlyViewedSlugs(excludeSlug?: string): string[] {
  const entries = readEntries();
  const exclude = excludeSlug?.trim();

  return entries
    .filter((entry) => !exclude || entry.slug !== exclude)
    .map((entry) => entry.slug)
    .slice(0, MAX_ITEMS);
}
