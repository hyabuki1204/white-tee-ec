import { OrdersTableRow } from "@/components/admin/OrdersTableRow";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { adminEmpty, adminTable, adminTableWrap, adminTh } from "@/lib/admin/ui";
import type { AdminOrderListItem } from "@/types/admin-order";

type OrdersTableProps = {
  orders: AdminOrderListItem[];
  query?: string;
  statusFilter?: string;
};

export function OrdersTable({
  orders,
  query = "",
  statusFilter = "all",
}: OrdersTableProps) {
  const copy = ADMIN_COPY.orders;

  if (orders.length === 0) {
    const hasFilters = query.trim().length > 0 || statusFilter !== "all";

    return (
      <p className={adminEmpty}>
        {hasFilters ? copy.emptyFiltered : copy.empty}
      </p>
    );
  }

  return (
    <div className={adminTableWrap}>
      <table className={adminTable}>
        <thead>
          <tr>
            <th className={adminTh}>{copy.columns.id}</th>
            <th className={adminTh}>{copy.columns.email}</th>
            <th className={adminTh}>{copy.columns.date}</th>
            <th className={adminTh}>{copy.columns.total}</th>
            <th className={adminTh}>{copy.columns.status}</th>
            <th className={adminTh}>{copy.columns.payment}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrdersTableRow key={order.id} order={order} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
