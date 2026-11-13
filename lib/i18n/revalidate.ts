import "server-only";

import { revalidatePath } from "next/cache";
import { LOCALES } from "@/lib/i18n/config";

/**
 * Revalidate a storefront page in every locale.
 *
 * Pages live under `app/[locale]`, so the cached routes are `/ja/products`
 * and `/en/products` — `/products` itself is only a rewrite. Pass the
 * locale-free path, as it appears in the browser on the Japanese site.
 */
export function revalidateStorePath(path: string): void {
  const suffix = path === "/" ? "" : path;

  for (const locale of LOCALES) {
    revalidatePath(`/${locale}${suffix}`);
  }
}
