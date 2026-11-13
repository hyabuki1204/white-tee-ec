import type { Fabric } from "@/lib/fabric/content";
import { formatWeight, getGaugeSpec } from "@/lib/fabric/gauge";
import type { Locale } from "@/lib/i18n/config";
import { defineCopy } from "@/lib/i18n/define-copy";
import type { Product } from "@/types";

export type FabricSpecRow = {
  label: string;
  value: string;
};

const getSpecCopy = defineCopy(
  {
    fabric: "生地",
    gauge: "ゲージ",
    gaugeValue: (gauge: number) => `${gauge}G（1インチに針${gauge}本）`,
    yarn: "糸",
    structure: "組織",
    weight: "目付",
    composition: "混率",
    origin: "産地",
    originValue: "日本・和歌山",
  },
  {
    fabric: "Fabric",
    gauge: "Gauge",
    gaugeValue: (gauge: number) => `${gauge}G (${gauge} needles per inch)`,
    yarn: "Yarn",
    structure: "Knit",
    weight: "Weight",
    composition: "Composition",
    origin: "Made in",
    originValue: "Wakayama, Japan",
  },
);

/** Spec rows for the PDP fabric table: ゲージ / 糸 / 組織 / 目付 / 混率 / 産地. */
export function getFabricSpecRows(
  product: Product,
  fabric: Fabric | null | undefined,
  locale: Locale,
): FabricSpecRow[] {
  const copy = getSpecCopy(locale);
  const spec = getGaugeSpec(product.fabricSlug, locale);
  const composition = product.material?.trim() || "COTTON 100%";

  if (!spec) {
    return [
      { label: copy.fabric, value: fabric?.name ?? "Cotton Jersey" },
      { label: copy.composition, value: composition },
      { label: copy.origin, value: copy.originValue },
    ];
  }

  return [
    { label: copy.gauge, value: copy.gaugeValue(spec.gauge) },
    { label: copy.yarn, value: spec.yarn },
    { label: copy.structure, value: spec.structure },
    { label: copy.weight, value: formatWeight(spec) },
    { label: copy.composition, value: composition },
    { label: copy.origin, value: copy.originValue },
  ];
}
