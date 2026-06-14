import Link from "next/link";
import { formatAdminListDate } from "@/lib/admin/format";
import { formatPrice } from "@/lib/utils/format-price";
import type { AdminProductListItem } from "@/types/admin-product";

type ProductsTableRowProps = {
  product: AdminProductListItem;
};

export function ProductsTableRow({ product }: ProductsTableRowProps) {
  return (
    <tr className="border-b border-neutral-100 last:border-0">
      <td className="py-5 pr-6">
        <Link
          href={`/admin/products/${product.id}/edit`}
          className="text-xs font-light text-neutral-900 transition-opacity hover:opacity-60"
        >
          {product.name}
        </Link>
        <p className="mt-1 text-[10px] font-light text-neutral-400">
          {product.slug}
        </p>
      </td>
      <td className="py-5 pr-6 text-xs font-light text-neutral-600">
        {formatPrice(product.price)}
      </td>
      <td className="py-5 pr-6 text-xs font-light text-neutral-600">
        {product.isPublished ? "Published" : "Draft"}
      </td>
      <td className="py-5 text-xs font-light text-neutral-500">
        {formatAdminListDate(product.updatedAt)}
      </td>
    </tr>
  );
}
