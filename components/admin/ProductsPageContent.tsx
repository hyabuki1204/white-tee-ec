"use client";

import { useMemo, useState } from "react";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { ADMIN_COPY } from "@/lib/admin/copy";
import {
  adminField,
  adminInput,
  adminLabel,
  adminMuted,
  adminSection,
} from "@/lib/admin/ui";
import type { AdminProductListItem } from "@/types/admin-product";

type ProductsPageContentProps = {
  products: AdminProductListItem[];
};

type PublishFilter = "all" | "published" | "draft";

function matchesQuery(product: AdminProductListItem, query: string): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return (
    product.name.toLowerCase().includes(normalized) ||
    product.slug.toLowerCase().includes(normalized)
  );
}

export function ProductsPageContent({ products }: ProductsPageContentProps) {
  const copy = ADMIN_COPY.products;
  const [query, setQuery] = useState("");
  const [publishFilter, setPublishFilter] = useState<PublishFilter>("all");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const publishMatches =
        publishFilter === "all" ||
        (publishFilter === "published" && product.isPublished) ||
        (publishFilter === "draft" && !product.isPublished);

      return publishMatches && matchesQuery(product, query);
    });
  }, [products, query, publishFilter]);

  return (
    <div className="space-y-6">
      <div className={`${adminSection} space-y-6`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className={adminField}>
            <span className={adminLabel}>{copy.search}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
              className={`${adminInput} sm:w-72`}
            />
          </label>

          <label className={adminField}>
            <span className={adminLabel}>{copy.filterStatus}</span>
            <select
              value={publishFilter}
              onChange={(event) =>
                setPublishFilter(event.target.value as PublishFilter)
              }
              className={`${adminInput} sm:w-44`}
            >
              <option value="all">{ADMIN_COPY.common.all}</option>
              <option value="published">{copy.published}</option>
              <option value="draft">{copy.draft}</option>
            </select>
          </label>
        </div>

        <p className={adminMuted}>
          {copy.showing(filteredProducts.length, products.length)}
        </p>
      </div>

      <ProductsTable products={filteredProducts} />
    </div>
  );
}
