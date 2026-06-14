import { ProductsTableRow } from "@/components/admin/ProductsTableRow";
import type { AdminProductListItem } from "@/types/admin-product";

type ProductsTableProps = {
  products: AdminProductListItem[];
};

export function ProductsTable({ products }: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-sm font-light text-neutral-500">
        No products yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-neutral-200/70">
            <th className="pb-5 pr-6 text-xs font-light tracking-wide text-neutral-500">
              Product
            </th>
            <th className="pb-5 pr-6 text-xs font-light tracking-wide text-neutral-500">
              Price
            </th>
            <th className="pb-5 pr-6 text-xs font-light tracking-wide text-neutral-500">
              Status
            </th>
            <th className="pb-5 text-xs font-light tracking-wide text-neutral-500">
              Updated
            </th>
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
