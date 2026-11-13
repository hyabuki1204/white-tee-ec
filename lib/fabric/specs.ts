import type { Fabric } from "@/lib/fabric/content";
import { formatWeight, getGaugeSpec } from "@/lib/fabric/gauge";
import type { Product } from "@/types";

export type FabricSpecRow = {
  label: string;
  value: string;
};

const DEFAULT_ORIGIN = "日本・和歌山";

/** Spec rows for the PDP fabric table: ゲージ / 糸 / 組織 / 目付 / 混率 / 産地. */
export function getFabricSpecRows(
  product: Product,
  fabric?: Fabric | null,
): FabricSpecRow[] {
  const spec = getGaugeSpec(product.fabricSlug);
  const composition = product.material?.trim() || "COTTON 100%";

  if (!spec) {
    return [
      { label: "生地", value: fabric?.name ?? "Cotton Jersey" },
      { label: "混率", value: composition },
      { label: "産地", value: DEFAULT_ORIGIN },
    ];
  }

  return [
    { label: "ゲージ", value: `${spec.gauge}G（1インチに針${spec.gauge}本）` },
    { label: "糸", value: spec.yarn },
    { label: "組織", value: spec.structure },
    { label: "目付", value: formatWeight(spec) },
    { label: "混率", value: composition },
    { label: "産地", value: DEFAULT_ORIGIN },
  ];
}
