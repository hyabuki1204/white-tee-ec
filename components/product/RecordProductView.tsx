"use client";

import { useEffect } from "react";
import { recordRecentlyViewedProduct } from "@/lib/navigation/recently-viewed";

type RecordProductViewProps = {
  slug: string;
};

export function RecordProductView({ slug }: RecordProductViewProps) {
  useEffect(() => {
    recordRecentlyViewedProduct(slug);
  }, [slug]);

  return null;
}
