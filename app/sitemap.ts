import type { MetadataRoute } from "next";
import { getFabricSlugs } from "@/lib/fabric/queries";
import { getAllProductSlugs } from "@/lib/products/queries";
import { getSiteUrl } from "@/lib/seo/site";

const STATIC_PATHS = [
  "",
  "/fabric",
  "/products",
  "/about",
  "/stories",
  "/contact",
  "/shipping",
  "/privacy",
  "/terms",
  "/legal",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const slugs = await getAllProductSlugs();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${baseUrl}/products/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const fabricSlugs = await getFabricSlugs();
  const fabricEntries: MetadataRoute.Sitemap = fabricSlugs.map((slug) => ({
    url: `${baseUrl}/fabric/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [...staticEntries, ...fabricEntries, ...productEntries];
}
