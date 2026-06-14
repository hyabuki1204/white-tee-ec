/** Site-wide SEO constants (static fallbacks — prefer getSeoSettings() for CMS values). */

export const SITE_NAME = "WHITE TEE";

export const SITE_DESCRIPTION =
  "A minimal brand devoted to white T-shirts — quietly refined.";

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}
