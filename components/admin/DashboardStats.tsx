import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { formatAdminListDate } from "@/lib/admin/format";
import type { DashboardStats } from "@/lib/admin/dashboard-stats";
import {
  adminLink,
  adminMuted,
  adminSection,
  adminSectionTitle,
  adminTable,
  adminTableWrap,
  adminTd,
  adminTh,
} from "@/lib/admin/ui";
import { formatPrice } from "@/lib/utils/format-price";

type DashboardStatsProps = {
  stats: DashboardStats;
};

export function DashboardStats({ stats }: DashboardStatsProps) {
  const copy = ADMIN_COPY.dashboard.stats;

  return (
    <div className="mb-8 grid gap-6 lg:grid-cols-3">
      <section className={adminSection}>
        <h2 className={adminSectionTitle}>{copy.unshipped}</h2>
        <p className="text-3xl font-semibold text-neutral-900">
          {stats.unshippedCount}
        </p>
        <p className={`${adminMuted} mt-2`}>{copy.unshippedHint}</p>
      </section>

      <section className={`${adminSection} lg:col-span-2`}>
        <h2 className={adminSectionTitle}>{copy.lowStock}</h2>
        {stats.lowStockProducts.length === 0 ? (
          <p className={adminMuted}>{copy.lowStockEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {stats.lowStockProducts.map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-4">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className={`${adminLink} font-medium no-underline hover:underline`}
                >
                  {product.name}
                </Link>
                <span className={adminMuted}>
                  {copy.stockRemaining(product.totalStock)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`${adminSection} lg:col-span-3`}>
        <h2 className={adminSectionTitle}>{copy.recentOrders}</h2>
        {stats.recentOrders.length === 0 ? (
          <p className={adminMuted}>{copy.recentOrdersEmpty}</p>
        ) : (
          <div className={adminTableWrap}>
            <table className={adminTable}>
              <thead>
                <tr>
                  <th className={adminTh}>{ADMIN_COPY.orders.columns.id}</th>
                  <th className={adminTh}>{ADMIN_COPY.orders.columns.email}</th>
                  <th className={adminTh}>{ADMIN_COPY.orders.columns.date}</th>
                  <th className={adminTh}>{ADMIN_COPY.orders.columns.total}</th>
                  <th className={adminTh}>{ADMIN_COPY.orders.columns.status}</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className={adminTd}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className={`${adminLink} font-medium no-underline hover:underline`}
                      >
                        {order.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className={adminTd}>{order.email ?? "—"}</td>
                    <td className={adminTd}>
                      {formatAdminListDate(order.createdAt)}
                    </td>
                    <td className={adminTd}>{formatPrice(order.totalAmount)}</td>
                    <td className={adminTd}>
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
