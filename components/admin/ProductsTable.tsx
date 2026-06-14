import { ProductsTableRow } from "@/components/admin/ProductsTableRow";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { adminEmpty, adminTable, adminTableWrap, adminTh } from "@/lib/admin/ui";
import type { AdminProductListItem } from "@/types/admin-product";

type ProductsTableProps = {
  products: AdminProductListItem[];
};

export function ProductsTable({ products }: ProductsTableProps) {
  const copy = ADMIN_COPY.products;

  if (products.length === 0) {
    return <p className={adminEmpty}>{copy.empty}</p>;
  }

  return (
    <div className={adminTableWrap}>
      <table className={adminTable}>
        <thead>
          <tr>
            <th className={adminTh}>{copy.columns.product}</th>
            <th className={adminTh}>{copy.columns.price}</th>
            <th className={adminTh}>{copy.columns.stock}</th>
            <th className={adminTh}>{copy.columns.status}</th>
            <th className={adminTh}>{copy.columns.updated}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductsTableRow key={product.id} product={product} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
