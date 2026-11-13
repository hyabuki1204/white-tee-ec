import { FabricCard } from "@/components/fabric/FabricCard";
import type { Fabric } from "@/lib/fabric/content";
import type { Locale } from "@/lib/i18n/config";

type FabricGridProps = {
  locale: Locale;
  fabrics: Fabric[];
  productCountBySlug?: Record<string, number>;
};

export function FabricGrid({
  locale,
  fabrics,
  productCountBySlug,
}: FabricGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-x-7 gap-y-20 sm:grid-cols-2 sm:gap-x-9 sm:gap-y-24 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-32">
      {fabrics.map((fabric) => (
        <li key={fabric.slug}>
          <FabricCard
            locale={locale}
            fabric={fabric}
            productCount={productCountBySlug?.[fabric.slug]}
          />
        </li>
      ))}
    </ul>
  );
}
