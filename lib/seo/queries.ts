import "server-only";

import { getSiteContent } from "@/lib/db/content/repository";
import { DEFAULT_SEO_CONTENT } from "@/lib/seo/defaults";
import type { SeoSettingsContent } from "@/types/site-content";

export async function getSeoSettings(): Promise<SeoSettingsContent> {
  return getSiteContent("seo");
}

export { DEFAULT_SEO_CONTENT };
