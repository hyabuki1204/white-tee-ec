import type { FabricSpecRow } from "@/lib/fabric/specs";

type ProductFabricSpecsProps = {
  rows: FabricSpecRow[];
};

/** Hairline fabric spec table: 生地 / 重量 / 混率 / 原産. */
export function ProductFabricSpecs({ rows }: ProductFabricSpecsProps) {
  if (rows.length === 0) return null;

  return (
    <table className="mt-8 w-full border-collapse text-left">
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.label}
            className="border-t border-[var(--color-hairline)] last:border-b"
          >
            <th
              scope="row"
              className="w-[30%] py-3 pr-4 text-[14px] font-normal text-[var(--color-ink-soft)]"
            >
              {row.label}
            </th>
            <td className="py-3 text-[14px] font-normal text-[var(--color-ink)]">
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
