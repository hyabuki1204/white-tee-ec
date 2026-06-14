import { OrdersTableRow } from "@/components/admin/OrdersTableRow";
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
  if (orders.length === 0) {
    const hasFilters = query.trim().length > 0 || statusFilter !== "all";

    return (
      <p className="py-12 text-center text-sm font-light text-neutral-500">
        {hasFilters ? "No orders match your filters." : "No orders yet."}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-neutral-200/70">
            <th className="pb-5 pr-6 text-xs font-light tracking-wide text-neutral-500">
              Order ID
            </th>
            <th className="pb-5 pr-6 text-xs font-light tracking-wide text-neutral-500">
              Email
            </th>
            <th className="pb-5 pr-6 text-xs font-light tracking-wide text-neutral-500">
              Date
            </th>
            <th className="pb-5 pr-6 text-xs font-light tracking-wide text-neutral-500">
              Total
            </th>
            <th className="pb-5 pr-6 text-xs font-light tracking-wide text-neutral-500">
              Status
            </th>
            <th className="pb-5 text-xs font-light tracking-wide text-neutral-500">
              Payment
            </th>
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
