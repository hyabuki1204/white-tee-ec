import Link from "next/link";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { formatAdminListDate } from "@/lib/admin/format";
import {
  adminEmpty,
  adminLink,
  adminTable,
  adminTableWrap,
  adminTd,
  adminTdMuted,
  adminTh,
} from "@/lib/admin/ui";
import type { PendingRestockGroup } from "@/lib/db/restock/repository";

type RestockRequestsTableProps = {
  groups: PendingRestockGroup[];
};

const copy = ADMIN_COPY.restock;

function stateLabel(group: PendingRestockGroup): string {
  if (!group.isPublished) return copy.state.unpublished;
  return (group.stockQuantity ?? 0) > 0 ? copy.state.ready : copy.state.waiting;
}

/** Read-only: counts per product and size. No addresses, no send button. */
export function RestockRequestsTable({ groups }: RestockRequestsTableProps) {
  if (groups.length === 0) {
    return <p className={adminEmpty}>{copy.empty}</p>;
  }

  return (
    <div className={adminTableWrap}>
      <table className={adminTable}>
        <thead>
          <tr>
            <th className={adminTh}>{copy.columns.product}</th>
            <th className={adminTh}>{copy.columns.size}</th>
            <th className={adminTh}>{copy.columns.count}</th>
            <th className={adminTh}>{copy.columns.stock}</th>
            <th className={adminTh}>{copy.columns.oldest}</th>
            <th className={adminTh}>{copy.columns.state}</th>
            <th className={adminTh} />
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr
              key={`${group.productId}-${group.size}`}
              className="hover:bg-neutral-50"
            >
              <td className={`${adminTd} font-medium`}>
                {group.productName}
                {group.productSlug ? (
                  <p className="mt-1 text-xs font-normal text-neutral-500">
                    {group.productSlug}
                  </p>
                ) : null}
              </td>
              <td className={adminTd}>{group.size}</td>
              <td className={`${adminTd} font-medium tabular-nums`}>
                {group.count}
              </td>
              <td className={`${adminTdMuted} tabular-nums`}>
                {group.stockQuantity ?? copy.stockRemoved}
              </td>
              <td className={adminTdMuted}>
                {formatAdminListDate(group.oldestRequestAt)}
              </td>
              <td className={adminTdMuted}>{stateLabel(group)}</td>
              <td className={adminTd}>
                <Link
                  href={`/admin/products/${group.productId}/edit`}
                  className={adminLink}
                >
                  {copy.editProduct}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
