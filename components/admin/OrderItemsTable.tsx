import { formatPrice } from "@/lib/utils/format-price";
import type { AdminOrderDetailItem } from "@/types/admin-order";

type OrderItemsTableProps = {
  items: AdminOrderDetailItem[];
};

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-sm font-light text-neutral-500">
        No items in this order.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-b border-neutral-200/70">
            <th className="pb-4 text-xs font-light tracking-wide text-neutral-500">
              Product
            </th>
            <th className="pb-4 text-xs font-light tracking-wide text-neutral-500">
              Size
            </th>
            <th className="pb-4 text-xs font-light tracking-wide text-neutral-500">
              Qty
            </th>
            <th className="pb-4 text-xs font-light tracking-wide text-neutral-500">
              Unit Price
            </th>
            <th className="pb-4 text-xs font-light tracking-wide text-neutral-500">
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-neutral-200/40 last:border-b-0"
            >
              <td className="py-5 pr-4 text-xs font-light text-neutral-800">
                {item.productName}
              </td>
              <td className="py-5 pr-4 text-xs font-light text-neutral-600">
                {item.variant}
              </td>
              <td className="py-5 pr-4 text-xs font-light text-neutral-600">
                {item.quantity}
              </td>
              <td className="py-5 pr-4 text-xs font-light text-neutral-600">
                {formatPrice(item.unitPrice)}
              </td>
              <td className="py-5 text-xs font-light text-neutral-800">
                {formatPrice(item.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
