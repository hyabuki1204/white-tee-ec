import { notFound } from "next/navigation";
import { getProductBySlugCached } from "@/lib/products/cached-product";

type ProductLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
};

/**
 * Existence check for the product route.
 *
 * `loading.tsx` in this segment wraps the page in a Suspense boundary, and
 * once a fallback has been sent the response is already streaming with a
 * 200 status. This layout sits above that boundary, so an unknown slug is
 * rejected here, before any streaming starts, and the response is a real 404.
 */
export default async function ProductLayout({
  children,
  params,
}: ProductLayoutProps) {
  const { slug } = await params;
  const product = await getProductBySlugCached(slug);

  if (!product) {
    notFound();
  }

  return children;
}
