import { ADMIN_COPY } from "@/lib/admin/copy";
import {
  adminEmpty,
  adminTable,
  adminTableWrap,
  adminTd,
  adminTdMuted,
  adminTh,
} from "@/lib/admin/ui";
import { formatPrice } from "@/lib/utils/format-price";
import type { AdminOrderDetailItem } from "@/types/admin-order";

type OrderItemsTableProps = {
  items: AdminOrderDetailItem[];
};

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  const copy = ADMIN_COPY.orders;

  if (items.length === 0) {
    return <p className={adminEmpty}>{copy.itemsEmpty}</p>;
  }

  return (
    <div className={adminTableWrap}>
      <table className={adminTable}>
        <thead>
          <tr>
            <th className={adminTh}>{copy.itemColumns.product}</th>
            <th className={adminTh}>{copy.itemColumns.size}</th>
            <th className={adminTh}>{copy.itemColumns.qty}</th>
            <th className={adminTh}>{copy.itemColumns.unitPrice}</th>
            <th className={adminTh}>{copy.itemColumns.subtotal}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className={`${adminTd} font-medium`}>{item.productName}</td>
              <td className={adminTdMuted}>{item.variant}</td>
              <td className={adminTdMuted}>{item.quantity}</td>
              <td className={adminTdMuted}>{formatPrice(item.unitPrice)}</td>
              <td className={`${adminTd} font-medium`}>
                {formatPrice(item.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
