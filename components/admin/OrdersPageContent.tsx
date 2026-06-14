"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { formatOrderStatusLabel } from "@/lib/admin/format";
import {
  adminBtnSecondary,
  adminField,
  adminInput,
  adminLabel,
  adminMuted,
  adminSection,
} from "@/lib/admin/ui";
import { ADMIN_ORDER_STATUSES } from "@/lib/admin/order-status-options";
import { formatPrice } from "@/lib/utils/format-price";
import type { AdminOrderListItem } from "@/types/admin-order";
import type { OrderStatus } from "@/types/database";

type OrdersPageContentProps = {
  orders: AdminOrderListItem[];
  total: number;
  page: number;
  pageSize: number;
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

export function OrdersPageContent({
  orders,
  total,
  page,
  pageSize,
}: OrdersPageContentProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const copy = ADMIN_COPY.orders;
  const pagination = ADMIN_COPY.pagination;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const statusMatches =
        statusFilter === "all" || order.status === statusFilter;

      return statusMatches && matchesQuery(order, query);
    });
  }, [orders, query, statusFilter]);

  const filteredTotal = filteredOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams();
    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }
    const qs = params.toString();
    router.push(qs ? `/admin/orders?${qs}` : "/admin/orders");
  };

  return (
    <div className="space-y-6">
      <div className={`${adminSection} space-y-6`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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
              <span className={adminLabel}>{copy.status}</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className={`${adminInput} sm:w-44`}
              >
                <option value="all">{ADMIN_COPY.common.all}</option>
                {ADMIN_ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatOrderStatusLabel(status)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={() => exportOrdersCsv(filteredOrders)}
            disabled={filteredOrders.length === 0}
            className={adminBtnSecondary}
          >
            {copy.exportCsv}
          </button>
        </div>

        <p className={adminMuted}>
          {copy.showing(filteredOrders.length, total)}
          {filteredOrders.length > 0
            ? ` · ${copy.totalAmount(formatPrice(filteredTotal))}`
            : null}
        </p>
      </div>

      <OrdersTable
        orders={filteredOrders}
        query={query}
        statusFilter={statusFilter}
      />

      {totalPages > 1 ? (
        <nav
          className={`${adminSection} flex flex-wrap items-center justify-between gap-4`}
          aria-label={pagination.label}
        >
          <p className={adminMuted}>
            {pagination.pageOf(page, totalPages, total)}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className={adminBtnSecondary}
            >
              {pagination.prev}
            </button>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className={adminBtnSecondary}
            >
              {pagination.next}
            </button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
