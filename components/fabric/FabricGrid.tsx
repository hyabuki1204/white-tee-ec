import { FabricCard } from "@/components/fabric/FabricCard";
import type { Fabric } from "@/lib/fabric/content";

type FabricGridProps = {
  fabrics: Fabric[];
};

export function FabricGrid({ fabrics }: FabricGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-20 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-28 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-36">
      {fabrics.map((fabric) => (
        <li key={fabric.slug}>
          <FabricCard fabric={fabric} />
        </li>
      ))}
    </ul>
  );
}
