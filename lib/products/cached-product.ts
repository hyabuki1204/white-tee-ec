import "server-only";

import { cache } from "react";
import { getProductBySlug } from "@/lib/products/queries";

/**
 * One product lookup per request, shared by the product route's layout
 * (existence check), metadata and page.
 */
export const getProductBySlugCached = cache(getProductBySlug);
