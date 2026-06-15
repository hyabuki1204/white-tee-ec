import { getFabricJaCopy } from "@/lib/i18n/ja-helpers";
import type { Fabric } from "@/lib/fabric/content";

export function attachFabricJaHelpers(fabric: Fabric): Fabric {
  const ja = getFabricJaCopy(fabric.slug);

  if (!ja) {
    return fabric;
  }

  return {
    ...fabric,
    helperJa: fabric.helperJa ?? ja.detailJa,
    taglineJa: fabric.taglineJa ?? ja.taglineJa,
  };
}
