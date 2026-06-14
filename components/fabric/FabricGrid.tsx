import { FabricCard } from "@/components/fabric/FabricCard";
import type { Fabric } from "@/lib/fabric/content";

type FabricGridProps = {
  fabrics: Fabric[];
};

export function FabricGrid({ fabrics }: FabricGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-24 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-28 lg:grid-cols-3 lg:gap-x-9 lg:gap-y-32">
      {fabrics.map((fabric) => (
        <li key={fabric.slug}>
          <FabricCard fabric={fabric} />
        </li>
      ))}
    </ul>
  );
}
