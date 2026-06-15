const STORAGE_KEY = "wt_last_product_slug";

export function setLastViewedProductSlug(slug: string): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(STORAGE_KEY, slug);
  } catch {
    // ignore quota / private mode
  }
}

export function getLastViewedProductSlug(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
