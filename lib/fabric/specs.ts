import type { Fabric } from "@/lib/fabric/content";
import type { Product } from "@/types";

export type FabricSpecRow = {
  label: string;
  value: string;
};

/** Approximate fabric weight by jersey family (g/m²). */
const WEIGHT_BY_FABRIC_SLUG: Record<string, string> = {
  "heavyweight-jersey": "220g/m²",
  "lightweight-jersey": "140g/m²",
  "relaxed-jersey": "180g/m²",
  "compact-jersey": "160g/m²",
  "essential-jersey": "170g/m²",
  "box-jersey": "210g/m²",
};

const DEFAULT_ORIGIN = "日本・和歌山";

/** Spec rows for the PDP fabric table: 生地 / 重量 / 混率 / 原産. */
export function getFabricSpecRows(
  product: Product,
  fabric?: Fabric | null,
): FabricSpecRow[] {
  const fabricName = fabric?.name ?? "Cotton Jersey";
  const weight =
    (product.fabricSlug && WEIGHT_BY_FABRIC_SLUG[product.fabricSlug]) ||
    "—";
  const composition = product.material?.trim() || "COTTON 100%";

  return [
    { label: "生地", value: fabricName },
    { label: "重量", value: weight },
    { label: "混率", value: composition },
    { label: "原産", value: DEFAULT_ORIGIN },
  ];
}
