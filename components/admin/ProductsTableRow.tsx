import Link from "next/link";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { formatAdminListDate } from "@/lib/admin/format";
import { adminLink, adminTd, adminTdMuted } from "@/lib/admin/ui";
import { formatPrice } from "@/lib/utils/format-price";
import type { AdminProductListItem } from "@/types/admin-product";

type ProductsTableRowProps = {
  product: AdminProductListItem;
};

export function ProductsTableRow({ product }: ProductsTableRowProps) {
  const copy = ADMIN_COPY.products;

  return (
    <tr className="hover:bg-neutral-50">
      <td className={adminTd}>
        <Link
          href={`/admin/products/${product.id}/edit`}
          className={`${adminLink} font-medium no-underline hover:underline`}
        >
          {product.name}
        </Link>
        <p className="mt-1 text-xs text-neutral-500">{product.slug}</p>
      </td>
      <td className={`${adminTd} font-medium`}>{formatPrice(product.price)}</td>
      <td className={adminTdMuted}>{product.totalStock}</td>
      <td className={adminTdMuted}>
        {product.isPublished ? copy.published : copy.draft}
      </td>
      <td className={adminTdMuted}>{formatAdminListDate(product.updatedAt)}</td>
    </tr>
  );
}
