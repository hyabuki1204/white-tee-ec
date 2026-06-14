"use client";

import { useMemo, useState } from "react";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { ADMIN_ORDER_STATUSES } from "@/lib/admin/order-status-options";
import { formatAdminLabel } from "@/lib/admin/format";
import { formatPrice } from "@/lib/utils/format-price";
import type { AdminOrderListItem } from "@/types/admin-order";
import type { OrderStatus } from "@/types/database";

type OrdersPageContentProps = {
  orders: AdminOrderListItem[];
};

type StatusFilter = "all" | OrderStatus;

function matchesQuery(order: AdminOrderListItem, query: string): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return (
    order.id.toLowerCase().includes(normalized) ||
    order.id.slice(0, 8).toLowerCase().includes(normalized) ||
    (order.email?.toLowerCase().includes(normalized) ?? false)
  );
}

function exportOrdersCsv(orders: AdminOrderListItem[]) {
  const header = ["order_id", "email", "date", "total", "status", "payment"];
  const rows = orders.map((order) => [
    order.id,
    order.email ?? "",
    order.createdAt,
    String(order.totalAmount),
    order.status,
    order.paymentStatus,
  ]);

  const csv = [header, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `white-tee-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function OrdersPageContent({ orders }: OrdersPageContentProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const statusMatches =
        statusFilter === "all" || order.status === statusFilter;

      return statusMatches && matchesQuery(order, query);
    });
  }, [orders, query, statusFilter]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="block space-y-2">
            <span className="text-xs font-light text-neutral-500">Search</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Order ID or email"
              className="w-full min-w-[14rem] border-b border-neutral-300 bg-transparent py-2 text-xs font-light text-neutral-800 outline-none sm:w-64"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-light text-neutral-500">Status</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="w-full border-b border-neutral-300 bg-transparent py-2 text-xs font-light text-neutral-800 outline-none sm:w-40"
            >
              <option value="all">All</option>
              {ADMIN_ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatAdminLabel(status)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={() => exportOrdersCsv(filteredOrders)}
          disabled={filteredOrders.length === 0}
          className="self-start py-2 text-xs tracking-[0.12em] text-neutral-900 transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:text-neutral-300"
        >
          Export CSV
        </button>
      </div>

      <p className="text-xs font-light text-neutral-500">
        Showing {filteredOrders.length} of {orders.length} orders
        {filteredOrders.length > 0
          ? ` · ${formatPrice(
              filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0),
            )} total`
          : null}
      </p>

      <OrdersTable orders={filteredOrders} query={query} statusFilter={statusFilter} />
    </div>
  );
}
